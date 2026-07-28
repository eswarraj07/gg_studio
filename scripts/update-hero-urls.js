// Hero images are now stored in Supabase
// Update the URLs in src/data/content.js

const supabaseUrl = "https://spwrgzmyokfsbxwjaxlh.supabase.co";
const bucketName = "photos";

const heroUrls = {
  "hero-800.jpg": `${supabaseUrl}/storage/v1/object/public/${bucketName}/legacy/hero/hero-800.jpg`,
  "hero-1200.jpg": `${supabaseUrl}/storage/v1/object/public/${bucketName}/legacy/hero/hero-1200.jpg`,
  "hero-1800.jpg": `${supabaseUrl}/storage/v1/object/public/${bucketName}/legacy/hero/hero-1800.jpg`,
};

const fs = require("fs");
const path = require("path");

const contentPath = path.join(process.cwd(), "src/data/content.js");
let content = fs.readFileSync(contentPath, "utf-8");

// Replace hero URLs
content = content.replace(
  /export const heroImage = \{[\s\S]*?\n\};/,
  `export const heroImage = {
  srcset: [
    { src: "${heroUrls["hero-800.jpg"]}", width: 800 },
    { src: "${heroUrls["hero-1200.jpg"]}", width: 1200 },
    { src: "${heroUrls["hero-1800.jpg"]}", width: 1800 },
  ],
  src: "${heroUrls["hero-1800.jpg"]}",
  alt: "Bride in traditional gold jewelry and silk saree, studio portrait",
};`
);

fs.writeFileSync(contentPath, content, "utf-8");
console.log("✓ Updated hero image URLs in src/data/content.js");
