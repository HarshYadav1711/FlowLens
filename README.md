# FlowLens

FlowLens is a focused internship-assessment prototype for developer productivity review.

## Problem in plain English

Engineering managers and developers both need a quick way to answer:

- How did one developer's month go?
- Where is delivery slowing down?
- Is quality at risk?
- What is one practical next action?

The assignment emphasizes product thinking over dashboard volume.  
FlowLens is built to keep that decision path short and explainable.

## Chosen scope (and why it is narrow)

Primary scope is the **IC flow**:

1. Select developer + month
2. See five assignment metrics
3. Read a short interpretation
4. Get 1-2 practical next steps

This keeps the MVP aligned with the rubric and avoids feature sprawl.

A **minimal manager summary** is included only as a secondary extension, not as a second product.

## Data model used

Workbook-aligned entities (normalized locally):

- `developers`
- `issues`
- `pullRequests`
- `deployments`
- `bugs`

Retained fields are intentionally limited to assignment needs:

- Developer identity and team mapping
- Issue `inProgressAt`, `doneAt`
- PR `openedAt`, `firstReviewAt`, `mergedAt`
- Deployment `completedAt`, `status`, `environment`, `leadTimeDays`
- Bug `escapedToProd`, `monthFound`

## Metric definitions implemented

All five are deterministic and month/developer filtered explicitly:

1. **Lead time for changes**  
   Average lead time for successful production deployments in the selected month.  
   Uses precomputed `leadTimeDays` when available; if missing, falls back to `PR openedAt -> first successful deployment after merge`.
2. **Cycle time**  
   Average time from issue `inProgressAt` to `doneAt` for issues done in selected month.
3. **Bug rate**  
   `escaped production bugs / completed issues` in the same selected month.
4. **Deployment frequency**  
   Count of successful production deployments in selected month.
5. **PR throughput**  
   Count of merged PRs in selected month.

Empty inputs and division-by-zero cases return safe zero values.

## Interpretation logic

Interpretation is rule-based (not LLM-generated at runtime):

- Detects likely delay location (implementation vs post-merge release path)
- Flags quality concern based on bug-rate thresholds
- Adds 1-2 concrete follow-up actions
- Keeps language constructive and short for one-glance reading

Manager summary uses a compact team rollup with a health signal and one support note.

## Stack choices

- React 18 + Vite + TypeScript
- Tailwind CSS (utility-first styling, low overhead)
- Zod (data contract validation)
- Vitest (basic unit tests for normalization and metrics logic, including interpretation and manager rollup)
- Local JSON data pipeline (no external services)

No paid APIs, billing dependencies, or cloud services are required.

## Responsible AI usage

AI was used as a development assistant for drafting code structure and copy variations.  
Final metric math, rule thresholds, and product trade-offs were manually reviewed and adjusted for explainability.

Guardrails followed:

- No hidden model-dependent runtime behavior
- No fabricated external claims
- No replacing assignment definitions with alternate internet definitions

## Accessibility and defensive behavior

- Loading, empty, and error states are explicit
- Form controls are labeled and keyboard-friendly
- View switch exposes selected state
- Missing data paths fail safely with readable fallback copy

## Demo flow (5-10 minutes, rubric-aligned)

1. Start in IC view and state the scope decision.
2. Pick a developer and month with mixed signals.
3. Walk through the five metrics quickly.
4. Explain interpretation sentence and why actions are practical.
5. Switch to manager summary and show compact team/month rollup.
6. Close with design trade-off: depth in one flow over broad dashboard coverage.

## Run locally

```bash
npm install
npm run normalize:data
npm run dev
```

## Validation commands

```bash
npm run test
npm run lint
npm run build
```

## Key files

- `src/App.tsx` - IC flow + minimal manager summary UI
- `src/metrics/assignmentMetrics.ts` - deterministic metric math
- `src/metrics/interpretation.ts` - rule-based narrative + next steps
- `src/metrics/managerSummary.ts` - compact team/month rollup
- `src/contracts/workbook.ts` - raw workbook contract
- `src/contracts/normalized.ts` - normalized contract
- `src/pipeline/normalizeWorkbook.ts` - normalization logic
