#!/usr/bin/env node
/**
 * After `astro build`, copy each package's src/ folder and any demo
 * assets (images, css, media) into the Astro dist output so that demo
 * pages can resolve relative imports (`import '../src/<name>.js'`) and
 * asset references (`src="img/foo.png"`, `href="./styles.css"`, etc).
 *
 * Runs from the deploy workflow after astro build.
 */
import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const packagesDir = join(repoRoot, "packages");
const distPackagesDir = join(repoRoot, "apps/site/dist/packages");

if (!existsSync(packagesDir)) {
  console.error(`packages/ not found at ${packagesDir}`);
  process.exit(1);
}
if (!existsSync(distPackagesDir)) {
  console.error(
    `dist/packages/ not found at ${distPackagesDir}. Run astro build first.`
  );
  process.exit(1);
}

const entries = await readdir(packagesDir);
let copiedSources = 0;
let copiedDemoAssets = 0;

const isExcluded = (name) =>
  name === "index.html" || name === "playground.html" || name === "node_modules";

for (const entry of entries) {
  const pkgPath = join(packagesDir, entry);
  const pkgStat = await stat(pkgPath);
  if (!pkgStat.isDirectory()) continue;

  const distDir = join(distPackagesDir, entry);
  if (!existsSync(distDir)) {
    await mkdir(distDir, { recursive: true });
  }

  // Copy src/ folder (for `../src/<name>.js` imports)
  const srcPath = join(pkgPath, "src");
  if (existsSync(srcPath)) {
    const destSrc = join(distDir, "src");
    await cp(srcPath, destSrc, { recursive: true });
    copiedSources += 1;
    console.log(`  copied ${entry}/src/`);
  }

  // Copy demo/ assets (images, css, media) — excluding the html files
  // that Astro already rendered into dist/packages/<name>/demo/
  const demoPath = join(pkgPath, "demo");
  if (existsSync(demoPath)) {
    const demoEntries = await readdir(demoPath);
    const distDemoDir = join(distDir, "demo");
    if (!existsSync(distDemoDir)) {
      await mkdir(distDemoDir, { recursive: true });
    }
    for (const child of demoEntries) {
      if (isExcluded(child)) continue;
      const childPath = join(demoPath, child);
      const childStat = await stat(childPath);
      const destChildPath = join(distDemoDir, child);
      if (childStat.isDirectory()) {
        await cp(childPath, destChildPath, { recursive: true });
      } else {
        await cp(childPath, destChildPath);
      }
      copiedDemoAssets += 1;
      console.log(`  copied ${entry}/demo/${child}`);
    }
  }
}

console.log(
  `Copied ${copiedSources} package sources and ${copiedDemoAssets} demo assets into dist.`
);
