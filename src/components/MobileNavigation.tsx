"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { brand, navigation } from "@/data/siteContent";

type MobileNavigationProps = {
  active: string;
  tone?: "light" | "dark";
  id?: string;
};

export function MobileNavigation({
  active,
  tone = "dark",
  id = "mobile-navigation",
}: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className={`flex h-11 w-11 items-center justify-center border transition ${
          tone === "light"
            ? "border-white/55 bg-white/10 text-white"
            : "border-line bg-white/70 text-graphite"
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="relative h-4 w-5" aria-hidden="true">
          <span
            className={`absolute left-0 top-0 h-px w-5 bg-current transition-transform ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-2 h-px w-5 bg-current transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-4 h-px w-5 bg-current transition-transform ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={id}
        className={`fixed inset-0 z-50 bg-graphite/96 px-6 py-7 text-white backdrop-blur-md transition duration-300 ${
          open
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-5 opacity-0"
        }`}
      >
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="brand-logo text-3xl">
            {brand.name}
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-white/45 text-2xl leading-none"
            onClick={() => setOpen(false)}
            aria-label="Menü schließen"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`border-b border-white/14 py-5 font-serif text-3xl tracking-normal ${
                active === item.href ? "text-mist" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
