import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import getManifest from "../app/manifest.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function optimizeSvgPath(d) {
  // Round decimal coordinates to 1 decimal place to cut size by >55% with zero visual loss on 500x500 viewBox
  return d
    .replace(/(-?\d+)\.(\d)\d*/g, "$1.$2")
    .replace(/\.0\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const esbuild = await import("esbuild");

  // 1. Read and optimize all 109 exercise SVG animation files
  const artDir = path.join(rootDir, "public", "art");
  const artFiles = fs.readdirSync(artDir).filter((f) => f.endsWith(".txt"));
  const artMap = {};
  for (const file of artFiles) {
    const slug = file.replace(/\.txt$/, "");
    const raw = fs.readFileSync(path.join(artDir, file), "utf8");
    const frames = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map(optimizeSvgPath);
    if (frames.length) {
      artMap[slug] = frames;
    }
  }

  // 2. Create temporary standalone React entry with ErrorBoundary
  const entryPath = path.join(rootDir, "scripts", ".tmp-entry.jsx");
  fs.writeFileSync(
    entryPath,
    `import React from "react";
import { createRoot } from "react-dom/client";
import GymManeApp from "../components/GymManeApp.jsx";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "sans-serif", background: "#0c1021", color: "#F4F4F6", minHeight: "100vh" }}>
          <h2 style={{ color: "#FF6B35" }}>GymMane</h2>
          <p>Ocurrió un error al cargar los datos guardados. Pulsa abajo para reiniciar:</p>
          <button
            onClick={() => {
              try { localStorage.clear(); } catch (e) {}
              window.location.reload();
            }}
            style={{ padding: "12px 18px", background: "#10B981", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}
          >
            Reiniciar aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function boot() {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(
      <RootErrorBoundary>
        <GymManeApp />
      </RootErrorBoundary>
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
`,
    "utf8"
  );

  // 3. Bundle with esbuild into a single minified JS string (Targeting ES2018 for broad Android WebView support)
  const result = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2018"],
    jsx: "automatic",
    write: false,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  });
  fs.unlinkSync(entryPath);

  const bundledJs = result.outputFiles[0].text;
  const css = fs.readFileSync(path.join(rootDir, "app", "globals.css"), "utf8");
  const artJs = `window.__EXERCISE_ART__ = ${JSON.stringify(artMap)};`;

  // Escape any accidental </script> sequences inside bundled JS
  const safeBundledJs = bundledJs.replace(/<\/script>/gi, "<\\/script>");
  const safeArtJs = artJs.replace(/<\/script>/gi, "<\\/script>");

  // Create split files for APK & Web (index.html + art-bundle.js)
  const appHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0c1021" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <title>GymMane · Fuerza a tu ritmo</title>
  <link rel="icon" type="image/svg+xml" href="icon.svg" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />
  <link rel="manifest" href="manifest.webmanifest" />
  <style>
    html, body, #root { min-height: 100%; width: 100%; margin: 0; padding: 0; background-color: #0c1021; }
    ${css}
  </style>
</head>
<body>
  <div id="root">
    <div class="brand-intro"><div class="brand-intro-signature"><img src="logo.svg" width="308" height="92" alt="GymMane" /><p>Fuerza a tu ritmo</p></div></div>
  </div>
  <script src="art-bundle.js"></script>
  <script>${safeBundledJs}</script>
</body>
</html>`;

  const outDir = path.join(rootDir, "dist-apk");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), appHtml, "utf8");
  fs.writeFileSync(path.join(outDir, "art-bundle.js"), safeArtJs, "utf8");
  for (const asset of ["icon.svg", "logo.svg", "apple-touch-icon.png"]) {
    fs.copyFileSync(path.join(rootDir, "public", asset), path.join(outDir, asset));
  }

  // Also write to docs/ for GitHub Pages (https://rony1030.github.io/mi-salud-ranita/)
  const docsDir = path.join(rootDir, "docs");
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, "index.html"), appHtml, "utf8");
  fs.writeFileSync(path.join(docsDir, "art-bundle.js"), safeArtJs, "utf8");
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "", "utf8");
  for (const asset of ["icon.svg", "logo.svg", "apple-touch-icon.png"]) {
    fs.copyFileSync(path.join(rootDir, "public", asset), path.join(docsDir, asset));
  }
  const manifest = getManifest();
  manifest.start_url = "./";
  manifest.icons = manifest.icons.map((icon) => ({ ...icon, src: "." + icon.src }));
  const manifestJson = JSON.stringify(manifest, null, 2) + "\n";
  for (const target of [outDir, docsDir]) {
    fs.writeFileSync(path.join(target, "manifest.webmanifest"), manifestJson, "utf8");
  }

  console.log(
    `✅ Built standalone Web & APK bundle: index.html (${(appHtml.length / 1024).toFixed(1)} KB) + art-bundle.js (${(safeArtJs.length / 1024).toFixed(1)} KB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
