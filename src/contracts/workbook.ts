import { z } from "zod";

export const rawDeveloperSchema = z.object({
  developer_id: z.string(),
  developer_name: z.string(),
  team_name: z.string(),
  manager_name: z.string(),
});

export const rawJiraIssueSchema = z.object({
  issue_id: z.string(),
  developer_id: z.string(),
  in_progress_at: z.string(),
  done_at: z.string(),
});

export const rawPullRequestSchema = z.object({
  pr_id: z.string(),
  developer_id: z.string(),
  opened_at: z.string(),
  first_review_at: z.string(),
  merged_at: z.string(),
});

export const rawDeploymentSchema = z.object({
  deployment_id: z.string(),
  developer_id: z.string(),
  completed_at: z.string(),
  status: z.enum(["success", "failed"]),
  environment: z.enum(["staging", "production"]),
  lead_time_days: z.number(),
});

export const rawBugSchema = z.object({
  bug_id: z.string(),
  developer_id: z.string(),
  escaped_to_prod: z.boolean(),
  month_found: z.string(),
});

export const rawWorkbookSchema = z.object({
  dim_developers: z.array(rawDeveloperSchema),
  fact_jira_issues: z.array(rawJiraIssueSchema),
  fact_pull_requests: z.array(rawPullRequestSchema),
  fact_ci_deployments: z.array(rawDeploymentSchema),
  fact_bug_reports: z.array(rawBugSchema),
});

export type RawWorkbook = z.infer<typeof rawWorkbookSchema>;
