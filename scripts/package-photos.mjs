// Bundles the current photo set into gg-studio-photos.zip, one folder per
// service, plus services.json and the hero images. Handy for handing the
// content to someone or restoring a Railway Volume by hand.
//   npm run package-photos            -> uses ./data
//   DATA_DIR=/data npm run package-photos
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.env.DATA_DIR || "data");
const out = resolve("gg-studio-photos.zip");

if (!existsSync(resolve(dataDir, "services.json"))) {
  console.error(`No services.json in ${dataDir}`);
  process.exit(1);
}

rmSync(out, { force: true });
execFileSync("zip", ["-rq", out, "services.json", "photos"], { cwd: dataDir, stdio: "inherit" });
execFileSync("zip", ["-q", out, "hero/hero-800.jpg", "hero/hero-1200.jpg", "hero/hero-1800.jpg"], {
  cwd: resolve("public"),
  stdio: "inherit",
});
console.log(`Wrote ${out}`);
