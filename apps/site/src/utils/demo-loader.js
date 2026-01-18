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

const collectLinkTags = (html) => html.match(/<link[^>]*?>/gi) || [];

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

const extractHref = (tag) => {
  const match = tag.match(/href=["']([^"']+)["']/i);
  return match ? match[1] : "";
};

const isExternal = (href) => /^(?:[a-z]+:)?\/\//i.test(href);

const resolveLinkStyles = (links, baseDir) => {
  const inlineStyles = [];
  const externalLinks = [];

  links.forEach((link) => {
    const href = extractHref(link);
    if (!href) {
      externalLinks.push(link);
      return;
    }

    const isStylesheet = /rel=["']?stylesheet["']?/i.test(link) || href.endsWith('.css');
    if (!isStylesheet) {
      externalLinks.push(link);
      return;
    }

    if (isExternal(href)) {
      externalLinks.push(link);
      return;
    }

    const filePath = path.resolve(baseDir, href);
    const css = readFile(filePath);
    if (css) {
      inlineStyles.push(css);
    } else {
      externalLinks.push(link);
    }
  });

  return {
    inlineStyles: inlineStyles.join("\n"),
    externalLinks: externalLinks.join("\n"),
  };
};

export function loadDemo(slug, kind = "demo") {
  const fileName = kind === "demo" ? "index.html" : "playground.html";
  const filePath = path.join(packagesDir, slug, "demo", fileName);
  const html = readFile(filePath);
  if (!html) return null;

  const head = extractTag(html, "head");
  const body = extractTag(html, "body");
  const linkTags = collectLinkTags(head);
  const { inlineStyles, externalLinks } = resolveLinkStyles(
    linkTags,
    path.dirname(filePath)
  );
  const styles = collectTags(head, "style") + "\n" + collectTags(body, "style") + "\n" + inlineStyles;
  const scripts = collectTags(head, "script") + "\n" + collectTags(body, "script");
  const cleanedBody = stripShell(stripTags(body)).trim();

  return {
    styles: stripGlobalSelectors(styles).trim(),
    scripts: scripts.trim(),
    links: externalLinks.trim(),
    body: cleanedBody,
  };
}
