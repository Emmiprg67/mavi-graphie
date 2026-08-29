import { randomUUID } from "crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { list, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, timingSafeEqual } from "@/lib/adminAuth";
import type { MediaCategory, MediaImage } from "@/types/media";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const cloudinaryFolder = "mavi-graphie/uploads";
const manifestPathname = "media.json";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const categoryValues: MediaCategory[] = [
  "Slider",
  "Startseite",
  "Familie",
  "Hochzeit",
  "Paare",
  "Baby",
  "Portrait",
  "Verlobung",
  "Henna",
  "Standesamt",
  "Sonstiges",
];

async function readImages(): Promise<MediaImage[]> {
  const { blobs } = await list({ prefix: manifestPathname, limit: 1 });
  const manifest = blobs.find((blob) => blob.pathname === manifestPathname);
  if (!manifest) return [];

  const response = await fetch(manifest.url, { cache: "no-store" });
  if (!response.ok) return [];

  const parsed = await response.json().catch(() => null);
  return Array.isArray(parsed) ? (parsed as MediaImage[]) : [];
}

async function writeImages(images: MediaImage[]) {
  await put(manifestPathname, JSON.stringify(images, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

async function canMutate(request: NextRequest) {
  if (await isAdminRequest(request)) return true;
  const token = process.env.ADMIN_UPLOAD_TOKEN;
  if (!token) return false;
  const provided = request.headers.get("x-admin-token");
  return provided !== null && timingSafeEqual(provided, token);
}

const imageSignatures: { type: string; matches: (buffer: Buffer) => boolean }[] = [
  {
    type: "image/jpeg",
    matches: (buffer) =>
      buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  },
  {
    type: "image/png",
    matches: (buffer) =>
      buffer.length >= 8 &&
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    type: "image/webp",
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
  {
    type: "image/avif",
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      ["avif", "avis", "mif1", "msf1", "heic", "heix"].includes(
        buffer.toString("ascii", 8, 12),
      ),
  },
];

function hasValidImageSignature(buffer: Buffer) {
  return imageSignatures.some(({ matches }) => matches(buffer));
}

function normalizeCategory(value: FormDataEntryValue | null): MediaCategory {
  if (typeof value === "string" && categoryValues.includes(value as MediaCategory)) {
    return value as MediaCategory;
  }
  return "Slider";
}

function normalizeCategoryWithFallback(
  value: FormDataEntryValue | null,
  fallback: MediaCategory,
): MediaCategory {
  if (typeof value === "string" && categoryValues.includes(value as MediaCategory)) {
    return value as MediaCategory;
  }
  return fallback;
}

function parseBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (typeof value !== "string") return fallback;
  return value === "true" || value === "on";
}

function isActive(image: MediaImage) {
  return image.active !== false;
}

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function uploadImageBuffer(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        public_id: `${Date.now()}-${randomUUID()}`,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary-Upload fehlgeschlagen."));
          return;
        }
        resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
}

function cloudinaryOptimizedUrl(publicId: string, version: number) {
  return cloudinary.url(publicId, {
    secure: true,
    version,
    quality: "auto",
    fetch_format: "auto",
  });
}

async function deleteCloudinaryImage(publicId: string | undefined) {
  if (!publicId) return;
  await cloudinary.uploader
    .destroy(publicId, { resource_type: "image", invalidate: true })
    .catch(() => undefined);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const homeOnly = searchParams.get("home") === "true";
  const photographerOnly = searchParams.get("photographer") === "true";
  const limit = Number(searchParams.get("limit") ?? 0);
  const category = searchParams.get("category");
  const includeInactive =
    searchParams.get("includeInactive") === "true" && (await canMutate(request));
  const images = await readImages();

  let filtered = includeInactive ? images : images.filter(isActive);

  if (homeOnly) {
    const homeImages = filtered.filter(
      (image) =>
        image.useOnHome ||
        image.category === "Slider" ||
        image.category === "Startseite",
    );
    filtered = homeImages.length > 0 ? homeImages : filtered;
  }

  if (photographerOnly) {
    const photographerImages = filtered.filter((image) => image.isPhotographer);
    filtered = photographerImages.length > 0 ? photographerImages : filtered;
  }

  if (category && category !== "Alle") {
    filtered = filtered.filter((image) => image.category === category);
  }

  if (limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return NextResponse.json({ images: filtered });
}

export async function POST(request: NextRequest) {
  if (!(await canMutate(request))) {
    return NextResponse.json(
      { message: "Upload ist nicht autorisiert." },
      { status: 401 },
    );
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        message:
          "Bilder-Upload ist noch nicht eingerichtet. Setze CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY und CLOUDINARY_API_SECRET.",
        status: "not_configured",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { message: "Bitte wähle mindestens ein Bild aus." },
      { status: 400 },
    );
  }

  const category = normalizeCategory(formData.get("category"));
  const title = String(formData.get("title") ?? "").trim();
  const altPrefix = String(formData.get("alt") ?? "").trim();
  const useOnHome =
    formData.get("useOnHome") === "true" ||
    category === "Slider" ||
    category === "Startseite";
  const isPhotographer = formData.get("isPhotographer") === "true";
  const existingImages = await readImages();
  const buffers: { file: File; buffer: Buffer }[] = [];

  for (const file of files) {
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { message: `${file.name} ist kein unterstütztes Bildformat.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(buffer)) {
      return NextResponse.json(
        { message: `${file.name} ist keine gültige Bilddatei.` },
        { status: 400 },
      );
    }

    buffers.push({ file, buffer });
  }

  const uploadedImages: MediaImage[] = [];

  for (const { buffer } of buffers) {
    const result = await uploadImageBuffer(buffer);

    uploadedImages.push({
      id: randomUUID(),
      src: cloudinaryOptimizedUrl(result.public_id, result.version),
      publicId: result.public_id,
      title: title || altPrefix || `Fotografie ${uploadedImages.length + 1}`,
      alt: altPrefix || `Fotografie aus der Kategorie ${category}`,
      category,
      width: result.width,
      height: result.height,
      useOnHome,
      isPhotographer,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  const nextImages = [...uploadedImages, ...existingImages];
  await writeImages(nextImages);

  return NextResponse.json({ images: uploadedImages }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await canMutate(request))) {
    return NextResponse.json(
      { message: "Aendern ist nicht autorisiert." },
      { status: 401 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as
      | { id?: string; action?: "move-up" | "move-down" }
      | null;

    if (!body?.id || !body.action) {
      return NextResponse.json(
        { message: "Es wurde keine gueltige Aktion uebergeben." },
        { status: 400 },
      );
    }

    const images = await readImages();
    const index = images.findIndex((item) => item.id === body.id);
    const targetIndex =
      body.action === "move-up" ? index - 1 : body.action === "move-down" ? index + 1 : -1;

    if (index < 0 || targetIndex < 0 || targetIndex >= images.length) {
      return NextResponse.json({ images });
    }

    const nextImages = [...images];
    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];
    await writeImages(nextImages);
    return NextResponse.json({ images: nextImages });
  }

  const formData = await request.formData();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return NextResponse.json(
      { message: "Es wurde keine Bild-ID uebergeben." },
      { status: 400 },
    );
  }

  const images = await readImages();
  const imageIndex = images.findIndex((item) => item.id === id);
  if (imageIndex < 0) {
    return NextResponse.json(
      { message: "Bild wurde nicht gefunden." },
      { status: 404 },
    );
  }

  const currentImage = images[imageIndex];
  const replacement = formData.get("image");
  let replacementSrc: string | undefined;
  let replacementPublicId: string | undefined;

  if (replacement instanceof File && replacement.size > 0) {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          message:
            "Bilder-Upload ist noch nicht eingerichtet. Setze CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY und CLOUDINARY_API_SECRET.",
          status: "not_configured",
        },
        { status: 503 },
      );
    }

    if (!allowedTypes.has(replacement.type)) {
      return NextResponse.json(
        { message: `${replacement.name} ist kein unterstuetztes Bildformat.` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await replacement.arrayBuffer());
    if (!hasValidImageSignature(buffer)) {
      return NextResponse.json(
        { message: `${replacement.name} ist keine gültige Bilddatei.` },
        { status: 400 },
      );
    }

    const result = await uploadImageBuffer(buffer);
    replacementSrc = cloudinaryOptimizedUrl(result.public_id, result.version);
    replacementPublicId = result.public_id;

    await deleteCloudinaryImage(currentImage.publicId);
  }

  const alt = String(formData.get("alt") ?? currentImage.alt).trim();
  const title = String(formData.get("title") ?? currentImage.title ?? "").trim();
  const updatedImage: MediaImage = {
    ...currentImage,
    src: replacementSrc ?? currentImage.src,
    publicId: replacementPublicId ?? currentImage.publicId,
    title: title || currentImage.title || alt || currentImage.alt,
    alt: alt || currentImage.alt,
    category: normalizeCategoryWithFallback(formData.get("category"), currentImage.category),
    useOnHome: parseBoolean(formData.get("useOnHome"), Boolean(currentImage.useOnHome)),
    isPhotographer: parseBoolean(
      formData.get("isPhotographer"),
      Boolean(currentImage.isPhotographer),
    ),
    active: parseBoolean(formData.get("active"), isActive(currentImage)),
  };

  const nextImages = [...images];
  nextImages[imageIndex] = updatedImage;
  await writeImages(nextImages);

  return NextResponse.json({ image: updatedImage, images: nextImages });
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
      { message: "Es wurde keine Bild-ID übergeben." },
      { status: 400 },
    );
  }

  const images = await readImages();
  const image = images.find((item) => item.id === body.id);
  const remainingImages = images.filter((item) => item.id !== body.id);

  await deleteCloudinaryImage(image?.publicId);

  await writeImages(remainingImages);
  return NextResponse.json({ images: remainingImages });
}
