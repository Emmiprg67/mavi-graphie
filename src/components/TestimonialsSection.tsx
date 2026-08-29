"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/data/siteContent";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnimatedHeading } from "./AnimatedHeading";

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reducedMotion) return;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, [paused, reducedMotion]);

  const active = testimonials[index];

  return (
    <section
      className="bg-linen py-20 md:py-28"
      aria-labelledby="testimonials-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="section-shell max-w-4xl text-center">
        <AnimatedHeading
          id="testimonials-title"
          eyebrow="Kundenstimmen"
          title="Anlässe, die ich begleite"
          className="serif-heading text-[2.15rem] text-graphite md:text-[3.15rem]"
        />

        <div className="mt-10 flex items-center justify-center bg-white px-6 py-10 md:px-12">
          <span className="text-sm font-bold uppercase tracking-normal text-clay">
            {active.type}
          </span>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-2xl leading-none transition hover:border-clay"
            onClick={() =>
              setIndex((current) =>
                current === 0 ? testimonials.length - 1 : current - 1,
              )
            }
            aria-label="Vorherige Kundenstimme"
          >
            ‹
          </button>
          {testimonials.map((testimonial, itemIndex) => (
            <button
              key={testimonial.type}
              type="button"
              className={`h-2.5 w-2.5 rounded-full transition ${
                itemIndex === index ? "bg-clay" : "bg-greige"
              }`}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Kundenstimme ${itemIndex + 1} anzeigen`}
            />
          ))}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center border border-line bg-white text-2xl leading-none transition hover:border-clay"
            onClick={() => setIndex((current) => (current + 1) % testimonials.length)}
            aria-label="Nächste Kundenstimme"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
