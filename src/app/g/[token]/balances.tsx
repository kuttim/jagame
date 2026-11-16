import { formatEuro, formatSignedEuro } from "@/lib/calculation/money";
import type { GroupSummary } from "@/lib/expenses/summary";

function balanceClass(balance: number): string {
  if (balance > 0) return "text-emerald-600 dark:text-emerald-400";
  if (balance < 0) return "text-rose-600 dark:text-rose-400";
  return "text-zinc-500";
}

/** Who is ahead, who is behind, and the transfers that settle everything. */
export function Balances({ summary }: { summary: GroupSummary }) {
  const nameOf = (id: string) =>
    summary.rows.find((row) => row.id === id)?.name ?? "?";

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Saldod</h2>
      <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {summary.rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name}</p>
              <p className="text-sm text-zinc-500">
                maksis {formatEuro(row.paid)} · tema osa {formatEuro(row.owed)}
              </p>
            </div>
            <span className={`shrink-0 font-semibold tabular-nums ${balanceClass(row.balance)}`}>
              {formatSignedEuro(row.balance)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Kes kellele maksab
        </h3>
        {summary.transfers.length === 0 ? (
          <p className="mt-3">Kõik on tasa. Keegi ei võlgne kellelegi.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {summary.transfers.map((transfer) => (
              <li
                key={`${transfer.fromId}-${transfer.toId}`}
                className="flex items-center justify-between gap-4"
              >
                <span>
                  <span className="font-medium">{nameOf(transfer.fromId)}</span>
                  {" → "}
                  <span className="font-medium">{nameOf(transfer.toId)}</span>
                </span>
                <span className="font-semibold tabular-nums">
                  {formatEuro(transfer.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
