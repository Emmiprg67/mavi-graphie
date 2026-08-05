"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { brand } from "@/data/siteContent";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/admin") ? next : "/admin";
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(form.get("username") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (response.ok) {
      window.location.assign(nextPath);
      return;
    }

    setMessage(data?.message ?? "Login fehlgeschlagen.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-graphite">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-graphite lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(52,52,52,.92),rgba(52,52,52,.54))]" />
          <div className="absolute left-16 top-16 h-px w-44 bg-white/45" />
          <div className="absolute bottom-20 left-16 right-16 z-10">
            <p className="eyebrow mb-5 text-mist">Admin Studio</p>
            <h1 className="serif-heading max-w-xl text-[4.2rem] uppercase leading-none text-white">
              Portfolio sauber kuratieren.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-8 text-white/72">
              Login fuer Uploads, Bildreihenfolge und sichtbare Inhalte der Website.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-16">
          <form
            onSubmit={handleSubmit}
            method="post"
            action="/api/admin/login"
            className="w-full max-w-[460px] border border-line bg-white p-8 shadow-soft md:p-10"
          >
            <input type="hidden" name="next" value={nextPath} />
            <p className="brand-logo text-xl">{brand.name}</p>
            <p className="eyebrow mt-10">Geschuetzter Bereich</p>
            <h2 className="serif-heading mt-4 text-[2.4rem] uppercase">
              Admin Login
            </h2>
            <p className="mt-5 text-sm leading-6 text-muted">
              Melde dich an, um Bilder hochzuladen, zu sortieren und fuer die
              Website freizugeben.
            </p>

            <div className="mt-8 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Benutzername
                <input
                  name="username"
                  autoComplete="username"
                  className="min-h-12 border-line bg-ivory"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Passwort
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="min-h-12 border-line bg-ivory"
                  required
                />
              </label>
            </div>

            {message ? (
              <p className="mt-5 border border-clay/30 bg-clay/10 p-3 text-sm text-graphite">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="mt-7 min-h-12 w-full bg-graphite px-6 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-clay disabled:opacity-60"
            >
              {busy ? "Anmeldung laeuft ..." : "Einloggen"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
