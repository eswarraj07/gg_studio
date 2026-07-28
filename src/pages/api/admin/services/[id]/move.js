import { moveServicePosition } from "../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request, redirect }) {
  const id = Number(params.id);
  const form = await request.formData();
  const direction = form.get("direction");

  if (direction === "up" || direction === "down") {
    await moveServicePosition(id, direction);
  }

  return redirect("/admin");
}
