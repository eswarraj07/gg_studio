import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseClient } from "./supabase-client.js";

// In local dev (astro dev), photos are written to public/uploads/ and
// served by the dev server, so testing never touches the Supabase
// bucket. Local photos are tagged with a "local:" publicId prefix so
// deletes know where to look. In production, photos go to Supabase.
const IS_LOCAL = import.meta.env.DEV;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../../public");

/** Uploads a file buffer and returns its public URL. */
export async function uploadPhotoBuffer(buffer, filename) {
  const safeName = basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  const filepath = `${IS_LOCAL ? "uploads" : "photos"}/${Date.now()}-${safeName}`;

  if (IS_LOCAL) {
    const dest = resolve(PUBLIC_DIR, filepath);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buffer);
    return { url: `/${filepath}`, supabasePublicId: `local:${filepath}` };
  }

  const client = getSupabaseClient();

  const ext = safeName.toLowerCase().split(".").pop();
  const contentTypeMap = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  const contentType = contentTypeMap[ext] || "image/jpeg";

  const { error } = await client.storage.from("photos").upload(filepath, buffer, { contentType });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage.from("photos").getPublicUrl(filepath);

  return {
    url: urlData.publicUrl,
    supabasePublicId: filepath,
  };
}

/** Deletes a previously uploaded photo by its publicId. */
export async function deletePhoto(supabasePublicId) {
  if (!supabasePublicId) return;

  if (supabasePublicId.startsWith("local:")) {
    try {
      unlinkSync(resolve(PUBLIC_DIR, supabasePublicId.slice("local:".length)));
    } catch {
      // already gone — nothing to do
    }
    return;
  }

  // Never delete production bucket assets from local dev.
  if (IS_LOCAL) return;

  const client = getSupabaseClient();
  const { error } = await client.storage.from("photos").remove([supabasePublicId]);

  if (error) {
    console.error(`Failed to delete Supabase asset ${supabasePublicId}:`, error);
  }
}
