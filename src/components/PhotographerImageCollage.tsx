"use client";

import Image from "next/image";
import { useUploadedImages } from "@/hooks/useUploadedImages";

export function PhotographerImageCollage() {
  const { images } = useUploadedImages({ photographerOnly: true });
  const collageImages = images.slice(0, 3);

  if (collageImages.length === 0) {
    return (
      <div className="grid min-h-[460px] place-items-center border border-dashed border-line bg-ivory px-8 text-center text-muted">
        <div>
          <p className="eyebrow mb-3">Fotografenbilder</p>
          <p>
            Lade im Adminbereich Bilder hoch und markiere sie als
            Fotografenbild. Dann entsteht hier automatisch die Collage.
          </p>
        </div>
      </div>
    );
  }

  const [primary, secondary, tertiary] = collageImages;

  return (
    <div className="relative mx-auto min-h-[520px] max-w-[620px] md:min-h-[650px]">
      <div className="absolute left-0 top-[17%] h-[55%] w-[52%] bg-mist" />

      {primary ? (
        <div className="absolute left-[9%] top-[7%] h-[58%] w-[46%] bg-white p-3 shadow-soft">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={primary.src}
              alt={primary.alt}
              fill
              sizes="(max-width: 768px) 52vw, 320px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {secondary ? (
        <div className="absolute right-[7%] top-0 h-[66%] w-[48%] bg-white p-3">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={secondary.src}
              alt={secondary.alt}
              fill
              sizes="(max-width: 768px) 54vw, 340px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {tertiary ? (
        <div className="absolute bottom-[4%] left-[31%] h-[34%] w-[56%] bg-white p-3 shadow-soft">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={tertiary.src}
              alt={tertiary.alt}
              fill
              sizes="(max-width: 768px) 62vw, 380px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
