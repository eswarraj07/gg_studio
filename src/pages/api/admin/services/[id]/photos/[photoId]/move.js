import { movePhotoPosition } from "../../../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request, redirect }) {
  const serviceId = Number(params.id);
  const photoId = Number(params.photoId);
  const form = await request.formData();
  const direction = form.get("direction");

  if (direction === "up" || direction === "down") {
    await movePhotoPosition(serviceId, photoId, direction);
  }

  return redirect(`/admin/services/${serviceId}`);
}
