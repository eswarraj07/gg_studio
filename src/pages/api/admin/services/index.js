import { createService } from "../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ request, redirect }) {
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();

  if (!title) {
    return redirect("/admin?error=Title+is+required");
  }

  const service = await createService(title);
  return redirect(`/admin/services/${service.id}`);
}
