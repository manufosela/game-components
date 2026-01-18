import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const packagesDir = path.join(repoRoot, "packages");

const readFile = (filePath) =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;

const extractTag = (html, tag) => {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? match[1] : "";
};

const collectTags = (html, tag) => {
  const matches = html.match(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, "gi"));
  return matches ? matches.join("\n") : "";
};

const collectLinkTags = (html) => {
  const matches = html.match(/<link[^>]*?>/gi);
  return matches ? matches.join("\n") : "";
};

const stripTags = (html) =>
  html
    .replace(/<script[\\s\\S]*?<\\/script>/gi, "")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, "")
    .replace(/<link[^>]*?>/gi, "");

const stripShell = (html) =>
  html
    .replace(/<header[\\s\\S]*?<\\/header>/i, "")
    .replace(/<footer[\\s\\S]*?<\\/footer>/i, "");

const stripGlobalSelectors = (styles) =>
  styles.replace(/[^}]*\b(html|body)\b[^}]*\{[\\s\\S]*?\}/gi, "");

export function loadDemo(slug, kind = "demo") {
  const fileName = kind === "demo" ? "index.html" : "playground.html";
  const filePath = path.join(packagesDir, slug, "demo", fileName);
  const html = readFile(filePath);
  if (!html) return null;

  const head = extractTag(html, "head");
  const body = extractTag(html, "body");
  const styles = collectTags(head, "style") + "\n" + collectTags(body, "style");
  const scripts = collectTags(head, "script") + "\n" + collectTags(body, "script");
  const links = collectLinkTags(head);
  const cleanedBody = stripShell(stripTags(body)).trim();

  return {
    styles: stripGlobalSelectors(styles).trim(),
    scripts: scripts.trim(),
    links: links.trim(),
    body: cleanedBody,
  };
}
