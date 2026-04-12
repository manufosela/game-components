#!/usr/bin/env node
/**
 * Copies every package's src/ folder into the Astro dist output so that
 * demo pages can resolve relative imports like `import '../src/<name>.js'`.
 *
 * Runs after `astro build` in the deploy workflow.
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
let copied = 0;

for (const entry of entries) {
  const pkgPath = join(packagesDir, entry);
  const pkgStat = await stat(pkgPath);
  if (!pkgStat.isDirectory()) continue;

  const srcPath = join(pkgPath, "src");
  if (!existsSync(srcPath)) continue;

  const distDir = join(distPackagesDir, entry);
  if (!existsSync(distDir)) {
    await mkdir(distDir, { recursive: true });
  }
  const destSrc = join(distDir, "src");
  await cp(srcPath, destSrc, { recursive: true });
  copied += 1;
  console.log(`  copied ${entry}/src/`);
}

console.log(`Copied ${copied} package src folders into dist.`);
