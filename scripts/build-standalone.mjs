import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function main() {
  const esbuildPath = "/tmp/apk-tools/node_modules/esbuild/lib/main.js";
  const esbuild = await import(esbuildPath);

  // 1. Read all 109 exercise SVG animation files into a compact map
  const artDir = path.join(rootDir, "public", "art");
  const artFiles = fs.readdirSync(artDir).filter((f) => f.endsWith(".txt"));
  const artMap = {};
  for (const file of artFiles) {
    const slug = file.replace(/\.txt$/, "");
    const raw = fs.readFileSync(path.join(artDir, file), "utf8");
    const frames = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (frames.length) {
      artMap[slug] = frames;
    }
  }

  // 2. Create temporary standalone React entry
  const entryPath = path.join(rootDir, "scripts", ".tmp-entry.jsx");
  fs.writeFileSync(
    entryPath,
    `import React from "react";
import { createRoot } from "react-dom/client";
import SaludApp from "../components/SaludApp.jsx";

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<SaludApp />);
}
`,
    "utf8"
  );

  // 3. Bundle with esbuild into a single minified JS string
  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2020"],
    jsx: "automatic",
    write: false,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });
  fs.unlinkSync(entryPath);

  const bundledJs = result.outputFiles[0].text;
  const css = fs.readFileSync(path.join(rootDir, "app", "globals.css"), "utf8");

  const html = `<!DOCTYPE html>
<html lang="es-DO">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#0c094e" />
  <title>Mi Salud · Ranita GLP-1 (Mounjaro / Ozempic)</title>
  <style>${css}</style>
</head>
<body>
  <div id="root"></div>
  <script>window.__EXERCISE_ART__ = ${JSON.stringify(artMap)};</script>
  <script>${bundledJs}</script>
</body>
</html>`;

  const outDir = path.join(rootDir, "dist-apk");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "index.html");
  fs.writeFileSync(outFile, html, "utf8");
  console.log(`Built standalone HTML: ${outFile} (${(html.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
