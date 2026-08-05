"use client";

import Image from "next/image";
import { services } from "@/data/siteContent";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import { AnimatedHeading } from "./AnimatedHeading";

export function ServicesSection() {
  const { images } = useUploadedImages();

  return (
    <section
      id="leistungen"
      className="bg-ivory py-20 md:py-28"
      aria-labelledby="services-title"
    >
      <div className="section-shell">
        <div className="mb-12 max-w-2xl">
          <AnimatedHeading
            id="services-title"
            eyebrow="Leistungen"
            title="Liebevoll begleitete Shootings für eure wichtigsten Kapitel."
            className="serif-heading text-[2.1rem] text-graphite md:text-[3rem]"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const image = images.find((item) => item.category === service.category);

            return (
              <article
                key={service.title}
                className="group h-full overflow-hidden border border-line bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-linen">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-8 text-center text-sm leading-6 text-muted">
                      Bild im Adminbereich für {service.title} hochladen
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl text-graphite">
                    {service.title}
                  </h3>
                  <p className="mt-4 min-h-24 text-base leading-7 text-muted">
                    {service.description}
                  </p>
                  <a
                    href="/kontakt"
                    className="quiet-link mt-6 inline-block text-sm font-bold uppercase tracking-normal text-clay"
                  >
                    Mehr erfahren
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
