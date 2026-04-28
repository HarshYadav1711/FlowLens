import { describe, expect, it } from "vitest";
import type { NormalizedWorkbook } from "../contracts/normalized";
import {
  calculateAssignmentMetrics,
  calculateBugRate,
  calculateCycleTimeDays,
  calculateDeploymentFrequency,
  calculateLeadTimeForChangesDays,
  calculatePrThroughput,
} from "./assignmentMetrics";

const workbookRows: NormalizedWorkbook = {
  developers: [
    { developerId: "dev-001", name: "Aarav Mehta", team: "Checkout", manager: "Nisha Rao" },
    { developerId: "dev-002", name: "Isha Nair", team: "Checkout", manager: "Nisha Rao" },
  ],
  issues: [
    {
      issueId: "J-101",
      developerId: "dev-001",
      inProgressAt: "2026-03-01T00:00:00Z",
      doneAt: "2026-03-03T00:00:00Z",
    },
    {
      issueId: "J-102",
      developerId: "dev-001",
      inProgressAt: "2026-03-10T00:00:00Z",
      doneAt: "2026-03-14T00:00:00Z",
    },
    {
      issueId: "J-201",
      developerId: "dev-002",
      inProgressAt: "2026-03-02T00:00:00Z",
      doneAt: "2026-03-05T00:00:00Z",
    },
  ],
  pullRequests: [
    {
      prId: "PR-101",
      developerId: "dev-001",
      openedAt: "2026-03-02T10:00:00Z",
      firstReviewAt: "2026-03-02T12:00:00Z",
      mergedAt: "2026-03-03T09:00:00Z",
    },
    {
      prId: "PR-102",
      developerId: "dev-001",
      openedAt: "2026-03-12T10:00:00Z",
      firstReviewAt: "2026-03-12T15:00:00Z",
      mergedAt: "2026-03-14T11:00:00Z",
    },
    {
      prId: "PR-201",
      developerId: "dev-002",
      openedAt: "2026-03-04T10:00:00Z",
      firstReviewAt: "2026-03-04T14:00:00Z",
      mergedAt: "2026-03-05T16:00:00Z",
    },
  ],
  deployments: [
    {
      deploymentId: "D-101",
      developerId: "dev-001",
      completedAt: "2026-03-04T08:00:00Z",
      status: "success",
      environment: "production",
      leadTimeDays: 2,
    },
    {
      deploymentId: "D-102",
      developerId: "dev-001",
      completedAt: "2026-03-15T08:00:00Z",
      status: "success",
      environment: "production",
      leadTimeDays: 4,
    },
    {
      deploymentId: "D-103",
      developerId: "dev-001",
      completedAt: "2026-03-20T08:00:00Z",
      status: "failed",
      environment: "production",
      leadTimeDays: 9,
    },
    {
      deploymentId: "D-104",
      developerId: "dev-001",
      completedAt: "2026-03-21T08:00:00Z",
      status: "success",
      environment: "staging",
      leadTimeDays: 8,
    },
  ],
  bugs: [
    { bugId: "B-101", developerId: "dev-001", escapedToProd: true, monthFound: "2026-03" },
    { bugId: "B-102", developerId: "dev-001", escapedToProd: false, monthFound: "2026-03" },
    { bugId: "B-201", developerId: "dev-002", escapedToProd: false, monthFound: "2026-03" },
  ],
};

describe("assignment metrics", () => {
  it("calculates all five metrics with explicit developer-month filtering", () => {
    const metrics = calculateAssignmentMetrics(workbookRows, "dev-001", "2026-03");

    expect(metrics.leadTimeForChangesDays).toBe(3);
    expect(metrics.cycleTimeDays).toBe(3);
    expect(metrics.bugRate).toBe(0.5);
    expect(metrics.deploymentFrequency).toBe(2);
    expect(metrics.prThroughput).toBe(2);
  });

  it("returns safe zero values for empty or non-matching inputs", () => {
    const month = "2026-04";
    expect(calculateLeadTimeForChangesDays(workbookRows.deployments, "dev-001", month)).toBe(0);
    expect(calculateCycleTimeDays(workbookRows.issues, "dev-001", month)).toBe(0);
    expect(calculateBugRate(workbookRows.bugs, workbookRows.issues, "dev-001", month)).toBe(0);
    expect(calculateDeploymentFrequency(workbookRows.deployments, "dev-001", month)).toBe(0);
    expect(calculatePrThroughput(workbookRows.pullRequests, "dev-001", month)).toBe(0);
  });

  it("falls back to PR openedAt -> first successful deployment after merge when lead time is missing", () => {
    const metrics = calculateAssignmentMetrics(
      {
        ...workbookRows,
        deployments: [
          {
            deploymentId: "D-201",
            developerId: "dev-001",
            completedAt: "2026-03-08T00:00:00Z",
            status: "success",
            environment: "production",
          },
        ],
        pullRequests: [
          {
            prId: "PR-201",
            developerId: "dev-001",
            openedAt: "2026-03-05T00:00:00Z",
            firstReviewAt: "2026-03-05T10:00:00Z",
            mergedAt: "2026-03-06T00:00:00Z",
          },
        ],
      },
      "dev-001",
      "2026-03",
    );

    expect(metrics.leadTimeForChangesDays).toBe(3);
  });
});
