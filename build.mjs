import fs from "fs";
import path from "path";

const out = "dist";
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const files = ["index.html", "styles.css", "app.js", "manifest.json", "icon.svg"];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${file}`);
  fs.copyFileSync(file, path.join(out, file));
}

console.log("Build complete.");
