import Link from "next/link";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-indigo-500/30";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/60 px-6 py-3 text-sm font-semibold text-zinc-800 backdrop-blur transition hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900";

const features = [
  {
    title: "Kolm jagamisviisi",
    text: "Jaga kulu võrdselt, kindlate summadena või protsentidena. Sendid ei kao ega teki juurde.",
    icon: (
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    ),
  },
  {
    title: "Vähim arv ülekandeid",
    text: "Rakendus soovitab, kes kellele maksab, et kõik saaks nulli võimalikult väheste ülekannetega.",
    icon: <path d="M4 8h13m0 0-4-4m4 4-4 4M20 16H7m0 0 4-4m-4 4 4 4" />,
  },
  {
    title: "Liitu lingiga",
    text: "Grupi looja saadab lingi ja sõbrad liituvad kohe. Neil pole vaja kontot luua.",
    icon: (
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    ),
  },
  {
    title: "Selge ülevaade",
    text: "Iga liikme saldo on alati näha: kes on plussis, kes miinuses ja kui palju.",
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
];

const steps = [
  {
    title: "Loo grupp",
    text: "Nimeta reis, korter või õhtusöök ja lisa liikmed.",
  },
  {
    title: "Lisa kulud",
    text: "Sisesta, kes maksis, kui palju ja kelle vahel kulu jagatakse.",
  },
  {
    title: "Tasaarvesta",
    text: "Vaata soovitatud ülekandeid ja märgi need tehtuks.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400/30 via-violet-400/25 to-sky-400/30 blur-3xl dark:from-indigo-500/20 dark:via-violet-500/15 dark:to-sky-500/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-28">
          <div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Jaga kulud{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-sky-400">
                ausalt
              </span>
              , ilma tüütu arvutamiseta.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Jagame hoiab arvet ühiste kulude üle reisil, korteris või
              sõbrasõpradega õhtusöögil. Sa lood grupi, lisad kulud ja
              rakendus ütleb, kes kellele maksab.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/register" className={primaryButton}>
                Alusta tasuta
              </Link>
              <Link href="#kuidas-see-tootab" className={secondaryButton}>
                Vaata, kuidas see töötab
              </Link>
            </div>
            <p className="mt-5 text-sm text-zinc-500">
              Grupi loomiseks on vaja kontot. Liitumiseks piisab lingist.
            </p>
          </div>

          <BalanceCard />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Kõik, mis ühiste kulude jaoks vaja
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Lihtne tööriist ühe asja jaoks: et keegi ei peaks Exceli tabelit
            pidama ega sõpradelt raha meelde tuletama.
          </p>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  {feature.icon}
                </svg>
              </span>
              <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section
        id="kuidas-see-tootab"
        className="scroll-mt-4 border-y border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Kuidas see töötab
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="text-5xl font-semibold tracking-tight text-indigo-600/20 dark:text-indigo-400/25">
                  0{index + 1}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 px-6 py-14 text-center text-white sm:px-12">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl"
          />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Valmis kulusid jagama?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-indigo-100">
            Loo konto ja tee esimene grupp. See võtab minuti.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50"
            >
              Registreeru
            </Link>
            <Link
              href="/diary"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Loe arenduspäevikut
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-zinc-500 sm:px-6">
          <span>Jagame · kooliprojekt</span>
          <a
            href="https://github.com/kuttim/jagame"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}

/** Illustrative example of what a group looks like (not real data). */
function BalanceCard() {
  const people = [
    { name: "Mari", initials: "M", balance: "+60,00 €", positive: true },
    { name: "Karl", initials: "K", balance: "−15,00 €", positive: false },
    { name: "Liis", initials: "L", balance: "−45,00 €", positive: false },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 to-sky-400/20 blur-2xl"
      />
      <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Näide
            </p>
            <h2 className="text-lg font-semibold">Lissaboni reis</h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            180,00 € kokku
          </span>
        </div>

        <ul className="mt-5 space-y-3">
          {people.map((person) => (
            <li
              key={person.name}
              className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                  {person.initials}
                </span>
                <span className="font-medium">{person.name}</span>
              </span>
              <span
                className={`font-semibold tabular-nums ${
                  person.positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {person.balance}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-700">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Soovitatud ülekanded
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Liis → Mari</span>
              <span className="font-semibold tabular-nums">45,00 €</span>
            </li>
            <li className="flex justify-between">
              <span>Karl → Mari</span>
              <span className="font-semibold tabular-nums">15,00 €</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
