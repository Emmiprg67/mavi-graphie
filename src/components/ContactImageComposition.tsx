"use client";

import Image from "next/image";
import { useUploadedImages } from "@/hooks/useUploadedImages";

export function ContactImageComposition() {
  const { images } = useUploadedImages({ photographerOnly: true });
  const [backImage, frontImage] = images;

  if (!backImage && !frontImage) {
    return (
      <div className="grid min-h-[360px] place-items-center border border-dashed border-line bg-linen px-8 text-center text-muted">
        Fotografenbilder im Adminbereich markieren, damit sie hier erscheinen.
      </div>
    );
  }

  return (
    <div className="relative min-h-[460px] md:min-h-[560px]">
      {backImage ? (
        <div className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden bg-linen">
          <Image
            src={backImage.src}
            alt={backImage.alt}
            fill
            sizes="(max-width: 768px) 80vw, 440px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="absolute bottom-[16%] left-[10%] h-[34%] w-[58%] bg-mist" />

      {frontImage ? (
        <div className="absolute bottom-0 left-0 h-[42%] w-[62%] bg-white p-3 shadow-soft">
          <div className="relative h-full w-full overflow-hidden grayscale">
            <Image
              src={frontImage.src}
              alt={frontImage.alt}
              fill
              sizes="(max-width: 768px) 70vw, 360px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
