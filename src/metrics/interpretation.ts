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
      "Try splitting one upcoming story into smaller PR-sized slices so work reaches production in smaller batches.",
    );
  } else if (metrics.cycleTimeDays >= 4 && metrics.leadTimeForChangesDays < 4) {
    notes.push(
      "The main slowdown appears during implementation, while release after merge looks comparatively steady.",
    );
    pushIfMissing(
      actions,
      "For the next two issues, define a narrower done condition up front to reduce time spent in progress.",
    );
  } else if (metrics.cycleTimeDays < 4 && metrics.leadTimeForChangesDays >= 4) {
    notes.push(
      "Coding pace looks healthy, but delay seems to sit after code is ready and before production completion.",
    );
    pushIfMissing(
      actions,
      "Review one recent merged PR timeline with CI/deployment steps and remove the biggest recurring wait.",
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
      "Pick the top escaped bug pattern and add one targeted pre-merge check or test for that exact failure.",
    );
  } else if (metrics.bugRate > 0) {
    notes.push("Quality is mixed: most changes are stable, but a few issues still escaped.");
    pushIfMissing(
      actions,
      "During review, call out one risk area explicitly and verify it before merging.",
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
      "Move one medium change into two smaller production deployments to reduce release batch size.",
    );
  } else if (metrics.prThroughput <= 1 && metrics.deploymentFrequency <= 1) {
    notes.push("Output is light this month, so confidence in the trend is limited.");
    pushIfMissing(
      actions,
      "Use a two-month view in the review discussion so one quiet month does not over-shape the conclusion.",
    );
  }

  if (actions.length === 0) {
    actions.push(
      "Keep the current working rhythm and document one habit that helped this month go smoothly.",
    );
  }

  return {
    explanation: toCohesiveNarrative(notes),
    nextSteps: actions.slice(0, 2),
  };
}
