import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runNormalization } from "./lib/runNormalization";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const inputPath = path.join(repoRoot, "data", "raw", "workbook.sample.json");
const outputDir = path.join(repoRoot, "data", "normalized");
const outputPath = path.join(outputDir, "workbook.normalized.json");

await mkdir(outputDir, { recursive: true });
await runNormalization(inputPath, outputPath);

console.log(`Normalized workbook written to ${outputPath}`);
