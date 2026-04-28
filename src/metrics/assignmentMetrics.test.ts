import { describe, expect, it } from "vitest";
import {
  calculateBugRate,
  calculateCycleTimeDays,
  calculateLeadTimeForChangesDays,
} from "./assignmentMetrics";

describe("assignment metrics", () => {
  it("calculates cycle time from issue inProgressAt -> doneAt", () => {
    const cycleTime = calculateCycleTimeDays(
      [
        {
          issueId: "J-1",
          developerId: "dev-001",
          inProgressAt: "2026-03-01T00:00:00Z",
          doneAt: "2026-03-03T00:00:00Z",
        },
        {
          issueId: "J-2",
          developerId: "dev-001",
          inProgressAt: "2026-03-10T00:00:00Z",
          doneAt: "2026-03-14T00:00:00Z",
        },
      ],
      "dev-001",
      "2026-03",
    );

    expect(cycleTime).toBe(3);
  });

  it("calculates bug rate as escaped production bugs / completed issues", () => {
    const bugRate = calculateBugRate(
      [
        { bugId: "B-1", developerId: "dev-001", escapedToProd: true, monthFound: "2026-03" },
        { bugId: "B-2", developerId: "dev-001", escapedToProd: false, monthFound: "2026-03" },
      ],
      [
        {
          issueId: "J-1",
          developerId: "dev-001",
          inProgressAt: "2026-03-01T00:00:00Z",
          doneAt: "2026-03-02T00:00:00Z",
        },
        {
          issueId: "J-2",
          developerId: "dev-001",
          inProgressAt: "2026-03-03T00:00:00Z",
          doneAt: "2026-03-04T00:00:00Z",
        },
      ],
      "dev-001",
      "2026-03",
    );

    expect(bugRate).toBe(0.5);
  });

  it("uses precomputed leadTimeDays when available", () => {
    const leadTime = calculateLeadTimeForChangesDays(
      [
        {
          deploymentId: "D-1",
          developerId: "dev-001",
          completedAt: "2026-03-10T00:00:00Z",
          status: "success",
          environment: "production",
          leadTimeDays: 2.4,
        },
      ],
      "dev-001",
      "2026-03",
    );

    expect(leadTime).toBe(2.4);
  });

  it("falls back to PR openedAt -> first successful deployment after merge when leadTimeDays is missing", () => {
    const leadTime = calculateLeadTimeForChangesDays(
      [
        {
          deploymentId: "D-2",
          developerId: "dev-001",
          completedAt: "2026-03-08T00:00:00Z",
          status: "success",
          environment: "production",
        },
      ],
      "dev-001",
      "2026-03",
      [
        {
          prId: "PR-2",
          developerId: "dev-001",
          openedAt: "2026-03-05T00:00:00Z",
          firstReviewAt: "2026-03-05T10:00:00Z",
          mergedAt: "2026-03-06T00:00:00Z",
        },
      ],
    );

    expect(leadTime).toBe(3);
  });
});
