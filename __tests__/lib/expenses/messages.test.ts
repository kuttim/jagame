import { describe, expect, it } from "vitest";
import { expenseMessages } from "@/lib/expenses/messages";

describe("expenseMessages", () => {
  it("is empty when there are no errors", () => {
    expect(expenseMessages({})).toEqual({});
  });

  it("explains each field problem in Estonian", () => {
    const messages = expenseMessages({
      description: "required",
      amount: "invalid",
      date: "invalid",
      payer: "invalid",
    });
    expect(messages.description).toBe("Sisesta, mille eest maksti.");
    expect(messages.amount).toBe("Sisesta summa numbrina, nt 12,50.");
    expect(messages.date).toContain("kuupäev");
    expect(messages.payer).toBe("Vali, kes maksis.");
  });

  it("shows the sums in the amount mismatch", () => {
    expect(
      expenseMessages({ split: { code: "amount_sum", sum: 2900, total: 3000 } })
        .split,
    ).toBe("Summad annavad kokku 29,00 €, aga kulu on 30,00 €.");
  });

  it("shows the percentage total with a decimal comma", () => {
    expect(
      expenseMessages({ split: { code: "percent_sum", sum: 9950 } }).split,
    ).toBe("Protsendid annavad kokku 99,5 %, aga peab olema 100 %.");
  });

  it("explains the length and amount limits", () => {
    const messages = expenseMessages({ description: "too_long", amount: "zero" });
    expect(messages.description).toContain("100");
    expect(messages.amount).toBe("Summa peab olema suurem kui 0.");
    expect(expenseMessages({ amount: "too_large" }).amount).toBe("Summa on liiga suur.");
  });

  it("explains the split problems that do not carry numbers", () => {
    expect(expenseMessages({ split: { code: "no_participants" } }).split).toBe(
      "Vali vähemalt üks osaleja.",
    );
    expect(expenseMessages({ split: { code: "invalid_value" } }).split).toContain("nt 12,50");
    expect(expenseMessages({ split: { code: "invalid_type" } }).split).toContain("Laadi leht uuesti");
    expect(expenseMessages({ split: { code: "unknown_participant" } }).split).toContain(
      "Laadi leht uuesti",
    );
  });
});
