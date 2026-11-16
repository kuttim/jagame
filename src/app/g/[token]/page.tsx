import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getGroupByToken } from "@/lib/groups/queries";
import { formatEuro } from "@/lib/calculation/money";
import { formatDateEt } from "@/lib/expenses/format";
import {
  canAddMember,
  canLeave,
  canManageExpenses,
  canRemoveMember,
} from "@/lib/groups/permissions";
import { getViewer } from "@/lib/groups/viewer";
import { addMember, claimMember, joinGroup, leaveGroup, removeMember } from "./actions";
import { ActionButton } from "./action-button";
import { CopyLink } from "./copy-link";
import { NameForm } from "./name-form";

// The link is a secret: keep it out of search engines and out of Referer headers.
export const metadata: Metadata = {
  title: "Grupp – Jagame",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function GroupPage(props: PageProps<"/g/[token]">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Suspense fallback={<p className="text-zinc-500">Laen gruppi…</p>}>
        <Group params={props.params} />
      </Suspense>
    </main>
  );
}

async function Group({ params }: Pick<PageProps<"/g/[token]">, "params">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const viewer = await getViewer(group);
  if (viewer.role === "visitor") return <Invitation token={token} group={group} />;

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const shareUrl = `${protocol}://${host}/g/${group.shareToken}`;

  return (
    <>
      {viewer.role === "owner" && (
        <Link
          href="/groups"
          className="mb-4 block text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Minu grupid
        </Link>
      )}
      <h1 className="text-3xl font-semibold tracking-tight">{group.name}</h1>

      <section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
        <h2 className="font-semibold">Kutsu teisi</h2>
        <p className="mb-3 mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Igaüks, kellel on see link, saab gruppi liituda ilma kontota. Jaga
          seda ainult nendega, kes peavad grupis olema.
        </p>
        <CopyLink url={shareUrl} />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Kulud{" "}
            <span className="font-normal text-zinc-500">
              ({group.expenses.length})
            </span>
          </h2>
          {canManageExpenses(viewer) && group.members.length > 0 && (
            <Link
              href={`/g/${token}/expenses/new`}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Lisa kulu
            </Link>
          )}
        </div>
        {group.expenses.length === 0 ? (
          <p className="mt-4 text-zinc-500">
            Kulusid pole veel. Lisa esimene, kui keegi on midagi eest ära
            maksnud.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-zinc-500">
              Kokku {formatEuro(group.expenses.reduce((sum, e) => sum + e.amount, 0))}
            </p>
            <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {group.expenses.map((expense) => (
                <li key={expense.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{expense.description}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {formatDateEt(expense.date.toISOString().slice(0, 10))} ·{" "}
                      {expense.payer.name} maksis
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      Jagatud:{" "}
                      {expense.shares
                        .map((share) => `${share.member.name} ${formatEuro(share.amount)}`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-semibold tabular-nums">{formatEuro(expense.amount)}</span>
                    {canManageExpenses(viewer) && (
                      <Link
                        href={`/g/${token}/expenses/${expense.id}/edit`}
                        className="text-sm text-zinc-500 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Muuda
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Liikmed{" "}
          <span className="font-normal text-zinc-500">({group.members.length})</span>
        </h2>
        <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {group.members.map((member) => {
            const isYou = viewer.role === "member" && viewer.memberId === member.id;
            return (
              <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex items-center gap-3">
                  <Avatar name={member.name} />
                  <span className="font-medium">{member.name}</span>
                  {isYou && <span className="text-sm text-zinc-500">(sina)</span>}
                </span>
                {canRemoveMember(viewer, member.id) && !isYou && (
                  <ActionButton
                    action={removeMember.bind(null, group.shareToken, member.id)}
                    label="Eemalda"
                    ariaLabel={`Eemalda ${member.name}`}
                    className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {canAddMember(viewer) && (
          <div className="mt-6">
            <NameForm
              id="add-member"
              action={addMember.bind(null, group.shareToken)}
              label="Lisa liige nime järgi"
              placeholder="Nimi"
              submitLabel="Lisa"
              pendingLabel="Lisan…"
            />
          </div>
        )}

        {canLeave(viewer) && (
          <div className="mt-8">
            <ActionButton
              action={leaveGroup.bind(null, group.shareToken)}
              label="Lahku grupist"
              className="cursor-pointer text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-red-600 hover:underline dark:hover:text-red-400"
            />
          </div>
        )}
      </section>
    </>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white"
    >
      {[...name][0]?.toLocaleUpperCase("et")}
    </span>
  );
}

/** What someone sees when they open the link without having joined yet. */
function Invitation({
  token,
  group,
}: {
  token: string;
  group: { name: string; members: { id: string; name: string }[] };
}) {
  return (
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        Kutse
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Sind on kutsutud gruppi „{group.name}”
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Kontot pole vaja. Ütle, mis on sinu nimi, et teised sind grupis ära
        tunneksid.
      </p>

      <div className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <NameForm
          id="join-name"
          action={joinGroup.bind(null, token)}
          label="Sinu nimi"
          placeholder="Nt Mari"
          submitLabel="Liitu grupiga"
          pendingLabel="Liitun…"
        />
      </div>

      {group.members.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold">Oled juba loendis?</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Kui sinu nimi on juba grupis (näiteks lisas sind grupi looja või
            oled uues seadmes), vali see, mitte ära liitu uuesti.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {group.members.map((member) => (
              <li key={member.id}>
                <form action={claimMember.bind(null, token, member.id)}>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-indigo-500/10"
                  >
                    {member.name}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
