import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, timingSafeEqual } from "@/lib/adminAuth";
import {
  deleteCloudinaryImage,
  isActiveImage,
  readAlbums,
  readImages,
  writeAlbums,
  writeImages,
} from "@/lib/media";
import type { MediaAlbum } from "@/types/media";

export const runtime = "nodejs";

async function canMutate(request: NextRequest) {
  if (await isAdminRequest(request)) return true;
  const token = process.env.ADMIN_UPLOAD_TOKEN;
  if (!token) return false;
  const provided = request.headers.get("x-admin-token");
  return provided !== null && timingSafeEqual(provided, token);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const includeInactive =
    searchParams.get("includeInactive") === "true" && (await canMutate(request));

  const [albums, images] = await Promise.all([readAlbums(), readImages()]);
  const visibleImages = includeInactive ? images : images.filter(isActiveImage);

  const summaries = albums.map((album) => {
    const albumImages = visibleImages.filter((image) => image.albumId === album.id);
    const cover =
      albumImages.find((image) => image.id === album.coverImageId) ?? albumImages[0];

    return {
      ...album,
      coverSrc: cover?.src,
      imageCount: albumImages.length,
    };
  });

  return NextResponse.json({ albums: summaries });
}

export async function POST(request: NextRequest) {
  if (!(await canMutate(request))) {
    return NextResponse.json(
      { message: "Anlegen ist nicht autorisiert." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = body?.title?.trim();

  if (!title) {
    return NextResponse.json(
      { message: "Bitte einen Albumtitel angeben." },
      { status: 400 },
    );
  }

  const albums = await readAlbums();
  const album: MediaAlbum = {
    id: randomUUID(),
    title,
    createdAt: new Date().toISOString(),
  };

  const nextAlbums = [album, ...albums];
  await writeAlbums(nextAlbums);

  return NextResponse.json({ album, albums: nextAlbums }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await canMutate(request))) {
    return NextResponse.json(
      { message: "Aendern ist nicht autorisiert." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { id?: string; title?: string; coverImageId?: string }
    | null;

  if (!body?.id) {
    return NextResponse.json(
      { message: "Es wurde keine Album-ID uebergeben." },
      { status: 400 },
    );
  }

  const albums = await readAlbums();
  const index = albums.findIndex((album) => album.id === body.id);
  if (index < 0) {
    return NextResponse.json({ message: "Album wurde nicht gefunden." }, { status: 404 });
  }

  const current = albums[index];

  if (body.coverImageId !== undefined) {
    const images = await readImages();
    const belongsToAlbum = images.some(
      (image) => image.id === body.coverImageId && image.albumId === current.id,
    );
    if (body.coverImageId && !belongsToAlbum) {
      return NextResponse.json(
        { message: "Das Cover-Bild gehört nicht zu diesem Album." },
        { status: 400 },
      );
    }
  }

  const updated: MediaAlbum = {
    ...current,
    title: body.title?.trim() || current.title,
    coverImageId: body.coverImageId !== undefined ? body.coverImageId || undefined : current.coverImageId,
  };

  const nextAlbums = [...albums];
  nextAlbums[index] = updated;
  await writeAlbums(nextAlbums);

  return NextResponse.json({ album: updated, albums: nextAlbums });
}

export async function DELETE(request: NextRequest) {
  if (!(await canMutate(request))) {
    return NextResponse.json(
      { message: "Löschen ist nicht autorisiert." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) {
    return NextResponse.json(
      { message: "Es wurde keine Album-ID übergeben." },
      { status: 400 },
    );
  }

  const [albums, images] = await Promise.all([readAlbums(), readImages()]);
  const albumImages = images.filter((image) => image.albumId === body.id);

  await Promise.all(albumImages.map((image) => deleteCloudinaryImage(image.publicId)));

  const remainingImages = images.filter((image) => image.albumId !== body.id);
  const remainingAlbums = albums.filter((album) => album.id !== body.id);

  await writeImages(remainingImages);
  await writeAlbums(remainingAlbums);

  return NextResponse.json({ albums: remainingAlbums, images: remainingImages });
}
