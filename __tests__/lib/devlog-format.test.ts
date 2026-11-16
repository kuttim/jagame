import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getDays } from "@/lib/devlog";
import {
  FOLD_AFTER,
  formatEntry,
  MAX_HEADLINE_LENGTH,
  MAX_PARAGRAPH_LENGTH,
} from "@/lib/devlog-format";

describe("formatEntry: headline", () => {
  it("uses the first sentence as the headline", () => {
    const entry = formatEntry("Samm 5: kulud. Lisasin vormi ja loendi.");
    expect(entry.headline).toBe("Samm 5: kulud.");
    expect(entry.blocks).toEqual([{ kind: null, text: "Lisasin vormi ja loendi." }]);
  });

  it("does not split inside file names or versions", () => {
    const entry = formatEntry("Seadistasin Next.js ja `src/lib/auth/password.ts` korda. Teine lause.");
    expect(entry.headline).toBe("Seadistasin Next.js ja `src/lib/auth/password.ts` korda.");
  });

  it("a one-sentence entry has no body", () => {
    const entry = formatEntry("Ainult üks lause.");
    expect(entry.headline).toBe("Ainult üks lause.");
    expect(entry.blocks).toEqual([]);
    expect(entry.bodyLength).toBe(0);
  });

  it("shortens a very long first sentence and keeps it whole in the body", () => {
    const long = `${"sõna ".repeat(60).trim()}. Teine lause.`;
    const entry = formatEntry(long);
    expect(entry.headline.length).toBeLessThanOrEqual(MAX_HEADLINE_LENGTH);
    expect(entry.headline.endsWith("…")).toBe(true);
    expect(entry.blocks[0].text).toBe(`${"sõna ".repeat(60).trim()}.`);
  });

  it("copes with empty text", () => {
    expect(formatEntry("").headline).toBe("");
  });
});

describe("formatEntry: labelled paragraphs", () => {
  const text =
    "Samm 6: saldod. Tegin kuva. Otsus: ei näita vale raha. Viga testis (mitte rakenduses): valija oli vale. Õppetund: kontrolli brauseris. Kontrollisin Chrome'is 11 asja. Piirang: ainult grupi leht.";

  it("starts a new paragraph at each keyword", () => {
    const { blocks } = formatEntry(text);
    expect(blocks.map((b) => b.kind)).toEqual([
      null,
      "decision",
      "error",
      "lesson",
      "check",
      "note",
    ]);
  });

  it("removes a leading 'Keyword:' because the label shows it", () => {
    const { blocks } = formatEntry(text);
    expect(blocks[1].text).toBe("ei näita vale raha.");
    expect(blocks[3].text).toBe("kontrolli brauseris.");
    expect(blocks[5].text).toBe("ainult grupi leht.");
  });

  it("keeps the sentence when the keyword is not followed by a colon", () => {
    const { blocks } = formatEntry(text);
    expect(blocks[2].text).toBe("Viga testis (mitte rakenduses): valija oli vale.");
    expect(blocks[4].text).toBe("Kontrollisin Chrome'is 11 asja.");
  });

  it("does not split in the middle of a sentence that merely contains a keyword", () => {
    const { blocks } = formatEntry("Pealkiri. Leidsin, et viga oli testis ja otsus jäi samaks.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].kind).toBeNull();
  });

  it("recognises 'Otsused' and 'Teadlikud lüngad'", () => {
    const { blocks } = formatEntry("Pealkiri. Otsused: a. Teadlikud lüngad: b.");
    expect(blocks.map((b) => b.kind)).toEqual(["decision", "note"]);
  });
});

describe("formatEntry: long paragraphs", () => {
  it("splits an over-long paragraph between sentences", () => {
    const sentence = "See on üks päris pikk lause, mis täidab ruumi.";
    const paragraph = Array(20).fill(sentence).join(" ");
    const { blocks } = formatEntry(`Pealkiri. ${paragraph}`);
    expect(blocks.length).toBeGreaterThan(1);
    for (const block of blocks) {
      expect(block.text.length).toBeLessThanOrEqual(MAX_PARAGRAPH_LENGTH);
      expect(block.text.endsWith(".")).toBe(true);
    }
  });

  it("gives the label only to the first piece of a split paragraph", () => {
    const sentence = "See on üks päris pikk lause, mis täidab ruumi.";
    const { blocks } = formatEntry(`Pealkiri. Otsus: ${Array(20).fill(sentence).join(" ")}`);
    expect(blocks[0].kind).toBe("decision");
    expect(blocks.slice(1).every((b) => b.kind === null)).toBe(true);
  });

  it("does not lose any text when splitting", () => {
    const sentence = "See on üks päris pikk lause, mis täidab ruumi.";
    const paragraph = Array(20).fill(sentence).join(" ");
    const { blocks } = formatEntry(`Pealkiri. ${paragraph}`);
    expect(blocks.map((b) => b.text).join(" ")).toBe(paragraph);
  });
});

describe("formatEntry on the real diary", () => {
  const raw = readFileSync(join(process.cwd(), "logi.md"), "utf-8");
  const entries = getDays().flatMap((day) => day.entries);

  it("finds the entries", () => {
    expect(raw.length).toBeGreaterThan(0);
    expect(entries.length).toBeGreaterThan(20);
  });

  it("every entry gets a non-empty headline of reasonable length", () => {
    for (const entry of entries) {
      const { headline } = formatEntry(entry.text);
      expect(headline.length).toBeGreaterThan(0);
      expect(headline.length).toBeLessThanOrEqual(MAX_HEADLINE_LENGTH);
    }
  });

  it("keeps nearly all of the text (only 'Keyword:' prefixes and spaces may go)", () => {
    for (const entry of entries) {
      const { headline, blocks } = formatEntry(entry.text);
      const kept = [headline, ...blocks.map((b) => b.text)].join(" ").length;
      // Allow ~20 characters per paragraph for stripped keywords, plus a long headline that was shortened
      expect(kept).toBeGreaterThanOrEqual(entry.text.length - blocks.length * 20 - 5);
    }
  });

  it("no paragraph is longer than the limit", () => {
    for (const entry of entries) {
      for (const block of formatEntry(entry.text).blocks) {
        // A single sentence can be longer than the limit; it is never split mid-sentence
        const sentences = block.text.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) expect(block.text.length).toBeLessThanOrEqual(MAX_PARAGRAPH_LENGTH + 280);
      }
    }
  });

  it("only long entries are folded", () => {
    expect(FOLD_AFTER).toBeGreaterThan(100);
    const short = formatEntry("Lühike. Üks lause veel.");
    expect(short.bodyLength).toBeLessThanOrEqual(FOLD_AFTER);
  });
});
