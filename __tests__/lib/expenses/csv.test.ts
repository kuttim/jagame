import { describe, expect, it } from "vitest";
import {
  balancesCsv,
  centsToCsv,
  csvCell,
  expensesCsv,
  paymentsCsv,
  safeFileName,
  toCsv,
} from "@/lib/expenses/csv";
import { computeGroupSummary } from "@/lib/expenses/summary";

const BOM = "﻿";

describe("csvCell", () => {
  it("leaves plain text alone", () => {
    expect(csvCell("Õhtusöök")).toBe("Õhtusöök");
  });

  it("quotes text with a delimiter, quote or line break, and doubles quotes", () => {
    expect(csvCell("a;b")).toBe('"a;b"');
    expect(csvCell('ütles "tere"')).toBe('"ütles ""tere"""');
    expect(csvCell("rida 1\nrida 2")).toBe('"rida 1\nrida 2"');
  });

  it("does not quote a plain comma, because the delimiter is a semicolon", () => {
    expect(csvCell("leib, piim")).toBe("leib, piim");
  });

  it.each(["=1+1", "+1", "-1", "@SUM(A1)", "\tx", "\rx", "=HYPERLINK(\"http://x\")"])(
    "neutralises a possible formula: %j",
    (text) => {
      expect(csvCell(text).replace(/^"/, "").startsWith("'")).toBe(true);
    },
  );

  it("only neutralises at the start of the cell", () => {
    expect(csvCell("a=b")).toBe("a=b");
    expect(csvCell("2 - 1")).toBe("2 - 1");
  });

  it("writes trusted values as they are, so negative amounts stay numbers", () => {
    expect(csvCell(centsToCsv(-1500))).toBe("-15,00");
  });
});

describe("centsToCsv", () => {
  it("uses a decimal comma and two decimals", () => {
    expect(centsToCsv(1250)).toEqual({ trusted: "12,50" });
    expect(centsToCsv(5)).toEqual({ trusted: "0,05" });
    expect(centsToCsv(0)).toEqual({ trusted: "0,00" });
    expect(centsToCsv(-5)).toEqual({ trusted: "-0,05" });
    expect(centsToCsv(100000)).toEqual({ trusted: "1000,00" });
  });
});

describe("toCsv", () => {
  it("starts with a byte-order mark, joins with semicolons and ends rows with CRLF", () => {
    expect(toCsv([["a", "b"], ["c", "d"]])).toBe(`${BOM}a;b\r\nc;d\r\n`);
  });
});

const members = [
  { id: "m1", name: "Mari" },
  { id: "m2", name: "Karl" },
];

describe("expensesCsv", () => {
  it("has one row per expense with a share column for each member", () => {
    const csv = expensesCsv(members, [
      {
        date: "2026-11-16",
        description: "Õhtusöök",
        amount: 3000,
        payerName: "Mari",
        splitType: "EQUAL",
        shares: [
          { memberId: "m1", amount: 1500 },
          { memberId: "m2", amount: 1500 },
        ],
      },
      {
        date: "2026-11-17",
        description: "Takso",
        amount: 1000,
        payerName: "Karl",
        splitType: "AMOUNTS",
        shares: [{ memberId: "m2", amount: 1000 }],
      },
    ]);
    expect(csv).toBe(
      `${BOM}Kuupäev;Kirjeldus;Summa (€);Maksis;Jagamisviis;Osa: Mari;Osa: Karl\r\n` +
        "16.11.2026;Õhtusöök;30,00;Mari;Võrdselt;15,00;15,00\r\n" +
        "17.11.2026;Takso;10,00;Karl;Summadena;0,00;10,00\r\n",
    );
  });

  it("neutralises a formula in a description or a name", () => {
    const csv = expensesCsv([{ id: "m1", name: "=cmd" }], [
      {
        date: "2026-11-16",
        description: "=HYPERLINK(\"http://evil\")",
        amount: 100,
        payerName: "+x",
        splitType: "EQUAL",
        shares: [{ memberId: "m1", amount: 100 }],
      },
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("Osa: =cmd"); // does not start the cell, so it is safe
    expect(lines[1]).toContain(";\"'=HYPERLINK(");
    expect(lines[1]).toContain(";'+x;");
  });

  it("is just a header for a group without expenses", () => {
    expect(expensesCsv(members, [])).toBe(
      `${BOM}Kuupäev;Kirjeldus;Summa (€);Maksis;Jagamisviis;Osa: Mari;Osa: Karl\r\n`,
    );
  });
});

describe("balancesCsv", () => {
  it("has one row per member with signed balances", () => {
    const summary = computeGroupSummary(
      members,
      [
        {
          payerId: "m1",
          amount: 3000,
          shares: [
            { memberId: "m1", amount: 1500 },
            { memberId: "m2", amount: 1500 },
          ],
        },
      ],
      [],
    );
    expect(balancesCsv(summary)).toBe(
      `${BOM}Liige;Maksis (€);Tema osa (€);Ülekanded (€);Saldo (€)\r\n` +
        "Mari;30,00;15,00;0,00;15,00\r\n" +
        "Karl;0,00;15,00;0,00;-15,00\r\n",
    );
  });
});

describe("paymentsCsv", () => {
  it("lists each payment", () => {
    expect(
      paymentsCsv([{ date: "2026-11-18", fromName: "Karl", toName: "Mari", amount: 1500 }]),
    ).toBe(`${BOM}Kuupäev;Kellelt;Kellele;Summa (€)\r\n18.11.2026;Karl;Mari;15,00\r\n`);
  });
});

describe("safeFileName", () => {
  it("keeps letters and digits, drops accents and replaces the rest with dashes", () => {
    expect(safeFileName("Rootsi reis 2026!")).toBe("rootsi-reis-2026");
    expect(safeFileName("Õhtusöök & jäätis")).toBe("ohtusook-jaatis");
  });

  it("can never contain quotes, slashes or line breaks", () => {
    expect(safeFileName('a"b/c\r\nd\\e')).toBe("a-b-c-d-e");
  });

  it("falls back to a default for names with no usable characters", () => {
    expect(safeFileName("???")).toBe("grupp");
    expect(safeFileName("")).toBe("grupp");
  });

  it("is limited in length", () => {
    expect(safeFileName("x".repeat(200)).length).toBeLessThanOrEqual(40);
  });
});
