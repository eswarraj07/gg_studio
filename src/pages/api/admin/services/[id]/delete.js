import { getService, deleteService } from "../../../../../lib/file-storage.js";
import { deletePhoto } from "../../../../../lib/supabase-storage.js";

export const prerender = false;

export async function POST({ params, redirect }) {
  const id = Number(params.id);

  const service = await getService(id);
  if (service) {
    await Promise.all(
      service.photos
        .filter((photo) => photo.supabasePublicId)
        .map((photo) => deletePhoto(photo.supabasePublicId)),
    );
  }

  await deleteService(id);
  return redirect("/admin");
}
