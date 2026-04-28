# FlowLens (Skeleton Stage)

FlowLens is currently in the data-foundation stage for the internship assignment.  
This repo intentionally includes only the contracts + normalization pipeline required for the IC flow.

## Scope guardrails applied

- No UI implementation beyond a placeholder.
- No extra product features outside assignment scope.
- No paid APIs, card-required services, or hidden dependencies.
- Metric definitions are untouched at this stage.

## Repo structure

- `src/contracts/workbook.ts`  
  Raw workbook schemas (input contract) with only required fields.
- `src/contracts/normalized.ts`  
  Normalized API-ready schemas (output contract).
- `src/pipeline/normalizeWorkbook.ts`  
  Pure mapping logic from workbook shape to normalized shape.
- `scripts/lib/runNormalization.ts`  
  Local file-based pipeline runner.
- `scripts/normalize-workbook.ts`  
  CLI entry to convert raw workbook JSON into normalized JSON.
- `data/raw/workbook.sample.json`  
  Sample workbook input.
- `data/normalized/workbook.normalized.json`  
  Generated normalized output.

## Data fields retained

- Developer identity + manager mapping:  
  `developer_id`, `developer_name`, `team_name`, `manager_name`
- Issue timing:  
  `in_progress_at`, `done_at`
- PR timing:  
  `opened_at`, `first_review_at`, `merged_at`
- Deployment details:  
  `completed_at`, `status`, `environment`, `lead_time_days`
- Bug signal:  
  `escaped_to_prod`, `month_found`

## Commands

```bash
npm install
npm run normalize:data
npm run test
npm run lint
npm run format:check
```

## Replace sample data with workbook export

1. Put workbook-converted JSON into `data/raw/workbook.sample.json` (or change the input path in script).
2. Keep field names consistent with `src/contracts/workbook.ts`.
3. Run `npm run normalize:data` to regenerate output.
