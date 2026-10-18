import { randomUUID } from "crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { list, put } from "@vercel/blob";
import type { MediaAlbum, MediaImage } from "@/types/media";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

const imagesManifestPathname = "media.json";
const albumsManifestPathname = "albums.json";

export async function readImages(): Promise<MediaImage[]> {
  const { blobs } = await list({ prefix: imagesManifestPathname, limit: 1 });
  const manifest = blobs.find((blob) => blob.pathname === imagesManifestPathname);
  if (!manifest) return [];

  const response = await fetch(manifest.url, { cache: "no-store" });
  if (!response.ok) return [];

  const parsed = await response.json().catch(() => null);
  return Array.isArray(parsed) ? (parsed as MediaImage[]) : [];
}

export async function writeImages(images: MediaImage[]) {
  await put(imagesManifestPathname, JSON.stringify(images, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function readAlbums(): Promise<MediaAlbum[]> {
  const { blobs } = await list({ prefix: albumsManifestPathname, limit: 1 });
  const manifest = blobs.find((blob) => blob.pathname === albumsManifestPathname);
  if (!manifest) return [];

  const response = await fetch(manifest.url, { cache: "no-store" });
  if (!response.ok) return [];

  const parsed = await response.json().catch(() => null);
  return Array.isArray(parsed) ? (parsed as MediaAlbum[]) : [];
}

export async function writeAlbums(albums: MediaAlbum[]) {
  await put(albumsManifestPathname, JSON.stringify(albums, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

const cloudinaryFolder = "mavi-graphie/uploads";

export function uploadImageBuffer(buffer: Buffer): Promise<UploadApiResponse> {
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

export function cloudinaryOptimizedUrl(publicId: string, version: number) {
  return cloudinary.url(publicId, {
    secure: true,
    version,
    quality: "auto",
    fetch_format: "auto",
  });
}

export async function deleteCloudinaryImage(publicId: string | undefined) {
  if (!publicId) return;
  await cloudinary.uploader
    .destroy(publicId, { resource_type: "image", invalidate: true })
    .catch(() => undefined);
}

export function isActiveImage(image: MediaImage) {
  return image.active !== false;
}
