import pg from "pg";

const { Pool } = pg;

let pool;

/**
 * Lazily creates a single shared connection pool.
 * DATABASE_URL must be a standard Postgres connection string, e.g.
 * postgres://user:password@host:5432/dbname
 */
function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. See .env.example for the required environment variables.",
      );
    }
    pool = new Pool({
      connectionString,
      // Railway (and most managed Postgres) requires SSL in production but
      // not for a local Docker instance during development.
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export const MAX_PHOTOS_PER_SERVICE = 10;

export async function listServicesWithPhotos() {
  const db = getPool();
  const { rows: services } = await db.query(
    "select id, title, position from services order by position asc, id asc",
  );
  const { rows: photos } = await db.query(
    "select id, service_id, url, alt, cloudinary_public_id, position from service_photos order by position asc, id asc",
  );

  return services.map((service) => ({
    ...service,
    photos: photos.filter((photo) => photo.service_id === service.id),
  }));
}

export async function getService(id) {
  const db = getPool();
  const { rows: services } = await db.query(
    "select id, title, position from services where id = $1",
    [id],
  );
  const service = services[0];
  if (!service) return null;

  const { rows: photos } = await db.query(
    "select id, service_id, url, alt, cloudinary_public_id, position from service_photos where service_id = $1 order by position asc, id asc",
    [id],
  );
  return { ...service, photos };
}

export async function createService(title) {
  const db = getPool();
  const { rows } = await db.query(
    "select coalesce(max(position), -1) + 1 as next_position from services",
  );
  const nextPosition = rows[0].next_position;
  const { rows: inserted } = await db.query(
    "insert into services (title, position) values ($1, $2) returning id, title, position",
    [title, nextPosition],
  );
  return inserted[0];
}

export async function updateServiceTitle(id, title) {
  const db = getPool();
  await db.query(
    "update services set title = $1, updated_at = now() where id = $2",
    [title, id],
  );
}

export async function reorderServices(orderedIds) {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query("begin");
    for (let index = 0; index < orderedIds.length; index += 1) {
      await client.query("update services set position = $1 where id = $2", [
        index,
        orderedIds[index],
      ]);
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function moveServicePosition(id, direction) {
  const db = getPool();
  const { rows } = await db.query(
    "select id from services order by position asc, id asc",
  );
  const ids = rows.map((row) => row.id);
  const index = ids.indexOf(id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  await reorderServices(ids);
}

export async function movePhotoPosition(serviceId, photoId, direction) {
  const db = getPool();
  const { rows } = await db.query(
    "select id from service_photos where service_id = $1 order by position asc, id asc",
    [serviceId],
  );
  const ids = rows.map((row) => row.id);
  const index = ids.indexOf(photoId);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= ids.length) return;
  [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
  await reorderPhotos(serviceId, ids);
}

export async function updatePhotoAlt(photoId, alt) {
  const db = getPool();
  await db.query("update service_photos set alt = $1 where id = $2", [alt, photoId]);
}

export async function deleteService(id) {
  const db = getPool();
  // service_photos rows are removed automatically via ON DELETE CASCADE.
  const { rows } = await db.query(
    "delete from services where id = $1 returning id",
    [id],
  );
  return rows[0] ?? null;
}

export async function countPhotos(serviceId) {
  const db = getPool();
  const { rows } = await db.query(
    "select count(*)::int as count from service_photos where service_id = $1",
    [serviceId],
  );
  return rows[0].count;
}

export async function addPhoto(serviceId, { url, alt, cloudinaryPublicId }) {
  const db = getPool();
  const { rows } = await db.query(
    "select coalesce(max(position), -1) + 1 as next_position from service_photos where service_id = $1",
    [serviceId],
  );
  const nextPosition = rows[0].next_position;
  const { rows: inserted } = await db.query(
    `insert into service_photos (service_id, url, alt, cloudinary_public_id, position)
     values ($1, $2, $3, $4, $5)
     returning id, service_id, url, alt, cloudinary_public_id, position`,
    [serviceId, url, alt ?? "", cloudinaryPublicId ?? null, nextPosition],
  );
  return inserted[0];
}

export async function getPhoto(photoId) {
  const db = getPool();
  const { rows } = await db.query(
    "select id, service_id, url, alt, cloudinary_public_id, position from service_photos where id = $1",
    [photoId],
  );
  return rows[0] ?? null;
}

export async function deletePhoto(photoId) {
  const db = getPool();
  const { rows } = await db.query(
    "delete from service_photos where id = $1 returning id, cloudinary_public_id",
    [photoId],
  );
  return rows[0] ?? null;
}

export async function reorderPhotos(serviceId, orderedPhotoIds) {
  const db = getPool();
  const client = await db.connect();
  try {
    await client.query("begin");
    for (let index = 0; index < orderedPhotoIds.length; index += 1) {
      await client.query(
        "update service_photos set position = $1 where id = $2 and service_id = $3",
        [index, orderedPhotoIds[index], serviceId],
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
