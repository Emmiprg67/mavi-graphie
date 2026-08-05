"use client";

import Link from "next/link";
import { brand, navigation } from "@/data/siteContent";
import { InstagramIcon } from "./InstagramIcon";
import { MobileNavigation } from "./MobileNavigation";

export function HeroNavigation() {
  return (
    <div
      id="hero-navigation"
      className="absolute inset-x-0 top-0 z-20 px-5 py-5 text-white md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="hidden items-center gap-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-4 border-y border-white/50 py-4">
            <a
              href={brand.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-11 w-11 place-items-center text-white transition hover:scale-105 hover:text-mist focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              aria-label={`Instagram-Profil von ${brand.name} öffnen`}
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>

          <Link
            href="/"
            className="brand-logo grid h-28 w-28 place-items-center border border-white/60 bg-white/10 px-3 text-center text-[1.05rem] leading-6 backdrop-blur-sm"
          >
            {brand.name}
          </Link>

          <div className="flex items-center justify-end border-y border-white/50 py-4">
            <Link
              href="/kontakt"
              className="text-xs font-bold uppercase tracking-normal transition hover:text-mist"
            >
              Shooting anfragen
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" className="brand-logo text-2xl">
            {brand.name}
          </Link>
          <MobileNavigation
            active="/"
            tone="light"
            id="hero-mobile-navigation"
          />
        </div>

        <nav
          className="mt-7 hidden justify-center gap-10 text-xs font-bold uppercase tracking-[0.32em] lg:flex"
          aria-label="Hero Navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition ${
                item.href === "/" ? "text-mist" : "text-white hover:text-mist"
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
