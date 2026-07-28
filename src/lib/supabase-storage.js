import { createClient } from "@supabase/supabase-js";

let supabase;

function getSupabaseClient() {
  if (supabase) return supabase;

  const url = process.env.PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  supabase = createClient(url, key);
  return supabase;
}

/** Uploads a file buffer to Supabase Storage and returns the public URL. */
export async function uploadPhotoBuffer(buffer, filename) {
  const client = getSupabaseClient();
  const filepath = `photos/${Date.now()}-${filename}`;

  const { data, error } = await client.storage
    .from("photos")
    .upload(filepath, buffer, { contentType: "image/jpeg" });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data: urlData } = client.storage
    .from("photos")
    .getPublicUrl(filepath);

  return {
    url: urlData.publicUrl,
    supabasePublicId: filepath,
  };
}

/** Deletes a photo from Supabase Storage by its filepath. */
export async function deletePhoto(supabasePublicId) {
  if (!supabasePublicId) return;

  const client = getSupabaseClient();
  const { error } = await client.storage.from("photos").remove([supabasePublicId]);

  if (error) {
    console.error(`Failed to delete Supabase asset ${supabasePublicId}:`, error);
  }
}
