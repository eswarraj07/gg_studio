import { deletePhoto } from "../../../../../../../lib/file-storage.js";
import { deletePhoto as deleteSupabasePhoto } from "../../../../../../../lib/supabase-storage.js";

export const prerender = false;

export async function POST({ params, redirect }) {
  const serviceId = Number(params.id);
  const photoId = Number(params.photoId);

  const deleted = await deletePhoto(serviceId, photoId);
  if (deleted?.supabasePublicId) {
    await deleteSupabasePhoto(deleted.supabasePublicId);
  }

  return redirect(`/admin/services/${serviceId}`);
}
