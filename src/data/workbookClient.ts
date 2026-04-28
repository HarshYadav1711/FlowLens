import normalizedWorkbookJson from "../../data/normalized/workbook.normalized.json";
import {
  normalizedWorkbookSchema,
  type DeveloperDimension,
  type NormalizedWorkbook,
} from "../contracts/normalized";

function getMonthFromIso(value: string): string {
  return value.slice(0, 7);
}

export function listMonths(workbook: NormalizedWorkbook): string[] {
  const months = new Set<string>();

  workbook.issues.forEach((item) => months.add(getMonthFromIso(item.doneAt)));
  workbook.pullRequests.forEach((item) => months.add(getMonthFromIso(item.mergedAt)));
  workbook.deployments.forEach((item) => months.add(getMonthFromIso(item.completedAt)));
  workbook.bugs.forEach((item) => months.add(item.monthFound));

  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

export function getDeveloperById(
  developers: DeveloperDimension[],
  developerId: string,
): DeveloperDimension | undefined {
  return developers.find((developer) => developer.developerId === developerId);
}

export async function loadWorkbook(): Promise<NormalizedWorkbook> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return normalizedWorkbookSchema.parse(normalizedWorkbookJson);
}
