import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";
import { cwd } from "process";

config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY or PUBLIC_SUPABASE_URL not set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImagesRecursive(dir, basePath = "") {
  const uploads = [];
  const items = readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      uploads.push(...(await uploadImagesRecursive(fullPath, relativePath)));
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)) {
      const buffer = readFileSync(fullPath);
      const filename = item.name;
      const filepath = `legacy/${relativePath}`;

      try {
        const { error } = await supabase.storage.from("photos").upload(filepath, buffer, {
          contentType: `image/${filename.endsWith(".png") ? "png" : "jpeg"}`,
          upsert: true,
        });

        if (error) throw error;

        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filepath);
        console.log(`✓ Uploaded: ${filepath}`);
        uploads.push({ localPath: `/${relativePath}`, supabasePath: filepath, url: urlData.publicUrl });
      } catch (err) {
        console.error(`✗ Failed to upload ${filepath}:`, err.message);
      }
    }
  }

  return uploads;
}

async function updateServicesJson(uploadMap) {
  const servicesPath = join(cwd(), "data/services.json");
  const services = JSON.parse(readFileSync(servicesPath, "utf-8"));

  let updatedCount = 0;

  for (const service of services) {
    for (const photo of service.photos) {
      const url = photo.url;
      const upload = uploadMap.find((u) => u.url && url.includes(u.localPath.split("/").pop()));

      if (upload) {
        photo.url = upload.url;
        photo.supabasePublicId = upload.supabasePath;
        updatedCount++;
        console.log(`Updated: ${service.title} - ${photo.alt || "photo"}`);
      }
    }
  }

  const fs = await import("fs");
  fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2) + "\n", "utf-8");
  console.log(`\n✓ Updated ${updatedCount} photo URLs in services.json`);
}

async function main() {
  console.log("Starting image migration to Supabase...\n");

  const publicPhotosDir = join(cwd(), "public/photos");
  console.log(`Uploading images from ${publicPhotosDir}...\n`);

  const uploads = await uploadImagesRecursive(publicPhotosDir, "");

  if (uploads.length === 0) {
    console.log("No images found to upload");
    return;
  }

  console.log(`\nSuccessfully uploaded ${uploads.length} images`);
  console.log("Updating services.json with Supabase URLs...\n");

  await updateServicesJson(uploads);
  console.log("\n✓ Migration complete!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
