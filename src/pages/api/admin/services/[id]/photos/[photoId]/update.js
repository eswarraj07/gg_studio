import { updatePhotoAlt } from "../../../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request, redirect }) {
  const serviceId = Number(params.id);
  const photoId = Number(params.photoId);
  const form = await request.formData();
  const alt = String(form.get("alt") ?? "").trim();

  await updatePhotoAlt(serviceId, photoId, alt);
  return redirect(`/admin/services/${serviceId}`);
}
