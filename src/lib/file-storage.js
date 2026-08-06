import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getSupabaseClient } from "./supabase-client.js";

// In production, services.json lives in the Supabase "photos" bucket so
// admin edits survive Railway redeploys (the container filesystem is
// ephemeral). In local dev (astro dev) it is read from and written to
// the committed data/services.json directly, so testing never touches
// production data. That same committed file doubles as the first-run
// seed for the bucket.
const IS_LOCAL = import.meta.env.DEV;
const BUCKET = "photos";
const OBJECT_PATH = "data/services.json";
const CACHE_TTL_MS = 30_000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCAL_FILE = resolve(__dirname, "../../data/services.json");

export const MAX_PHOTOS_PER_SERVICE = 10;

let cache = null;
let cacheTime = 0;

function readLocalFile() {
  try {
    return JSON.parse(readFileSync(LOCAL_FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function loadServices() {
  if (IS_LOCAL) return readLocalFile();

  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) return cache;

  const client = getSupabaseClient();
  const { data, error } = await client.storage.from(BUCKET).download(OBJECT_PATH);

  if (error) {
    // First run: the file doesn't exist in the bucket yet — seed it.
    const seed = readLocalFile();
    await saveServices(seed);
    return seed;
  }

  cache = JSON.parse(await data.text());
  cacheTime = Date.now();
  return cache;
}

async function saveServices(services) {
  const body = JSON.stringify(services, null, 2) + "\n";

  if (IS_LOCAL) {
    writeFileSync(LOCAL_FILE, body, "utf-8");
    return;
  }

  const { error } = await getSupabaseClient()
    .storage.from(BUCKET)
    .upload(OBJECT_PATH, Buffer.from(body), { contentType: "application/json", upsert: true });

  if (error) {
    throw new Error(`Failed to save services.json to Supabase: ${error.message}`);
  }

  cache = services;
  cacheTime = Date.now();
}

function getNextId(items) {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export async function listServicesWithPhotos() {
  const services = await loadServices();
  return [...services]
    .sort((a, b) => a.position - b.position)
    .map((s) => ({ ...s, photos: [...s.photos].sort((a, b) => a.position - b.position) }));
}

export async function getService(id) {
  const services = await listServicesWithPhotos();
  return services.find((s) => s.id === id) ?? null;
}

export async function createService(title) {
  const services = await loadServices();
  const id = getNextId(services);
  const position = Math.max(0, ...services.map((s) => s.position), -1) + 1;
  const service = { id, title, position, photos: [] };
  services.push(service);
  await saveServices(services);
  return service;
}

export async function updateServiceTitle(id, title) {
  const services = await loadServices();
  const service = services.find((s) => s.id === id);
  if (service) {
    service.title = title;
    await saveServices(services);
  }
}

export async function moveServicePosition(id, direction) {
  const services = await loadServices();
  const ids = [...services].sort((a, b) => a.position - b.position).map((s) => s.id);
  const index = ids.indexOf(id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;

  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];

  ids.forEach((serviceId, idx) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) service.position = idx;
  });

  await saveServices(services);
}

export async function deleteService(id) {
  const services = await loadServices();
  const filtered = services.filter((s) => s.id !== id);
  await saveServices(filtered);
  return { id };
}

export async function countPhotos(serviceId) {
  const service = await getService(serviceId);
  return service?.photos.length ?? 0;
}

export async function addPhoto(serviceId, { url, alt, supabasePublicId }) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return null;

  const photoId = getNextId(service.photos);
  const position = service.photos.length;
  const photo = { id: photoId, url, alt: alt ?? "", supabasePublicId: supabasePublicId ?? null, position };
  service.photos.push(photo);
  await saveServices(services);
  return photo;
}

// Photo ids are only unique within a service (addPhoto assigns per-service
// max+1), so photo lookups must always be scoped by serviceId.
export async function getPhoto(serviceId, photoId) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  return service?.photos.find((p) => p.id === photoId) ?? null;
}

export async function deletePhoto(serviceId, photoId) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return null;

  const photoIndex = service.photos.findIndex((p) => p.id === photoId);
  if (photoIndex === -1) return null;

  const [deleted] = service.photos.splice(photoIndex, 1);
  service.photos
    .sort((a, b) => a.position - b.position)
    .forEach((p, idx) => (p.position = idx));
  await saveServices(services);
  return deleted;
}

export async function movePhotoPosition(serviceId, photoId, direction) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;

  const ids = [...service.photos].sort((a, b) => a.position - b.position).map((p) => p.id);
  const index = ids.indexOf(photoId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;

  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];

  ids.forEach((id, idx) => {
    const photo = service.photos.find((p) => p.id === id);
    if (photo) photo.position = idx;
  });

  await saveServices(services);
}

export async function updatePhotoAlt(serviceId, photoId, alt) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  const photo = service?.photos.find((p) => p.id === photoId);
  if (photo) {
    photo.alt = alt;
    await saveServices(services);
  }
}
