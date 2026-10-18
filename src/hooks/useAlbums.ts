"use client";

import { useEffect, useState } from "react";
import type { MediaAlbum } from "@/types/media";

export type AlbumSummary = MediaAlbum & {
  coverSrc?: string;
  imageCount: number;
};

export function useAlbums(options: { includeInactive?: boolean } = {}) {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAlbums() {
      try {
        setLoading(true);
        const query = options.includeInactive ? "?includeInactive=true" : "";
        const response = await fetch(`/api/albums${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Alben konnten nicht geladen werden.");
        const data = (await response.json()) as { albums: AlbumSummary[] };
        if (active) setAlbums(data.albums ?? []);
      } catch {
        if (active) setAlbums([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAlbums();

    return () => {
      active = false;
    };
  }, [options.includeInactive]);

  return { albums, loading };
}
