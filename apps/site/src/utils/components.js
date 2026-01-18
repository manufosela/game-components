import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const packagesDir = path.join(repoRoot, "packages");

const toTitle = (slug) =>
  slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function getComponents() {
  if (!fs.existsSync(packagesDir)) return [];
  return fs
    .readdirSync(packagesDir)
    .filter((entry) => fs.statSync(path.join(packagesDir, entry)).isDirectory())
    .map((slug) => {
      const pkgPath = path.join(packagesDir, slug, "package.json");
      const demoPath = path.join(packagesDir, slug, "demo", "index.html");
      const playgroundPath = path.join(packagesDir, slug, "demo", "playground.html");
      const pkg = fs.existsSync(pkgPath)
        ? JSON.parse(fs.readFileSync(pkgPath, "utf8"))
        : {};

      return {
        slug,
        title: pkg.displayName || pkg.name || toTitle(slug),
        packageName: pkg.name || slug,
        description: pkg.description || "",
        version: pkg.version || "0.0.0",
        hasDemo: fs.existsSync(demoPath),
        hasPlayground: fs.existsSync(playgroundPath),
      };
    })
    .filter((component) => component.hasDemo);
}

export function getComponent(slug) {
  return getComponents().find((component) => component.slug === slug) || null;
}
