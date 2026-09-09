import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const docsDir = join(rootDir, "docs");

// These files become the checked-in GitHub Pages entrypoints and shared page assets
// that must be committed alongside source changes whenever the public tools change.
const managedFiles = [
  { from: join(rootDir, "public-visualizer.html"), to: join(docsDir, "index.html") },
  { from: join(rootDir, "public-visualizer.css"), to: join(docsDir, "public-visualizer.css") },
  { from: join(rootDir, "public-visualizer.config.js"), to: join(docsDir, "public-visualizer.config.js") },
  { from: join(rootDir, "public-study-builder.html"), to: join(docsDir, "public-study-builder.html") },
  { from: join(rootDir, "public-study-design.html"), to: join(docsDir, "public-study-design.html") },
  { from: join(rootDir, "public-study-sensors.html"), to: join(docsDir, "public-study-sensors.html") },
  { from: join(rootDir, "public-results-viewer.html"), to: join(docsDir, "public-results-viewer.html") },
  { from: join(rootDir, "public-tools.css"), to: join(docsDir, "public-tools.css") },
  { from: join(rootDir, "platform.css"), to: join(docsDir, "platform.css") },
  { from: join(rootDir, "styles.css"), to: join(docsDir, "styles.css") },
];

// The public tools import these source modules directly, so the Pages build copies them
// into docs/ rather than bundling them. GitHub Pages serves these copied modules as the
// deployed browser application.
const managedDirs = [
  { from: join(rootDir, "src", "app"), to: join(docsDir, "src", "app") },
  { from: join(rootDir, "src", "services"), to: join(docsDir, "src", "services") },
  { from: join(rootDir, "src", "platform"), to: join(docsDir, "src", "platform") },
  { from: join(rootDir, "src", "public"), to: join(docsDir, "src", "public") },
  { from: join(rootDir, "src", "scene"), to: join(docsDir, "src", "scene") },
  { from: join(rootDir, "src", "systems"), to: join(docsDir, "src", "systems") },
  { from: join(rootDir, "src", "ground"), to: join(docsDir, "src", "ground") },
  { from: join(rootDir, "src", "crops"), to: join(docsDir, "src", "crops") },
  { from: join(rootDir, "src", "utils"), to: join(docsDir, "src", "utils") },
  { from: join(rootDir, "src", "ui"), to: join(docsDir, "src", "ui") },
  { from: join(rootDir, "packages", "shared", "dist"), to: join(docsDir, "packages", "shared", "dist") },
  { from: join(rootDir, "packages", "three-exporter", "dist"), to: join(docsDir, "packages", "three-exporter", "dist") },
  { from: join(rootDir, "packages", "simulation-backend", "dist"), to: join(docsDir, "packages", "simulation-backend", "dist") },
];

async function copyDirectory(sourceDir, targetDir) {
  await mkdir(targetDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await mkdir(dirname(targetPath), { recursive: true });
      await copyFile(sourcePath, targetPath);
    }
  }
}

async function main() {
  await mkdir(docsDir, { recursive: true });
  // Regenerate the copied source tree on every build so stale modules do not survive between runs.
  // This keeps the committed docs/ artifact aligned with the source tree used for development.
  await rm(join(docsDir, "src"), { recursive: true, force: true });
  await rm(join(docsDir, "packages"), { recursive: true, force: true });

  for (const file of managedFiles) {
    await mkdir(dirname(file.to), { recursive: true });
    await copyFile(file.from, file.to);
  }

  for (const dir of managedDirs) {
    await copyDirectory(dir.from, dir.to);
  }

  // GitHub Pages should serve the copied package and source directories without Jekyll filtering.
  await writeFile(join(docsDir, ".nojekyll"), "");
  process.stdout.write(`GitHub Pages files generated in ${docsDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
