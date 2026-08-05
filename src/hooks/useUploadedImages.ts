"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaImage } from "@/types/media";

type UseUploadedImagesOptions = {
  homeOnly?: boolean;
  photographerOnly?: boolean;
};

const cacheTtlMs = 60_000;
const imageCache = new Map<string, { images: MediaImage[]; expiresAt: number }>();
const pendingRequests = new Map<string, Promise<MediaImage[]>>();

async function fetchImages(query: string) {
  const cacheKey = query || "all";
  const cached = imageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.images;

  const pending = pendingRequests.get(cacheKey);
  if (pending) return pending;

  const request = fetch(`/api/images${query ? `?${query}` : ""}`, {
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Bilder konnten nicht geladen werden.");
      }

      const data = (await response.json()) as { images: MediaImage[] };
      imageCache.set(cacheKey, {
        images: data.images,
        expiresAt: Date.now() + cacheTtlMs,
      });
      return data.images;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

export function useUploadedImages(options: UseUploadedImagesOptions = {}) {
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (options.homeOnly) params.set("home", "true");
    if (options.photographerOnly) params.set("photographer", "true");
    return params.toString();
  }, [options.homeOnly, options.photographerOnly]);

  useEffect(() => {
    let active = true;

    async function loadImages() {
      try {
        setLoading(true);
        const loadedImages = await fetchImages(query);
        if (active) {
          setImages(loadedImages);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Bilder konnten nicht geladen werden.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadImages();

    return () => {
      active = false;
    };
  }, [query]);

  return { images, loading, error, setImages };
}
