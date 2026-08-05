"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { about } from "@/data/siteContent";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import type { MediaImage } from "@/types/media";
import { AnimatedHeading } from "./AnimatedHeading";

function isMediaImage(image: MediaImage | undefined): image is MediaImage {
  return Boolean(image);
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { images } = useUploadedImages();
  const photographerImages = images.filter((image) => image.isPhotographer);
  const fallbackImages = [
    images.find((image) => image.category === "Portrait"),
    images.find((image) => image.category === "Paare"),
    images.find(
      (image) => image.category === "Hochzeit" && image.useOnHome === false,
    ),
  ].filter(isMediaImage);
  const [primaryImage, accentImage, detailImage] =
    photographerImages.length > 0 ? photographerImages : fallbackImages;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ueber-mich"
      className="relative overflow-hidden bg-[#f4f1eb] py-24 md:py-32"
      aria-labelledby="about-title"
    >
      <div className="absolute left-0 top-24 hidden h-px w-[22vw] bg-line lg:block" />
      <div className="absolute bottom-20 right-0 hidden h-px w-[18vw] bg-line lg:block" />

      <div className="section-shell relative">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.65fr_1fr] lg:items-end">
          <p className="eyebrow">Ueber mich</p>
          <p className="max-w-2xl text-lg leading-8 text-muted lg:justify-self-end">
            Eine ruhige Begleitung, ein geschulter Blick und genug Raum, damit
            sich echte Naehe vor der Kamera entfalten kann.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div
            className={`relative z-10 max-w-xl transition duration-700 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-8 h-px w-24 bg-clay" />
            <AnimatedHeading
              id="about-title"
              eyebrow={about.eyebrow}
              title={about.title}
              eyebrowClassName="script-heading mb-5 max-w-md text-3xl leading-tight text-clay md:text-4xl"
              className="serif-heading text-[2.75rem] uppercase text-graphite md:text-[4.25rem]"
            />

            <div className="mt-9 grid gap-6 text-[1.02rem] leading-8 text-graphite/78 md:text-lg md:leading-9">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-5 border-l border-line pl-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="script-heading text-3xl text-graphite">
                {about.signature}
              </p>
              <a
                href="/kontakt"
                className="inline-flex min-h-12 items-center justify-center border border-clay px-7 text-sm font-bold uppercase tracking-normal text-clay transition hover:bg-clay hover:text-white"
              >
                {about.button}
              </a>
            </div>
          </div>

          <div
            className={`relative min-h-[900px] transition delay-150 duration-700 md:min-h-[1080px] lg:-mr-16 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="absolute left-[8%] top-[10%] h-[72%] w-[72%] bg-white shadow-soft" />
            <div className="absolute right-[4%] top-0 h-[82%] w-[68%] overflow-hidden bg-linen">
              {primaryImage ? (
                <Image
                  src={primaryImage.src}
                  alt={primaryImage.alt}
                  fill
                  sizes="(max-width: 768px) 82vw, 48vw"
                  className="object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>

            {accentImage ? (
              <div className="absolute bottom-[8%] left-0 h-[34%] w-[42%] overflow-hidden border-[10px] border-[#f4f1eb] bg-linen shadow-soft md:w-[38%]">
                <Image
                  src={accentImage.src}
                  alt={accentImage.alt}
                  fill
                  sizes="(max-width: 768px) 46vw, 260px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            {detailImage ? (
              <div className="absolute bottom-0 right-[16%] hidden h-[23%] w-[30%] overflow-hidden bg-linen grayscale md:block">
                <Image
                  src={detailImage.src}
                  alt={detailImage.alt}
                  fill
                  sizes="220px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="absolute bottom-[18%] right-[2%] hidden max-w-[210px] bg-graphite px-5 py-6 text-white md:block">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">
                Haltung
              </p>
              <p className="mt-4 font-serif text-2xl leading-tight">
                Natuerlich. Elegant. Nah.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
