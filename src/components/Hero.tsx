"use client";

import Image from "next/image";
import { heroCopy } from "@/data/siteContent";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import { AnimatedHeading } from "./AnimatedHeading";
import { HeroNavigation } from "./HeroNavigation";

export function Hero() {
  const { images } = useUploadedImages({ homeOnly: true });
  const heroImage = images[0];
  const supportingImages = images.slice(1, 3);

  return (
    <section
      id="home"
      className="relative min-h-[78vh] overflow-hidden bg-graphite text-white md:min-h-[88vh]"
      aria-labelledby="hero-title"
    >
      {heroImage ? (
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          loading="eager"
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#5a5049,#d9d6cf_48%,#8f9a91)]" />
      )}
      <div className="absolute inset-0 bg-black/32" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.28),rgba(0,0,0,.06)_45%,rgba(0,0,0,.48))]" />

      <HeroNavigation />

      {supportingImages.length > 1 ? (
        <div className="pointer-events-none absolute bottom-12 right-[max(2rem,8vw)] z-10 hidden items-end gap-4 xl:flex">
          {supportingImages.map((image, index) => (
            <div
              key={image.id}
              className={`relative overflow-hidden border border-white/55 bg-white/10 shadow-soft backdrop-blur-sm ${
                index === 0 ? "h-72 w-48" : "h-96 w-56"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="224px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="section-shell relative z-10 flex min-h-[78vh] items-end pb-16 pt-36 md:min-h-[88vh] md:pb-24">
        <div className="max-w-3xl xl:max-w-2xl">
          <AnimatedHeading
            id="hero-title"
            level={1}
            eyebrow={heroCopy.eyebrow}
            title={heroCopy.title}
            eyebrowClassName="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-mist"
            className="serif-heading text-[2.45rem] uppercase text-white sm:text-[3rem] md:text-[5.8rem]"
          />
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88 md:text-xl">
            {heroCopy.text}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#leistungen"
              className="inline-flex min-h-12 items-center border border-white bg-white px-7 text-sm font-bold uppercase tracking-normal text-graphite transition hover:bg-mist"
            >
              {heroCopy.primaryCta}
            </a>
            <a
              href="/kontakt"
              className="inline-flex min-h-12 items-center border border-white/70 px-7 text-sm font-bold uppercase tracking-normal text-white transition hover:bg-white hover:text-graphite"
            >
              {heroCopy.secondaryCta}
            </a>
          </div>
          {!heroImage ? (
            <p className="mt-6 max-w-xl text-sm leading-6 text-white/75">
              Lade im Adminbereich ein Startseiten- oder Sliderbild hoch, damit
              hier ein echtes Portfoliofoto erscheint.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
