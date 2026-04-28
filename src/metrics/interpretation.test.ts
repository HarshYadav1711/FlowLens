import { describe, expect, it } from "vitest";
import { interpretAssignmentMetrics } from "./interpretation";

describe("interpretAssignmentMetrics", () => {
  it("returns a short explanation with 1-2 actions for slow flow and quality risk", () => {
    const result = interpretAssignmentMetrics({
      leadTimeForChangesDays: 5.2,
      cycleTimeDays: 4.6,
      bugRate: 0.4,
      deploymentFrequency: 1,
      prThroughput: 4,
    });

    expect(result.explanation).toContain("Delivery looks slow overall");
    expect(result.explanation).toContain("Quality risk is visible");
    expect(result.nextSteps.length).toBeGreaterThanOrEqual(1);
    expect(result.nextSteps.length).toBeLessThanOrEqual(2);
  });

  it("handles near-empty activity safely", () => {
    const result = interpretAssignmentMetrics({
      leadTimeForChangesDays: 0,
      cycleTimeDays: 0,
      bugRate: 0,
      deploymentFrequency: 0,
      prThroughput: 0,
    });

    expect(result.explanation).toContain("not enough delivery activity");
    expect(result.nextSteps).toHaveLength(1);
  });

  it("keeps tone constructive for healthy month", () => {
    const result = interpretAssignmentMetrics({
      leadTimeForChangesDays: 2.2,
      cycleTimeDays: 2.1,
      bugRate: 0,
      deploymentFrequency: 3,
      prThroughput: 4,
    });

    expect(result.explanation).toContain("Flow looks steady");
    expect(result.explanation).toContain("Quality signal is strong");
    expect(result.nextSteps.length).toBeGreaterThanOrEqual(1);
    expect(result.nextSteps.length).toBeLessThanOrEqual(2);
  });
});
