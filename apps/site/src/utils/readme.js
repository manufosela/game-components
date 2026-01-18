import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const packagesDir = path.join(repoRoot, "packages");

const readFile = (filePath) =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;

const extractSection = (content, heading) => {
  const regex = new RegExp(`##\\s+${heading}\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
};

const extractFirstCodeBlock = (content) => {
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  return { language: match[1] || "", code: match[2].trim() };
};

export function getUsageSnippet(slug) {
  const readmePath = path.join(packagesDir, slug, "README.md");
  const content = readFile(readmePath);
  if (!content) return null;

  const usageSection = extractSection(content, "Usage") || extractSection(content, "Basic Usage");
  const snippet = extractFirstCodeBlock(usageSection || content);
  return snippet;
}
