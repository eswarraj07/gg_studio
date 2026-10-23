import { addPhoto, countPhotos, MAX_PHOTOS_PER_SERVICE } from "../../../../../../lib/file-storage.js";

export const prerender = false;

export async function POST({ params, request }) {
  const serviceId = Number(params.id);

  const existingCount = await countPhotos(serviceId);
  if (existingCount >= MAX_PHOTOS_PER_SERVICE) {
    return new Response(
      JSON.stringify({ error: `Each service can have at most ${MAX_PHOTOS_PER_SERVICE} photos.` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const body = await request.json();
  const { url, alt, storageKey } = body ?? {};

  if (!url || typeof url !== "string") {
    return new Response(JSON.stringify({ error: "A photo url is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const photo = await addPhoto(serviceId, { url, alt, storageKey });
  return new Response(JSON.stringify({ photo }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
