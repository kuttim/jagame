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
});
