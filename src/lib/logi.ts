import { readFileSync } from "node:fs";
import path from "node:path";

export type LogiEntry = {
  /** Kellaaeg kujul HH:MM */
  time: string;
  /** Kirje põhitekst (võib sisaldada `koodi` märgendeid) */
  text: string;
  /** Idee (tekst pärast 💡 märki) või null */
  idea: string | null;
};

export type LogiDay = {
  /** Kuupäev kujul AAAA-KK-PP; kasutame ka URL-i osana */
  date: string;
  entries: LogiEntry[];
};

const DATE_HEADING = /^##\s+(\d{4}-\d{2}-\d{2})\s*$/;
const ENTRY_START = /^-\s+(\d{1,2}:\d{2})\s+[–-]\s+(.*)$/;

/** Lahutab kirje teksti põhiosaks ja 💡 ideeks. */
function splitIdea(raw: string): Pick<LogiEntry, "text" | "idea"> {
  const i = raw.indexOf("💡");
  if (i === -1) return { text: raw.trim(), idea: null };
  const idea = raw
    .slice(i + "💡".length)
    .replace(/^\s*(Blogi)?idee:\s*/i, "")
    .trim();
  return { text: raw.slice(0, i).trim(), idea: idea || null };
}

/**
 * Parsib logi.md sisu päevadeks (uuemad enne).
 * Puhas funktsioon: ei puutu failisüsteemi.
 */
export function parseLogi(markdown: string): LogiDay[] {
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
      // Taandega rida kuulub eelmise kirje juurde
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

export function getDays(): LogiDay[] {
  const file = path.join(process.cwd(), "logi.md");
  return parseLogi(readFileSync(file, "utf8"));
}

export function getDay(date: string): LogiDay | undefined {
  return getDays().find((d) => d.date === date);
}

/** Eelmine (vanem) ja järgmine (uuem) päev. */
export function getNeighbours(date: string): {
  older?: LogiDay;
  newer?: LogiDay;
} {
  const days = getDays(); // uuemad enne
  const i = days.findIndex((d) => d.date === date);
  if (i === -1) return {};
  return { older: days[i + 1], newer: days[i - 1] };
}

/** Eemaldab `koodimärgendid`, et teksti saaks lühikokkuvõttena näidata. */
export function plainText(text: string): string {
  return text.replace(/`([^`]+)`/g, "$1");
}

/** Lühike kokkuvõte: päeva esimese kirje esimene lause. */
export function summarize(day: LogiDay): string {
  const first = plainText(day.entries[0].text);
  const sentence = first.split(/(?<=[.!?])\s/)[0];
  return sentence.length > 140 ? sentence.slice(0, 137) + "…" : sentence;
}

/** "2026-11-13" -> "13. november 2026" */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("et-EE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "2026-11-13" -> "reede" */
export function weekday(date: string): string {
  return new Intl.DateTimeFormat("et-EE", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
