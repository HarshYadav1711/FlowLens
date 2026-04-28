import { describe, expect, it } from "vitest";
import type { NormalizedWorkbook } from "../contracts/normalized";
import { summarizeTeamMonth } from "./managerSummary";

const workbook: NormalizedWorkbook = {
  developers: [
    { developerId: "dev-001", name: "Aarav", team: "Checkout", manager: "Nisha" },
    { developerId: "dev-002", name: "Isha", team: "Checkout", manager: "Nisha" },
  ],
  issues: [
    {
      issueId: "J-1",
      developerId: "dev-001",
      inProgressAt: "2026-03-01T00:00:00Z",
      doneAt: "2026-03-05T00:00:00Z",
    },
    {
      issueId: "J-2",
      developerId: "dev-002",
      inProgressAt: "2026-03-01T00:00:00Z",
      doneAt: "2026-03-04T00:00:00Z",
    },
  ],
  pullRequests: [
    {
      prId: "PR-1",
      developerId: "dev-001",
      openedAt: "2026-03-02T00:00:00Z",
      firstReviewAt: "2026-03-02T06:00:00Z",
      mergedAt: "2026-03-04T00:00:00Z",
    },
    {
      prId: "PR-2",
      developerId: "dev-002",
      openedAt: "2026-03-02T00:00:00Z",
      firstReviewAt: "2026-03-02T06:00:00Z",
      mergedAt: "2026-03-04T00:00:00Z",
    },
  ],
  deployments: [
    {
      deploymentId: "D-1",
      developerId: "dev-001",
      completedAt: "2026-03-06T00:00:00Z",
      status: "success",
      environment: "production",
      leadTimeDays: 4.8,
    },
    {
      deploymentId: "D-2",
      developerId: "dev-002",
      completedAt: "2026-03-06T00:00:00Z",
      status: "success",
      environment: "production",
      leadTimeDays: 4.2,
    },
  ],
  bugs: [
    { bugId: "B-1", developerId: "dev-001", escapedToProd: true, monthFound: "2026-03" },
    { bugId: "B-2", developerId: "dev-002", escapedToProd: false, monthFound: "2026-03" },
  ],
};

describe("summarizeTeamMonth", () => {
  it("returns a compact team rollup and health signal", () => {
    const summary = summarizeTeamMonth(workbook, "Checkout", "2026-03");

    expect(summary.activeDevelopers).toBe(2);
    expect(summary.avgLeadTimeDays).toBe(4.5);
    expect(summary.avgCycleTimeDays).toBe(3.5);
    expect(summary.avgBugRatePercent).toBe(50);
    expect(summary.healthSignal).toBe("Needs support");
    expect(summary.helpNote.length).toBeGreaterThan(20);
  });

  it("handles team with no mapped developers safely", () => {
    const summary = summarizeTeamMonth(workbook, "Platform", "2026-03");

    expect(summary.activeDevelopers).toBe(0);
    expect(summary.avgLeadTimeDays).toBe(0);
    expect(summary.healthSignal).toBe("Watch");
  });
});
