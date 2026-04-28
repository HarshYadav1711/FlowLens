import { readFile, writeFile } from "node:fs/promises";
import { normalizeWorkbook } from "../../src/pipeline/normalizeWorkbook";

export async function runNormalization(inputPath: string, outputPath: string): Promise<void> {
  const rawContent = await readFile(inputPath, "utf8");
  const rawJson = JSON.parse(rawContent) as unknown;
  const normalized = normalizeWorkbook(rawJson);
  await writeFile(outputPath, JSON.stringify(normalized, null, 2), "utf8");
}
