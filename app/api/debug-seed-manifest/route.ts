import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "@/lib/adminAuth";
import { cloudinary, readImages, writeImages } from "@/lib/media";
import type { MediaImage } from "@/types/media";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = process.env.DEBUG_SEED_TOKEN;
  const provided = request.headers.get("x-debug-token");
  if (!token || provided === null || !timingSafeEqual(provided, token)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await readImages();
  if (existing.length > 0) {
    return NextResponse.json(
      { message: "Manifest ist nicht leer, Seed abgebrochen.", count: existing.length },
      { status: 409 },
    );
  }

  type CloudinaryResource = {
    public_id: string;
    width?: number;
    height?: number;
    created_at?: string;
  };

  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;
  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "mavi-graphie/uploads",
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  resources.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));

  const images: MediaImage[] = resources.map((resource, index) => ({
    id: randomUUID(),
    src: cloudinary.url(resource.public_id, {
      secure: true,
      quality: "auto",
      fetch_format: "auto",
    }),
    publicId: resource.public_id,
    title: `Fotografie ${index + 1}`,
    alt: "Fotografie aus dem Bestand",
    category: "Sonstiges",
    width: resource.width,
    height: resource.height,
    useOnHome: false,
    isPhotographer: false,
    isCategoryCover: false,
    active: true,
    createdAt: resource.created_at ?? new Date().toISOString(),
    inAlbum: false,
  }));

  await writeImages(images);

  return NextResponse.json({ message: "Seed abgeschlossen.", count: images.length });
}
