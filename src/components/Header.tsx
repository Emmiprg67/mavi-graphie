"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, navigation } from "@/data/siteContent";
import { MobileNavigation } from "./MobileNavigation";

type HeaderProps = {
  alwaysVisible?: boolean;
};

export function Header({ alwaysVisible = false }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [heroNavigationVisible, setHeroNavigationVisible] = useState(isHome);
  const active =
    pathname === "/kontakt" || pathname === "/impressum" || pathname === "/datenschutz"
      ? "/kontakt"
      : "/";
  const visible = alwaysVisible || !isHome || !heroNavigationVisible;

  useEffect(() => {
    if (alwaysVisible || !isHome) {
      setHeroNavigationVisible(false);
      return;
    }

    setHeroNavigationVisible(true);

    const heroNavigation = document.getElementById("hero-navigation");
    if (!heroNavigation) {
      setHeroNavigationVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroNavigationVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-1px 0px 0px 0px",
      },
    );

    observer.observe(heroNavigation);
    return () => observer.disconnect();
  }, [alwaysVisible, isHome]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-ivory/92 backdrop-blur-md transition-[opacity,transform,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible
          ? "pointer-events-auto visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-3 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 md:px-8 lg:px-12">
        <Link
          href="/"
          className="brand-logo text-[1.35rem] text-graphite"
          aria-label={`${brand.name} Startseite`}
        >
          {brand.name}
        </Link>

        <nav className="hidden items-center lg:flex" aria-label="Hauptnavigation">
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`quiet-link px-6 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                active === item.href ? "text-clay" : "text-graphite"
              } ${index > 0 ? "border-l border-line" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileNavigation active={active} id="sticky-mobile-navigation" />
      </div>
    </header>
  );
}
