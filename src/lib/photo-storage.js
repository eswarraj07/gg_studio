import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve, sep } from "node:path";
import { PHOTOS_DIR, ensureDataDir } from "./data-dir.js";

// Photo files live at <DATA_DIR>/photos/<storageKey> and are served by
// src/pages/photos/[...path].js at /photos/<storageKey>.

export const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
};

export function slugify(text) {
  return (
    text
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "misc"
  );
}

/** Resolves a storage key to an absolute path inside PHOTOS_DIR, or null if it escapes it. */
export function resolvePhotoPath(storageKey) {
  if (!storageKey || storageKey.includes("\0")) return null;
  const full = resolve(PHOTOS_DIR, storageKey);
  if (full !== PHOTOS_DIR && !full.startsWith(PHOTOS_DIR + sep)) return null;
  return full;
}

/** Writes an uploaded file under a per-service folder and returns its public URL + key. */
export async function uploadPhotoBuffer(buffer, filename, { serviceTitle = "" } = {}) {
  ensureDataDir();

  const safeName = basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = safeName.toLowerCase().split(".").pop();
  if (!CONTENT_TYPES[ext]) {
    throw new Error("Unsupported file type. Use JPG, PNG, GIF, WEBP or AVIF.");
  }

  const storageKey = `${slugify(serviceTitle)}/${Date.now()}-${safeName}`;
  const dest = resolvePhotoPath(storageKey);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, buffer);

  return { url: `/photos/${storageKey}`, storageKey };
}

/** Deletes a photo file by its storage key. Missing files are ignored. */
export async function deletePhotoFile(storageKey) {
  const full = resolvePhotoPath(storageKey);
  if (!full) return;
  try {
    unlinkSync(full);
  } catch (error) {
    if (error.code !== "ENOENT") console.error(`Failed to delete photo ${storageKey}:`, error);
  }
}
