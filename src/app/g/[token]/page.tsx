import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getGroupByToken } from "@/lib/groups/queries";
import { canAddMember, canLeave, canRemoveMember } from "@/lib/groups/permissions";
import { getViewer } from "@/lib/groups/viewer";
import { addMember, claimMember, joinGroup, leaveGroup, removeMember } from "./actions";
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
                  <form action={removeMember.bind(null, group.shareToken, member.id)}>
                    <button
                      type="submit"
                      aria-label={`Eemalda ${member.name}`}
                      className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
                    >
                      Eemalda
                    </button>
                  </form>
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
          <form action={leaveGroup.bind(null, group.shareToken)} className="mt-8">
            <button
              type="submit"
              className="cursor-pointer text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-red-600 hover:underline dark:hover:text-red-400"
            >
              Lahku grupist
            </button>
          </form>
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
