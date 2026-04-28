import type {
  BugFact,
  DeploymentFact,
  IssueFact,
  NormalizedWorkbook,
  PullRequestFact,
} from "../contracts/normalized";

export type AssignmentMetrics = {
  leadTimeForChangesDays: number;
  cycleTimeDays: number;
  bugRate: number;
  deploymentFrequency: number;
  prThroughput: number;
};

const DAYS_IN_MS = 1000 * 60 * 60 * 24;

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function getMonthFromIsoTimestamp(value: string): string {
  return value.slice(0, 7);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function daysBetween(startIso: string, endIso: string): number {
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (diff <= 0) {
    return 0;
  }
  return diff / DAYS_IN_MS;
}

function filterIssuesByDeveloperAndMonth(
  issues: IssueFact[],
  developerId: string,
  month: string,
): IssueFact[] {
  return issues.filter(
    (issue) =>
      issue.developerId === developerId && getMonthFromIsoTimestamp(issue.doneAt) === month,
  );
}

function filterPullRequestsByDeveloperAndMonth(
  pullRequests: PullRequestFact[],
  developerId: string,
  month: string,
): PullRequestFact[] {
  return pullRequests.filter(
    (pr) => pr.developerId === developerId && getMonthFromIsoTimestamp(pr.mergedAt) === month,
  );
}

function filterDeploymentsByDeveloperAndMonth(
  deployments: DeploymentFact[],
  developerId: string,
  month: string,
): DeploymentFact[] {
  return deployments.filter(
    (deployment) =>
      deployment.developerId === developerId &&
      getMonthFromIsoTimestamp(deployment.completedAt) === month &&
      deployment.status === "success" &&
      deployment.environment === "production",
  );
}

function filterBugsByDeveloperAndMonth(
  bugs: BugFact[],
  developerId: string,
  month: string,
): BugFact[] {
  return bugs.filter((bug) => bug.developerId === developerId && bug.monthFound === month);
}

export function calculateLeadTimeForChangesDays(
  deployments: DeploymentFact[],
  developerId: string,
  month: string,
): number {
  const rows = filterDeploymentsByDeveloperAndMonth(deployments, developerId, month);
  return roundToSingleDecimal(average(rows.map((row) => row.leadTimeDays)));
}

export function calculateCycleTimeDays(
  issues: IssueFact[],
  developerId: string,
  month: string,
): number {
  const rows = filterIssuesByDeveloperAndMonth(issues, developerId, month);
  const cycleTimes = rows.map((row) => daysBetween(row.inProgressAt, row.doneAt));
  return roundToSingleDecimal(average(cycleTimes));
}

export function calculateBugRate(
  bugs: BugFact[],
  issues: IssueFact[],
  developerId: string,
  month: string,
): number {
  const escapedBugs = filterBugsByDeveloperAndMonth(bugs, developerId, month).filter(
    (bug) => bug.escapedToProd,
  ).length;
  const completedIssuesCount = filterIssuesByDeveloperAndMonth(issues, developerId, month).length;

  if (completedIssuesCount === 0) {
    return 0;
  }

  return roundToSingleDecimal(escapedBugs / completedIssuesCount);
}

export function calculateDeploymentFrequency(
  deployments: DeploymentFact[],
  developerId: string,
  month: string,
): number {
  return filterDeploymentsByDeveloperAndMonth(deployments, developerId, month).length;
}

export function calculatePrThroughput(
  pullRequests: PullRequestFact[],
  developerId: string,
  month: string,
): number {
  return filterPullRequestsByDeveloperAndMonth(pullRequests, developerId, month).length;
}

export function calculateAssignmentMetrics(
  workbook: NormalizedWorkbook,
  developerId: string,
  month: string,
): AssignmentMetrics {
  return {
    leadTimeForChangesDays: calculateLeadTimeForChangesDays(
      workbook.deployments,
      developerId,
      month,
    ),
    cycleTimeDays: calculateCycleTimeDays(workbook.issues, developerId, month),
    bugRate: calculateBugRate(workbook.bugs, workbook.issues, developerId, month),
    deploymentFrequency: calculateDeploymentFrequency(workbook.deployments, developerId, month),
    prThroughput: calculatePrThroughput(workbook.pullRequests, developerId, month),
  };
}
