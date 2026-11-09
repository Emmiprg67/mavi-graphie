import { randomUUID } from "crypto";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import type { MediaImage } from "@/types/media";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

const manifestPublicId = "mavi-graphie/manifest/media";

// cloudinary.url() inserts a placeholder "v1" path segment for `raw`
// resources when no explicit version is given, which 404s. Build the
// delivery URL by hand instead — it's stable for a fixed, overwritten
// public ID.
function manifestDeliveryUrl() {
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${manifestPublicId}`;
}

export async function readImages(): Promise<MediaImage[]> {
  const response = await fetch(`${manifestDeliveryUrl()}?v=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 404) return [];
    console.error(
      `readImages: Abruf des Cloudinary-Manifests fehlgeschlagen (${response.status} ${response.statusText}).`,
    );
    return [];
  }

  const parsed = await response.json().catch(() => null);
  if (parsed === null) {
    console.error("readImages: Manifest enthaelt kein gueltiges JSON.");
  }
  return Array.isArray(parsed) ? (parsed as MediaImage[]) : [];
}

export async function writeImages(images: MediaImage[]) {
  const buffer = Buffer.from(JSON.stringify(images, null, 2));
  await new Promise<void>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: manifestPublicId,
        overwrite: true,
        invalidate: true,
      },
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      },
    );
    uploadStream.end(buffer);
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
