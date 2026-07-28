import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not fully configured. See .env.example for CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / PUBLIC_CLOUDINARY_CLOUD_NAME.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  configured = true;
}

/** Deletes an uploaded image from Cloudinary. Safe to call with a null/undefined publicId (no-op). */
export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  ensureConfigured();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Don't let a Cloudinary hiccup block the DB delete the admin actually asked for.
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
  }
}
