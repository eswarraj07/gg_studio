import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// All editable content (services.json + uploaded photos) lives in one
// directory, DATA_DIR. On Railway that is a persistent Volume, so admin
// edits survive redeploys. Resolution order:
//   1. DATA_DIR env var (explicit override)
//   2. RAILWAY_VOLUME_MOUNT_PATH (set automatically when a Volume is attached)
//   3. the repo's own data/ folder (local dev, or a deploy with no volume —
//      edits then live only until the next deploy, and a warning is logged)
//
// The committed data/ folder is also the first-run seed: when DATA_DIR has
// no services.json yet, the seed content and photos are copied in.
const __dirname = dirname(fileURLToPath(import.meta.url));
// src/lib/ -> <repo>/data in dev; dist/server/chunks/ -> dist/data in the
// build (astro.config.mjs copies data/ there at build time).
const SEED_DIR = resolve(__dirname, "../../data");

export const DATA_DIR = resolve(
  process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || SEED_DIR,
);
export const PHOTOS_DIR = resolve(DATA_DIR, "photos");
export const SERVICES_FILE = resolve(DATA_DIR, "services.json");

let ready = false;

/** Makes sure DATA_DIR exists and is seeded. Cheap after the first call. */
export function ensureDataDir() {
  if (ready) return;
  mkdirSync(PHOTOS_DIR, { recursive: true });

  if (!existsSync(SERVICES_FILE) && DATA_DIR !== SEED_DIR) {
    console.log(`[storage] seeding ${DATA_DIR} from ${SEED_DIR}`);
    cpSync(SEED_DIR, DATA_DIR, { recursive: true, force: false });
  }

  if (!import.meta.env.DEV && DATA_DIR === SEED_DIR) {
    console.warn(
      "[storage] No volume attached (DATA_DIR / RAILWAY_VOLUME_MOUNT_PATH unset). " +
        "Admin edits will be lost on the next deploy.",
    );
  }
  ready = true;
}
