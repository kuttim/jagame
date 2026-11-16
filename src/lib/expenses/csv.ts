import type { Cents } from "@/lib/calculation/money";
import { formatDateEt } from "./format";
import type { GroupSummary } from "./summary";

// CSV for Estonian spreadsheets: semicolon between cells, decimal comma, a
// byte-order mark so Excel reads õ, ä, ö, ü correctly, and CRLF line ends.

export const DELIMITER = ";";
const BOM = "﻿";

/**
 * A cell is text from a person (neutralised, see below) or a value we
 * produced ourselves, such as an amount, which is written as it is.
 */
export type Cell = string | { trusted: string };

/**
 * Spreadsheets run a cell as a formula when it starts with = + - @ or a tab or
 * carriage return. Names and descriptions come from people, so a cell such as
 * `=HYPERLINK(...)` would turn into an attack on whoever opens the file.
 * An apostrophe in front makes the spreadsheet treat it as plain text.
 */
function neutralise(text: string): string {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function quote(text: string): string {
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function csvCell(cell: Cell): string {
  return typeof cell === "string" ? quote(neutralise(cell)) : cell.trusted;
}

/** Rows of cells to a CSV file's text (with byte-order mark). */
export function toCsv(rows: readonly (readonly Cell[])[]): string {
  return BOM + rows.map((row) => row.map(csvCell).join(DELIMITER)).join("\r\n") + "\r\n";
}

/** 1250 -> "12,50", -5 -> "-0,05" (no currency sign, so it stays a number). */
export function centsToCsv(cents: Cents): Cell {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return { trusted: `${sign}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, "0")}` };
}

const SPLIT_LABELS: Record<string, string> = {
  EQUAL: "Võrdselt",
  AMOUNTS: "Summadena",
  PERCENT: "Protsentidena",
};

export type CsvExpense = {
  /** "YYYY-MM-DD" */
  date: string;
  description: string;
  amount: Cents;
  payerName: string;
  splitType: string;
  shares: readonly { memberId: string; amount: Cents }[];
};

/** One row per expense, with a column for each member's share. */
export function expensesCsv(
  members: readonly { id: string; name: string }[],
  expenses: readonly CsvExpense[],
): string {
  const header: Cell[] = [
    "Kuupäev",
    "Kirjeldus",
    "Summa (€)",
    "Maksis",
    "Jagamisviis",
    ...members.map((m) => `Osa: ${m.name}`),
  ];
  const rows = expenses.map((expense): Cell[] => [
    { trusted: formatDateEt(expense.date) },
    expense.description,
    centsToCsv(expense.amount),
    expense.payerName,
    SPLIT_LABELS[expense.splitType] ?? expense.splitType,
    ...members.map((member) => {
      const share = expense.shares.find((s) => s.memberId === member.id);
      return centsToCsv(share?.amount ?? 0);
    }),
  ]);
  return toCsv([header, ...rows]);
}

/** One row per member: what they paid, their share, transfers made and the balance. */
export function balancesCsv(summary: GroupSummary): string {
  const header: Cell[] = [
    "Liige",
    "Maksis (€)",
    "Tema osa (€)",
    "Ülekanded (€)",
    "Saldo (€)",
  ];
  const rows = summary.rows.map((row): Cell[] => [
    row.name,
    centsToCsv(row.paid),
    centsToCsv(row.owed),
    centsToCsv(row.settled),
    centsToCsv(row.balance),
  ]);
  return toCsv([header, ...rows]);
}

export type CsvPayment = {
  /** "YYYY-MM-DD" */
  date: string;
  fromName: string;
  toName: string;
  amount: Cents;
};

/** One row per transfer that has been marked as paid. */
export function paymentsCsv(payments: readonly CsvPayment[]): string {
  const header: Cell[] = ["Kuupäev", "Kellelt", "Kellele", "Summa (€)"];
  const rows = payments.map((p): Cell[] => [
    { trusted: formatDateEt(p.date) },
    p.fromName,
    p.toName,
    centsToCsv(p.amount),
  ]);
  return toCsv([header, ...rows]);
}

/** A file name that is safe in a header: letters and digits, with dashes between words. */
export function safeFileName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug.slice(0, 40) || "grupp";
}
