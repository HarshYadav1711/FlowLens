import { describe, expect, it } from "vitest";
import { normalizeWorkbook } from "./normalizeWorkbook";

describe("normalizeWorkbook", () => {
  it("maps workbook fields into normalized contracts", () => {
    const normalized = normalizeWorkbook({
      dim_developers: [
        {
          developer_id: "dev-001",
          developer_name: "Aarav Mehta",
          team_name: "Checkout",
          manager_name: "Nisha Rao",
        },
      ],
      fact_jira_issues: [
        {
          issue_id: "J-1",
          developer_id: "dev-001",
          in_progress_at: "2026-03-01T10:00:00Z",
          done_at: "2026-03-02T10:00:00Z",
        },
      ],
      fact_pull_requests: [
        {
          pr_id: "PR-1",
          developer_id: "dev-001",
          opened_at: "2026-03-01T11:00:00Z",
          first_review_at: "2026-03-01T13:00:00Z",
          merged_at: "2026-03-02T09:00:00Z",
        },
      ],
      fact_ci_deployments: [
        {
          deployment_id: "D-1",
          developer_id: "dev-001",
          completed_at: "2026-03-02T12:00:00Z",
          status: "success",
          environment: "production",
          lead_time_days: 2.1,
        },
      ],
      fact_bug_reports: [
        {
          bug_id: "B-1",
          developer_id: "dev-001",
          escaped_to_prod: true,
          month_found: "2026-03",
        },
      ],
    });

    expect(normalized.developers[0]?.developerId).toBe("dev-001");
    expect(normalized.pullRequests[0]?.firstReviewAt).toBe("2026-03-01T13:00:00Z");
    expect(normalized.deployments[0]?.environment).toBe("production");
    expect(normalized.bugs[0]?.escapedToProd).toBe(true);
  });
});
