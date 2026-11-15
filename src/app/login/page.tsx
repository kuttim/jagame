import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RedirectIfSignedIn } from "../redirect-if-signed-in";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Logi sisse – Jagame",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-3xl font-semibold tracking-tight">Logi sisse</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Logi sisse, et näha oma gruppe.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
      <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
        Pole kontot?{" "}
        <Link href="/register" className="font-medium underline">
          Registreeru
        </Link>
      </p>
    </main>
  );
}
