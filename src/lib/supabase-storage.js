import { getSupabaseClient } from "./supabase-client.js";

/** Uploads a file buffer to Supabase Storage and returns the public URL. */
export async function uploadPhotoBuffer(buffer, filename) {
  const client = getSupabaseClient();
  const filepath = `photos/${Date.now()}-${filename}`;

  // Detect content type from filename
  const ext = filename.toLowerCase().split('.').pop();
  const contentTypeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  const contentType = contentTypeMap[ext] || 'image/jpeg';

  const { data, error } = await client.storage
    .from("photos")
    .upload(filepath, buffer, { contentType });

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
