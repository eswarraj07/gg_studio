import { getService, deleteService } from "../../../../../lib/file-storage.js";
import { deletePhotoFile } from "../../../../../lib/photo-storage.js";

export const prerender = false;

export async function POST({ params, redirect }) {
  const id = Number(params.id);

  const service = await getService(id);
  if (service) {
    await Promise.all(
      service.photos
        .filter((photo) => photo.storageKey)
        .map((photo) => deletePhotoFile(photo.storageKey)),
    );
  }

  await deleteService(id);
  return redirect("/admin");
}
