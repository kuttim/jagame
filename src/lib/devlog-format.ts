// Makes long diary entries readable: a short headline, then paragraphs with
// labels such as "Viga" or "Otsus". Works on the text only; logi.md is untouched.

export type BlockKind = "decision" | "error" | "lesson" | "check" | "note";

export type Block = {
  /** Set when the paragraph starts with a known keyword (see KEYWORDS) */
  kind: BlockKind | null;
  /** The paragraph; a leading "Keyword:" is removed because the label shows it */
  text: string;
};

export type FormattedEntry = {
  headline: string;
  /** Paragraphs after the headline sentence; empty for a one-sentence entry */
  blocks: Block[];
  /** Total length of the blocks, to decide whether to fold them */
  bodyLength: number;
};

/** The words that begin a new paragraph, and the label each one gets. */
const KEYWORDS: { pattern: string; kind: BlockKind }[] = [
  { pattern: "Otsus(?:ed)?", kind: "decision" },
  { pattern: "Turvaotsus", kind: "decision" },
  { pattern: "Viga", kind: "error" },
  { pattern: "Vead", kind: "error" },
  { pattern: "Õppetund", kind: "lesson" },
  { pattern: "Avastus", kind: "lesson" },
  { pattern: "Kontrollisin", kind: "check" },
  { pattern: "Kontroll", kind: "check" },
  { pattern: "Piirang(?:ud)?", kind: "note" },
  { pattern: "Teadlikud lüngad", kind: "note" },
  { pattern: "Märkus", kind: "note" },
  { pattern: "Tähelepanek", kind: "note" },
  { pattern: "Lahendus", kind: "note" },
];

const KEYWORD_PATTERN = KEYWORDS.map((k) => `(?:${k.pattern})`).join("|");
/** A sentence boundary that is followed by a keyword: the place to start a new paragraph. */
const PARAGRAPH_BREAK = new RegExp(`(?<=[.!?])\\s+(?=(?:${KEYWORD_PATTERN})\\b)`);
const STARTS_WITH_KEYWORD = new RegExp(`^(${KEYWORD_PATTERN})\\b`);
const SENTENCE_END = /(?<=[.!?])\s+/;

export const LABELS: Record<BlockKind, string> = {
  decision: "Otsus",
  error: "Viga",
  lesson: "Õppetund",
  check: "Kontroll",
  note: "Märkus",
};

export const MAX_HEADLINE_LENGTH = 160;

function toBlock(paragraph: string): Block {
  const match = STARTS_WITH_KEYWORD.exec(paragraph);
  if (!match) return { kind: null, text: paragraph };

  const kind = KEYWORDS.find((k) => new RegExp(`^(?:${k.pattern})$`).test(match[1]))?.kind;
  if (!kind) return { kind: null, text: paragraph };

  // "Otsus: ..." -> the label already says it, drop the word. "Kontrollisin
  // Chrome'is ..." keeps its verb, because the sentence needs it.
  const rest = paragraph.slice(match[0].length);
  if (rest.startsWith(":")) return { kind, text: rest.slice(1).trim() };
  return { kind, text: paragraph };
}

/** Cuts at a word boundary and adds "…" if the text is longer than `max`. */
function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** A paragraph longer than this is split between sentences into shorter ones. */
export const MAX_PARAGRAPH_LENGTH = 450;
const CHUNK_TARGET = 280;

/** Splits a long paragraph between sentences into pieces of roughly CHUNK_TARGET characters. */
function chunk(text: string): string[] {
  if (text.length <= MAX_PARAGRAPH_LENGTH) return [text];
  const pieces: string[] = [];
  let current = "";
  for (const sentence of text.split(SENTENCE_END)) {
    current = current ? `${current} ${sentence}` : sentence;
    if (current.length >= CHUNK_TARGET) {
      pieces.push(current);
      current = "";
    }
  }
  if (current) {
    // Do not leave a tiny last piece on its own
    if (pieces.length > 0 && current.length < 80) pieces[pieces.length - 1] += ` ${current}`;
    else pieces.push(current);
  }
  return pieces;
}

/**
 * Splits a log entry into a headline (its first sentence), and the rest as
 * paragraphs. A new paragraph starts wherever a sentence begins with a word
 * like "Otsus", "Viga" or "Õppetund".
 */
export function formatEntry(text: string): FormattedEntry {
  const trimmed = text.trim();
  const [first, ...restSentences] = trimmed.split(SENTENCE_END);
  const rest = restSentences.join(" ").trim();

  const paragraphs = rest ? rest.split(PARAGRAPH_BREAK).map((p) => p.trim()) : [];

  let headline = first;
  // A very long first sentence would not work as a headline; keep it whole in the body.
  if (first.length > MAX_HEADLINE_LENGTH) {
    headline = shorten(first, MAX_HEADLINE_LENGTH);
    paragraphs.unshift(first);
  }

  const blocks = paragraphs
    .filter(Boolean)
    .map(toBlock)
    .flatMap((block) =>
      chunk(block.text).map((piece, i) => ({
        kind: i === 0 ? block.kind : null,
        text: piece,
      })),
    );
  return {
    headline,
    blocks,
    bodyLength: blocks.reduce((sum, block) => sum + block.text.length, 0),
  };
}

/** Entries whose body is longer than this are folded behind "Loe edasi". */
export const FOLD_AFTER = 300;
