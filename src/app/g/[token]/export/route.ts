import {
  balancesCsv,
  expensesCsv,
  paymentsCsv,
  safeFileName,
} from "@/lib/expenses/csv";
import { computeGroupSummary } from "@/lib/expenses/summary";
import { canManageExpenses } from "@/lib/groups/permissions";
import { getGroupByToken } from "@/lib/groups/queries";
import { getViewer } from "@/lib/groups/viewer";

const TYPES = ["expenses", "balances", "payments"] as const;
type ExportType = (typeof TYPES)[number];

const FILE_SUFFIX: Record<ExportType, string> = {
  expenses: "kulud",
  balances: "saldod",
  payments: "tasumised",
};

const dayOf = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Downloads the group's data as CSV: ?type=expenses (default), balances or
 * payments. Only the owner and joined members may download it; someone who
 * just has the link has not joined yet and sees only the invitation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const requested = new URL(request.url).searchParams.get("type") ?? "expenses";
  const type = TYPES.find((t) => t === requested);
  if (!type) return new Response("Tundmatu tüüp", { status: 400 });

  const group = await getGroupByToken(token);
  if (!group) return new Response("Gruppi ei leitud", { status: 404 });
  if (!canManageExpenses(await getViewer(group))) {
    return new Response("Sul pole selleks õigust", { status: 403 });
  }

  let csv: string;
  if (type === "expenses") {
    csv = expensesCsv(
      group.members,
      group.expenses.map((expense) => ({
        date: dayOf(expense.date),
        description: expense.description,
        amount: expense.amount,
        payerName: expense.payer.name,
        splitType: expense.splitType,
        shares: expense.shares,
      })),
    );
  } else if (type === "balances") {
    csv = balancesCsv(computeGroupSummary(group.members, group.expenses, group.payments));
  } else {
    csv = paymentsCsv(
      group.payments.map((payment) => ({
        date: dayOf(payment.paidAt),
        fromName: payment.fromMember.name,
        toName: payment.toMember.name,
        amount: payment.amount,
      })),
    );
  }

  const fileName = `jagame-${safeFileName(group.name)}-${FILE_SUFFIX[type]}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      // The data is private to the group; do not let a shared cache keep it.
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
