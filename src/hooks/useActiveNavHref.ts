"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/data/siteContent";

const sectionIds = navigation
  .filter((item) => item.href.startsWith("/#"))
  .map((item) => item.href.slice(2));

const legalPaths = new Set(["/kontakt", "/impressum", "/datenschutz"]);

export function useActiveNavHref() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [sectionHref, setSectionHref] = useState("/");

  useEffect(() => {
    if (!isHome) return;

    setSectionHref("/");

    const sections = ["home", ...sectionIds]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!mostVisible) return;
        const id = mostVisible.target.id;
        setSectionHref(id === "home" ? "/" : `/#${id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  if (!isHome) {
    return legalPaths.has(pathname) ? "/kontakt" : "/";
  }

  return sectionHref;
}
