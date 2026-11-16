import { readFileSync } from "node:fs";
import path from "node:path";

export type DevlogEntry = {
  /** Time of day as HH:MM */
  time: string;
  /** Main text of the entry (may contain `code` spans) */
  text: string;
  /** The idea (text after the 💡 marker), or null */
  idea: string | null;
};

export type DevlogDay = {
  /** Date as YYYY-MM-DD; also used as the URL segment */
  date: string;
  entries: DevlogEntry[];
};

const DATE_HEADING = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/;
const ENTRY_START = /^-\s+(\d{1,2}:\d{2})\s+[–-]\s+(.*)$/;

/** Splits an entry's text into the main text and the 💡 idea. */
function splitIdea(raw: string): Pick<DevlogEntry, "text" | "idea"> {
  const i = raw.indexOf("💡");
  if (i === -1) return { text: raw.trim(), idea: null };
  const idea = raw
    .slice(i + "💡".length)
    .replace(/^\s*(Blogi)?idee:\s*/i, "")
    .trim();
  return { text: raw.slice(0, i).trim(), idea: idea || null };
}

/**
 * Parses the contents of logi.md into days (newest first).
 * A pure function: it does not touch the file system.
 */
export function parseDevlog(markdown: string): DevlogDay[] {
  const rawDays: { date: string; entries: { time: string; raw: string }[] }[] =
    [];
  let day: (typeof rawDays)[number] | null = null;
  let entry: { time: string; raw: string } | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trimEnd();

    const heading = DATE_HEADING.exec(line);
    if (heading) {
      day = { date: heading[1], entries: [] };
      rawDays.push(day);
      entry = null;
      continue;
    }

    if (!day) continue;

    const start = ENTRY_START.exec(line);
    if (start) {
      entry = { time: start[1], raw: start[2] };
      day.entries.push(entry);
    } else if (entry && /^\s+\S/.test(line)) {
      // An indented line continues the previous entry
      entry.raw += " " + line.trim();
    } else {
      entry = null;
    }
  }

  return rawDays
    .filter((d) => d.entries.length > 0)
    .map((d) => ({
      date: d.date,
      entries: d.entries.map((e) => ({ time: e.time, ...splitIdea(e.raw) })),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getDays(): DevlogDay[] {
  const file = path.join(process.cwd(), "logi.md");
  return parseDevlog(readFileSync(file, "utf8"));
}

export function getDay(date: string): DevlogDay | undefined {
  return getDays().find((d) => d.date === date);
}

/** The previous (older) and next (newer) day. */
export function getNeighbours(date: string): {
  older?: DevlogDay;
  newer?: DevlogDay;
} {
  const days = getDays(); // newest first
  const i = days.findIndex((d) => d.date === date);
  if (i === -1) return {};
  return { older: days[i + 1], newer: days[i - 1] };
}

/**
 * A day's entries with the newest first, like the list of days. The file is
 * appended to, so its order is oldest first; this reverses it and leaves the
 * day itself untouched.
 */
export function entriesNewestFirst(day: DevlogDay): DevlogEntry[] {
  return [...day.entries].reverse();
}

/** Strips `code` markers so the text can be shown as a plain summary. */
export function plainText(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1");
}

/** Short summary: the first sentence of the day's first entry. */
export function summarize(day: DevlogDay): string {
  const first = plainText(day.entries[0].text);
  const sentence = first.split(/(?<=[.!?])\s/)[0];
  return sentence.length > 140 ? sentence.slice(0, 137) + "…" : sentence;
}

/** "2026-11-13" -> "13. november 2026" (Estonian, for the UI) */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("et-EE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "2026-11-13" -> "reede" (Estonian, for the UI) */
export function weekday(date: string): string {
  return new Intl.DateTimeFormat("et-EE", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
