"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PageTransition() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (reducedMotion) return;
    setActive(true);
    const timeout = window.setTimeout(() => setActive(false), 430);
    return () => window.clearTimeout(timeout);
  }, [pathname, reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[90] bg-mist transition-transform duration-[430ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        active ? "translate-y-0" : "-translate-y-full"
      }`}
    />
  );
}
