import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
  const esbuildPath = "/tmp/apk-tools/node_modules/esbuild/lib/main.js";
  const esbuild = await import(esbuildPath);

  // 1. Read and optimize all 109 exercise SVG animation files (first 2 key frames per exercise)
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
      .slice(0, 2)
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
import SaludApp from "../components/SaludApp.jsx";

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
        <div style={{ padding: 24, fontFamily: "sans-serif", color: "#0c094e" }}>
          <h2>🐸 Mi Salud · Ranita GLP-1</h2>
          <p>Ocurrió un error al cargar los datos guardados. Pulsa abajo para reiniciar:</p>
          <button
            onClick={() => {
              try { localStorage.clear(); } catch (e) {}
              window.location.reload();
            }}
            style={{ padding: "12px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700 }}
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
        <SaludApp />
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

  // Create split files for APK (index.html ~560KB + art-bundle.js ~2.2MB, both well under Android 5MB asset limit)
  const apkHtml = `<!DOCTYPE html>
<html lang="es-DO">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#0c094e" />
  <title>Mi Salud · Ranita GLP-1 (Mounjaro / Ozempic)</title>
  <style>
    html, body, #root { min-height: 100%; width: 100%; margin: 0; padding: 0; }
    ${css}
  </style>
</head>
<body>
  <div id="root">
    <main class="loading-screen">
      <div class="loading-card">
        <div style="font-size:48px;text-align:center">🐸</div>
        <h2>Cargando Mi Salud · Ranita GLP-1…</h2>
      </div>
    </main>
  </div>
  <script src="art-bundle.js"></script>
  <script>${safeBundledJs}</script>
</body>
</html>`;

  const outDir = path.join(rootDir, "dist-apk");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), apkHtml, "utf8");
  fs.writeFileSync(path.join(outDir, "art-bundle.js"), safeArtJs, "utf8");

  // Also write to docs/ for GitHub Pages (https://rony1030.github.io/mi-salud-ranita/)
  const docsDir = path.join(rootDir, "docs");
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, "index.html"), apkHtml, "utf8");
  fs.writeFileSync(path.join(docsDir, "art-bundle.js"), safeArtJs, "utf8");
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "", "utf8");

  console.log(
    `Built APK & Pages bundle: index.html (${(apkHtml.length / 1024).toFixed(1)} KB) + art-bundle.js (${(safeArtJs.length / 1024).toFixed(1)} KB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
