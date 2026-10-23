import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import { CONTENT_TYPES, resolvePhotoPath } from "../../lib/photo-storage.js";
import { ensureDataDir } from "../../lib/data-dir.js";

export const prerender = false;

// Serves uploaded photos from the data directory (Railway Volume).
export async function GET({ params }) {
  ensureDataDir();

  const full = resolvePhotoPath(params.path);
  const ext = (params.path ?? "").toLowerCase().split(".").pop();
  const contentType = CONTENT_TYPES[ext];
  if (!full || !contentType) return new Response("Not found", { status: 404 });

  let stat;
  try {
    stat = statSync(full);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  if (!stat.isFile()) return new Response("Not found", { status: 404 });

  return new Response(Readable.toWeb(createReadStream(full)), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Last-Modified": stat.mtime.toUTCString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
