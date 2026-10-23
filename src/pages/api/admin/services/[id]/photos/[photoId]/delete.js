import { deletePhoto } from "../../../../../../../lib/file-storage.js";
import { deletePhotoFile } from "../../../../../../../lib/photo-storage.js";

export const prerender = false;

export async function POST({ params, redirect }) {
  const serviceId = Number(params.id);
  const photoId = Number(params.photoId);

  const deleted = await deletePhoto(serviceId, photoId);
  if (deleted?.storageKey) {
    await deletePhotoFile(deleted.storageKey);
  }

  return redirect(`/admin/services/${serviceId}`);
}
