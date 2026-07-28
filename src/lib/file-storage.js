import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SERVICES_FILE = resolve(process.cwd(), "data/services.json");

export const MAX_PHOTOS_PER_SERVICE = 10;

function getServices() {
  try {
    const content = readFileSync(SERVICES_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function saveServices(services) {
  writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2) + "\n", "utf-8");
}

function getNextId(items) {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export async function listServicesWithPhotos() {
  return getServices();
}

export async function getService(id) {
  const services = getServices();
  return services.find((s) => s.id === id) ?? null;
}

export async function createService(title) {
  const services = getServices();
  const id = getNextId(services);
  const position = Math.max(0, ...services.map((s) => s.position), -1) + 1;
  const service = { id, title, position, photos: [] };
  services.push(service);
  saveServices(services);
  return service;
}

export async function updateServiceTitle(id, title) {
  const services = getServices();
  const service = services.find((s) => s.id === id);
  if (service) {
    service.title = title;
    saveServices(services);
  }
}

export async function reorderServices(orderedIds) {
  const services = getServices();
  orderedIds.forEach((id, index) => {
    const service = services.find((s) => s.id === id);
    if (service) service.position = index;
  });
  saveServices(services);
}

export async function moveServicePosition(id, direction) {
  const services = getServices();
  const ids = services.sort((a, b) => a.position - b.position).map((s) => s.id);
  const index = ids.indexOf(id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;

  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];

  ids.forEach((serviceId, idx) => {
    const service = services.find((s) => s.id === serviceId);
    if (service) service.position = idx;
  });

  saveServices(services);
}

export async function deleteService(id) {
  const services = getServices();
  const filtered = services.filter((s) => s.id !== id);
  saveServices(filtered);
  return { id };
}

export async function countPhotos(serviceId) {
  const service = await getService(serviceId);
  return service?.photos.length ?? 0;
}

export async function addPhoto(serviceId, { url, alt, supabasePublicId }) {
  const services = getServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return null;

  const photoId = getNextId(service.photos);
  const position = service.photos.length;
  const photo = { id: photoId, url, alt: alt ?? "", supabasePublicId: supabasePublicId ?? null, position };
  service.photos.push(photo);
  saveServices(services);
  return photo;
}

export async function getPhoto(photoId) {
  const services = getServices();
  for (const service of services) {
    const photo = service.photos.find((p) => p.id === photoId);
    if (photo) return photo;
  }
  return null;
}

export async function deletePhoto(photoId) {
  const services = getServices();
  for (const service of services) {
    const photoIndex = service.photos.findIndex((p) => p.id === photoId);
    if (photoIndex !== -1) {
      const [deleted] = service.photos.splice(photoIndex, 1);
      saveServices(services);
      return deleted;
    }
  }
  return null;
}

export async function reorderPhotos(serviceId, orderedPhotoIds) {
  const services = getServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;
  orderedPhotoIds.forEach((id, index) => {
    const photo = service.photos.find((p) => p.id === id);
    if (photo) photo.position = index;
  });
  saveServices(services);
}

export async function movePhotoPosition(serviceId, photoId, direction) {
  const services = getServices();
  const service = services.find((s) => s.id === serviceId);
  if (!service) return;

  const ids = service.photos.sort((a, b) => a.position - b.position).map((p) => p.id);
  const index = ids.indexOf(photoId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;

  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];

  ids.forEach((id, idx) => {
    const photo = service.photos.find((p) => p.id === id);
    if (photo) photo.position = idx;
  });

  saveServices(services);
}

export async function updatePhotoAlt(photoId, alt) {
  const photo = await getPhoto(photoId);
  if (photo) {
    photo.alt = alt;
    const services = getServices();
    saveServices(services);
  }
}