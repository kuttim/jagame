import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RedirectIfSignedIn } from "../redirect-if-signed-in";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registreeru – Jagame",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-3xl font-semibold tracking-tight">Registreeru</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Konto on vaja gruppide loomiseks. Teise grupiga liitumiseks piisab
        lingist.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
        Konto on juba olemas?{" "}
        <Link href="/login" className="font-medium underline">
          Logi sisse
        </Link>
      </p>
    </main>
  );
}
