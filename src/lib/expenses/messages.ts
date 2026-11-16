// User-facing texts (Estonian) for the expense form.

import { formatEuro } from "@/lib/calculation/money";
import { hundredthsToInput } from "./format";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_YEAR,
  MIN_YEAR,
  type ExpenseErrors,
} from "./validation";

export type ExpenseMessages = {
  description?: string;
  amount?: string;
  date?: string;
  payer?: string;
  split?: string;
};

export function expenseMessages(errors: ExpenseErrors): ExpenseMessages {
  const messages: ExpenseMessages = {};

  if (errors.description === "required") messages.description = "Sisesta, mille eest maksti.";
  if (errors.description === "too_long") {
    messages.description = `Kirjeldus on liiga pikk (kuni ${MAX_DESCRIPTION_LENGTH} tähemärki).`;
  }

  if (errors.amount === "invalid") {
    messages.amount = "Sisesta summa numbrina, nt 12,50.";
  }
  if (errors.amount === "zero") messages.amount = "Summa peab olema suurem kui 0.";
  if (errors.amount === "too_large") messages.amount = "Summa on liiga suur.";

  if (errors.date) {
    messages.date = `Vali kehtiv kuupäev (aastad ${MIN_YEAR}–${MAX_YEAR}).`;
  }
  if (errors.payer) messages.payer = "Vali, kes maksis.";

  const split = errors.split;
  if (split) {
    switch (split.code) {
      case "no_participants":
        messages.split = "Vali vähemalt üks osaleja.";
        break;
      case "invalid_value":
        messages.split = "Sisesta igale osalejale kehtiv number, nt 12,50.";
        break;
      case "amount_sum":
        messages.split = `Summad annavad kokku ${formatEuro(split.sum)}, aga kulu on ${formatEuro(split.total)}.`;
        break;
      case "percent_sum":
        messages.split = `Protsendid annavad kokku ${hundredthsToInput(split.sum)} %, aga peab olema 100 %.`;
        break;
      case "invalid_type":
      case "unknown_participant":
        messages.split = "Jagamisviis või osalejad pole kehtivad. Laadi leht uuesti.";
        break;
    }
  }

  return messages;
}

export const EXPENSE_NOT_FOUND_MESSAGE = "Kulu ei leitud.";
export const MEMBER_HAS_EXPENSES_MESSAGE =
  "Liiget ei saa eemaldada, sest tal on kulusid või tasumisi. Kustuta või muuda need enne.";

export const PAYMENT_CHANGED_MESSAGE =
  "Soovitus on vahepeal muutunud. Laadi leht uuesti ja proovi siis.";
