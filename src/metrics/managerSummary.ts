import type { DeveloperDimension, NormalizedWorkbook } from "../contracts/normalized";
import { calculateAssignmentMetrics } from "./assignmentMetrics";

export type ManagerSummary = {
  teamName: string;
  month: string;
  activeDevelopers: number;
  avgLeadTimeDays: number;
  avgCycleTimeDays: number;
  avgBugRatePercent: number;
  healthSignal: "On track" | "Watch" | "Needs support";
  helpNote: string;
};

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeTeamMonth(
  workbook: NormalizedWorkbook,
  teamName: string,
  month: string,
): ManagerSummary {
  const teamDevelopers: DeveloperDimension[] = workbook.developers.filter(
    (developer) => developer.team === teamName,
  );
  const teamMetrics = teamDevelopers.map((developer) =>
    calculateAssignmentMetrics(workbook, developer.developerId, month),
  );

  const activeDevelopers = teamMetrics.filter(
    (metrics) => metrics.prThroughput > 0 || metrics.deploymentFrequency > 0,
  ).length;

  const avgLeadTimeDays = roundToSingleDecimal(average(teamMetrics.map((metrics) => metrics.leadTimeForChangesDays)));
  const avgCycleTimeDays = roundToSingleDecimal(average(teamMetrics.map((metrics) => metrics.cycleTimeDays)));
  const avgBugRatePercent = roundToSingleDecimal(average(teamMetrics.map((metrics) => metrics.bugRatePercent)));

  let healthSignal: ManagerSummary["healthSignal"] = "On track";
  let helpNote = "No immediate risk is visible. Keep the team rhythm and review one improvement each sprint.";

  if (avgBugRatePercent >= 30 || avgLeadTimeDays >= 4.5 || avgCycleTimeDays >= 4.5) {
    healthSignal = "Needs support";
    helpNote =
      "The team may need help reducing work-in-progress queueing and tightening pre-merge checks on high-risk changes.";
  } else if (avgBugRatePercent >= 10 || avgLeadTimeDays >= 3.5 || avgCycleTimeDays >= 3.5) {
    healthSignal = "Watch";
    helpNote =
      "Flow is mostly stable, but delay is starting to build. A short review of handoff and deployment waits could help.";
  }

  if (activeDevelopers === 0) {
    healthSignal = "Watch";
    helpNote = "Delivery activity is low this month. Confirm data completeness before making team-level decisions.";
  }

  return {
    teamName,
    month,
    activeDevelopers,
    avgLeadTimeDays,
    avgCycleTimeDays,
    avgBugRatePercent,
    healthSignal,
    helpNote,
  };
}
