"use client";

import Image from "next/image";
import {
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUploadedImages } from "@/hooks/useUploadedImages";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "@/lib/animation";
import type { MediaImage } from "@/types/media";
import { ImageLightbox } from "./ImageLightbox";

const GLIDE_COOLDOWN_MS = 260;

export function InfiniteImageSlider() {
  const { images, loading, error } = useUploadedImages({ homeOnly: true });
  const reducedMotion = useReducedMotion();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const momentumRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const loopWidthRef = useRef(0);
  const slidePitchRef = useRef(280);
  const snapTargetRef = useRef<number | null>(null);
  const resumeAtRef = useRef(0);
  const isHoveringRef = useRef(false);
  const isGlidingRef = useRef(false);
  const lastGlideAtRef = useRef(0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    lastX: 0,
    lastTime: 0,
    total: 0,
    pointerId: 0,
  });

  const slides = useMemo(() => [...images, ...images, ...images], [images]);

  const renderTrack = useCallback((energy = 0) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    track.style.setProperty("--slider-energy", energy.toFixed(3));
  }, []);

  const normalizePosition = useCallback(() => {
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return;
    while (positionRef.current <= -loopWidth) positionRef.current += loopWidth;
    while (positionRef.current > 0) positionRef.current -= loopWidth;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    loopWidthRef.current = track.scrollWidth / 3;
    const firstSlide = track.querySelector("button");
    if (firstSlide) {
      const slideRect = firstSlide.getBoundingClientRect();
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
      slidePitchRef.current = slideRect.width + gap;
    }
    renderTrack();
  }, [renderTrack]);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [images.length, measure]);

  useEffect(() => {
    if (images.length < 2) return;
    let frame = 0;

    const animate = (time: number) => {
      const lastTime = lastTimeRef.current ?? time;
      const delta = Math.min((time - lastTime) / 1000, 0.05);
      lastTimeRef.current = time;

      if (!dragRef.current.active) {
        const manualActive =
          Math.abs(momentumRef.current) > 0.7 || snapTargetRef.current !== null;
        const hovering = isHoveringRef.current || Boolean(sectionRef.current?.matches(":hover"));
        const canAuto =
          !reducedMotion &&
          !hovering &&
          !manualActive &&
          time > resumeAtRef.current;
        const desiredSpeed = canAuto ? motion.slider.autoSpeed : 0;
        autoSpeedRef.current += (desiredSpeed - autoSpeedRef.current) * 0.055;

        if (Math.abs(momentumRef.current) > 0.7) {
          positionRef.current += momentumRef.current * delta;
          momentumRef.current *= motion.slider.friction;
        } else {
          momentumRef.current = 0;
          if (snapTargetRef.current === null && time < resumeAtRef.current) {
            const pitch = slidePitchRef.current || 1;
            snapTargetRef.current = Math.round(positionRef.current / pitch) * pitch;
          }
        }

        if (snapTargetRef.current !== null) {
          const distance = snapTargetRef.current - positionRef.current;
          positionRef.current += distance * motion.slider.snapStrength;
          if (Math.abs(distance) < 0.45) {
            positionRef.current = snapTargetRef.current;
            snapTargetRef.current = null;
            isGlidingRef.current = false;
          }
        }

        positionRef.current += autoSpeedRef.current * delta;
      }

      normalizePosition();
      const energy = Math.min(
        1,
        (Math.abs(momentumRef.current) + Math.abs(autoSpeedRef.current)) / 620,
      );
      renderTrack(energy);
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      isGlidingRef.current = false;
    };
  }, [images.length, normalizePosition, reducedMotion, renderTrack]);

  const glideBy = (direction: -1 | 1) => {
    const now = performance.now();
    if (isGlidingRef.current || now - lastGlideAtRef.current < GLIDE_COOLDOWN_MS) {
      return;
    }
    lastGlideAtRef.current = now;

    if (reducedMotion) {
      positionRef.current += direction * slidePitchRef.current;
      normalizePosition();
      renderTrack();
      return;
    }

    isGlidingRef.current = true;
    const pitch = slidePitchRef.current || 260;
    snapTargetRef.current = positionRef.current + direction * pitch * 1.4;
    momentumRef.current = 0;
    autoSpeedRef.current = 0;
    resumeAtRef.current = performance.now() + motion.slider.resumeDelay;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      active: true,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      total: 0,
      pointerId: event.pointerId,
    };
    momentumRef.current = 0;
    snapTargetRef.current = null;
    isGlidingRef.current = false;
    autoSpeedRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const now = performance.now();
    const delta = event.clientX - dragRef.current.lastX;
    const deltaTime = Math.max(now - dragRef.current.lastTime, 16);
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastTime = now;
    dragRef.current.total += Math.abs(delta);
    momentumRef.current = Math.max(
      -motion.slider.maxMomentum,
      Math.min(motion.slider.maxMomentum, (delta / deltaTime) * 1000),
    );
    positionRef.current += delta;
    normalizePosition();
    renderTrack(Math.min(1, Math.abs(momentumRef.current) / 650));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(dragRef.current.pointerId)) {
      event.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }
    resumeAtRef.current = performance.now() + motion.slider.resumeDelay;
  };

  const openImage = (image: MediaImage) => {
    if (dragRef.current.total > motion.slider.dragThreshold) return;
    const sourceIndex = images.findIndex((item) => item.id === image.id);
    if (sourceIndex >= 0) setLightboxIndex(sourceIndex);
  };

  if (loading) {
    return (
      <section className="bg-ivory py-10" aria-label="Bilder werden geladen">
        <div className="section-shell text-sm uppercase tracking-[0.2em] text-muted">
          Bilder werden geladen
        </div>
      </section>
    );
  }

  if (error || images.length === 0) {
    return (
      <section className="bg-ivory py-12" aria-label="Startseitenbilder">
        <div className="section-shell border-y border-line py-10 text-center">
          <p className="eyebrow mb-3">Portfolio</p>
          <p className="mx-auto max-w-2xl text-muted">
            Lade im Adminbereich echte Fotos hoch und markiere sie für
            Startseite oder Slider. Danach erscheinen sie automatisch hier.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="bg-ivory py-4"
      aria-label="Automatischer Bilder-Slider"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") glideBy(1);
        if (event.key === "ArrowRight") glideBy(-1);
      }}
      tabIndex={0}
    >
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          className="continuous-slider-track flex touch-pan-y select-none gap-3 will-change-transform md:gap-4"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {slides.map((image, index) => (
            <button
              key={`${image.id}-${index}`}
              type="button"
              className={`group relative shrink-0 overflow-hidden bg-linen ${
                index % 5 === 1
                  ? "mt-8 h-[42vh]"
                  : index % 5 === 3
                    ? "mt-4 h-[48vh]"
                    : "h-[52vh]"
              } w-[64vw] sm:w-[30vw] lg:w-[17vw]`}
              onClick={() => openImage(image)}
              aria-label={`Bild öffnen: ${image.alt}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 64vw, (max-width: 1024px) 30vw, 17vw"
                className="slider-slide-visual object-cover"
                loading={index < 6 ? "eager" : "lazy"}
                draggable={false}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="absolute left-2 top-1/2 z-10 flex h-16 w-9 -translate-y-1/2 items-center justify-center border-y border-r border-white/70 bg-graphite/20 text-4xl leading-none text-white backdrop-blur-sm transition hover:bg-white hover:text-graphite md:left-5"
          onClick={() => glideBy(1)}
          aria-label="Slider nach links bewegen"
        >
          ‹
        </button>
        <button
          type="button"
          className="absolute right-2 top-1/2 z-10 flex h-16 w-9 -translate-y-1/2 items-center justify-center border-y border-l border-white/70 bg-graphite/20 text-4xl leading-none text-white backdrop-blur-sm transition hover:bg-white hover:text-graphite md:right-5"
          onClick={() => glideBy(-1)}
          aria-label="Slider nach rechts bewegen"
        >
          ›
        </button>
      </div>

      <ImageLightbox
        images={images}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}
