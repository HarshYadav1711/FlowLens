import { normalizedWorkbookSchema, type NormalizedWorkbook } from "../contracts/normalized";
import { rawWorkbookSchema, type RawWorkbook } from "../contracts/workbook";

export function normalizeWorkbook(rawInput: unknown): NormalizedWorkbook {
  const raw: RawWorkbook = rawWorkbookSchema.parse(rawInput);

  const normalized: NormalizedWorkbook = {
    developers: raw.dim_developers.map((item) => ({
      developerId: item.developer_id,
      name: item.developer_name,
      team: item.team_name,
      manager: item.manager_name,
    })),
    issues: raw.fact_jira_issues.map((item) => ({
      issueId: item.issue_id,
      developerId: item.developer_id,
      inProgressAt: item.in_progress_at,
      doneAt: item.done_at,
    })),
    pullRequests: raw.fact_pull_requests.map((item) => ({
      prId: item.pr_id,
      developerId: item.developer_id,
      openedAt: item.opened_at,
      firstReviewAt: item.first_review_at,
      mergedAt: item.merged_at,
    })),
    deployments: raw.fact_ci_deployments.map((item) => ({
      deploymentId: item.deployment_id,
      developerId: item.developer_id,
      completedAt: item.completed_at,
      status: item.status,
      environment: item.environment,
      leadTimeDays: item.lead_time_days,
    })),
    bugs: raw.fact_bug_reports.map((item) => ({
      bugId: item.bug_id,
      developerId: item.developer_id,
      escapedToProd: item.escaped_to_prod,
      monthFound: item.month_found,
    })),
  };

  return normalizedWorkbookSchema.parse(normalized);
}
