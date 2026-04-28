import type { AssignmentMetrics } from "./assignmentMetrics";

export type MetricInterpretation = {
  explanation: string;
  nextSteps: string[];
};

function toCohesiveNarrative(notes: string[]): string {
  if (notes.length === 0) {
    return "";
  }
  if (notes.length === 1) {
    return notes[0];
  }
  if (notes.length === 2) {
    return `${notes[0]} ${notes[1]}`;
  }
  return `${notes[0]} ${notes[1]} ${notes.slice(2).join(" ")}`;
}

function pushIfMissing(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

export function interpretAssignmentMetrics(metrics: AssignmentMetrics): MetricInterpretation {
  const notes: string[] = [];
  const actions: string[] = [];

  if (metrics.prThroughput === 0 && metrics.deploymentFrequency === 0) {
    return {
      explanation:
        "There is not enough delivery activity this month to read a reliable pattern yet.",
      nextSteps: [
        "Confirm this month has complete Jira, PR, deployment, and bug data before drawing conclusions.",
      ],
    };
  }

  if (metrics.cycleTimeDays >= 4 && metrics.leadTimeForChangesDays >= 4) {
    notes.push(
      "Delivery looks slower than expected this month, with delay likely building between in-progress work and production release.",
    );
    pushIfMissing(
      actions,
      "For your next story, split delivery into two PRs under ~300 lines each and ship the first slice before starting the second.",
    );
  } else if (metrics.cycleTimeDays >= 4 && metrics.leadTimeForChangesDays < 4) {
    notes.push(
      "The main slowdown appears during implementation, while release after merge looks comparatively steady.",
    );
    pushIfMissing(
      actions,
      "Before starting the next two issues, write a one-line done condition and one non-goal so implementation scope stays tight.",
    );
  } else if (metrics.cycleTimeDays < 4 && metrics.leadTimeForChangesDays >= 4) {
    notes.push(
      "Coding pace looks healthy, but delay seems to sit after code is ready and before production completion.",
    );
    pushIfMissing(
      actions,
      "Map one recent PR timeline from merge to production and remove the single longest wait step in CI or release handoff this sprint.",
    );
  } else {
    notes.push("Flow looks steady, with both cycle time and lead time in a manageable range.");
  }

  if (metrics.bugRate >= 0.3) {
    notes.push(
      "Quality is also a concern because escaped production bugs are high relative to completed issue volume.",
    );
    pushIfMissing(
      actions,
      "Choose the most recent escaped bug and add one targeted pre-merge test or checklist step that would have caught that exact failure.",
    );
  } else if (metrics.bugRate > 0) {
    notes.push("Quality is mixed: most changes are stable, but a few issues still escaped.");
    pushIfMissing(
      actions,
      "In each PR review this week, name one risk area explicitly and require a matching verification note before merge.",
    );
  } else {
    notes.push("Quality signal is strong, with no escaped bugs in the selected month.");
  }

  if (metrics.deploymentFrequency <= 1 && metrics.prThroughput >= 3) {
    notes.push(
      "PR throughput is active, but releases are infrequent, which suggests change batching near deployment.",
    );
    pushIfMissing(
      actions,
      "Take one medium-sized change next sprint and release it as two production deployments on separate days to reduce batch risk.",
    );
  } else if (metrics.prThroughput <= 1 && metrics.deploymentFrequency <= 1) {
    notes.push("Output is light this month, so confidence in the trend is limited.");
    pushIfMissing(
      actions,
      "In the next team review, compare this month with the previous month before deciding any process changes.",
    );
  }

  if (actions.length === 0) {
    actions.push(
      "Keep the current rhythm and document one concrete team habit from this month so others can repeat it.",
    );
  }

  return {
    explanation: toCohesiveNarrative(notes),
    nextSteps: actions.slice(0, 2),
  };
}
