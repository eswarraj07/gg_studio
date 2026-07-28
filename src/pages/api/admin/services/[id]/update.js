import { updateServiceTitle } from "../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request, redirect }) {
  const id = Number(params.id);
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();

  if (title) {
    await updateServiceTitle(id, title);
  }

  return redirect(`/admin/services/${id}`);
}
