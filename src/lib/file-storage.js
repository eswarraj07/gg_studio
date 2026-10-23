import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { SERVICES_FILE, ensureDataDir } from "./data-dir.js";

// services.json (service titles, ordering and photo metadata) lives in
// DATA_DIR — see data-dir.js. It is small, so it is re-read on every
// request and written atomically (temp file + rename).

export const MAX_PHOTOS_PER_SERVICE = 10;

async function loadServices() {
  ensureDataDir();
  try {
    return JSON.parse(readFileSync(SERVICES_FILE, "utf-8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw new Error(`Could not read ${SERVICES_FILE}: ${error.message}`);
  }
}

async function saveServices(services) {
  ensureDataDir();
  const tmp = `${SERVICES_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(services, null, 2) + "\n", "utf-8");
  renameSync(tmp, SERVICES_FILE);
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

export async function addPhoto(serviceId, { url, alt, storageKey }) {
  const services = await loadServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return null;

  const photoId = getNextId(service.photos);
  const position = service.photos.length;
  const photo = { id: photoId, url, alt: alt ?? "", storageKey: storageKey ?? null, position };
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
