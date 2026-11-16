import { formatEuro, formatSignedEuro } from "@/lib/calculation/money";
import { formatDateEt } from "@/lib/expenses/format";
import type { GroupSummary } from "@/lib/expenses/summary";
import { ActionButton } from "./action-button";
import { markPaid, undoPayment } from "./payments/actions";

function balanceClass(balance: number): string {
  if (balance > 0) return "text-emerald-600 dark:text-emerald-400";
  if (balance < 0) return "text-rose-600 dark:text-rose-400";
  return "text-zinc-500";
}

export type PaymentView = {
  id: string;
  fromName: string;
  toName: string;
  amount: number;
  /** "YYYY-MM-DD" */
  date: string;
};

/** What a member has already sent or received, shown under the balance. */
function settledNote(settled: number): string | null {
  if (settled > 0) return `tasunud ${formatEuro(settled)}`;
  if (settled < 0) return `saanud ${formatEuro(-settled)}`;
  return null;
}

type BalancesProps = {
  summary: GroupSummary;
  token: string;
  payments: PaymentView[];
  /** Owner and members may mark transfers as paid and undo them */
  canManage: boolean;
};

/** Who is ahead, who is behind, the transfers that settle everything, and what has been paid. */
export function Balances({ summary, token, payments, canManage }: BalancesProps) {
  const nameOf = (id: string) =>
    summary.rows.find((row) => row.id === id)?.name ?? "?";

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Saldod</h2>
      <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {summary.rows.map((row) => {
          const note = settledNote(row.settled);
          return (
            <li key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{row.name}</p>
                <p className="text-sm text-zinc-500">
                  maksis {formatEuro(row.paid)} · tema osa {formatEuro(row.owed)}
                  {note && ` · ${note}`}
                </p>
              </div>
              <span className={`shrink-0 font-semibold tabular-nums ${balanceClass(row.balance)}`}>
                {formatSignedEuro(row.balance)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Kes kellele maksab
        </h3>
        {summary.transfers.length === 0 ? (
          <p className="mt-3">Kõik on tasa. Keegi ei võlgne kellelegi.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {summary.transfers.map((transfer) => (
              <li
                key={`${transfer.fromId}-${transfer.toId}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="min-w-0">
                  <span className="font-medium">{nameOf(transfer.fromId)}</span>
                  {" → "}
                  <span className="font-medium">{nameOf(transfer.toId)}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    {formatEuro(transfer.amount)}
                  </span>
                  {canManage && (
                    <ActionButton
                      action={markPaid.bind(
                        null,
                        token,
                        transfer.fromId,
                        transfer.toId,
                        transfer.amount,
                      )}
                      label="Märgi tasutuks"
                      ariaLabel={`Märgi tasutuks: ${nameOf(transfer.fromId)} maksab ${nameOf(transfer.toId)}le ${formatEuro(transfer.amount)}`}
                      className="cursor-pointer rounded-full border border-zinc-300 px-3 py-1 text-sm font-medium transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-zinc-700 dark:hover:bg-emerald-500/10"
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {payments.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Tehtud ülekanded
          </h3>
          <ul className="mt-3 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span className="min-w-0">
                  <span className="text-zinc-500">{formatDateEt(payment.date)} · </span>
                  {payment.fromName} → {payment.toName}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    {formatEuro(payment.amount)}
                  </span>
                  {canManage && (
                    <ActionButton
                      action={undoPayment.bind(null, token, payment.id)}
                      label="Võta tagasi"
                      ariaLabel={`Võta tasumine tagasi: ${payment.fromName} → ${payment.toName} ${formatEuro(payment.amount)}`}
                      className="cursor-pointer text-zinc-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
