import { uploadPhotoBuffer } from "../../../../../../lib/photo-storage.js";
import { getService } from "../../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file provided." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const service = await getService(Number(params.id));
    if (!service) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, storageKey } = await uploadPhotoBuffer(buffer, file.name, {
      serviceTitle: service.title,
    });

    return new Response(JSON.stringify({ url, storageKey }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}