import { z } from "zod";

export const developerDimensionSchema = z.object({
  developerId: z.string(),
  name: z.string(),
  team: z.string(),
  manager: z.string(),
});

export const issueFactSchema = z.object({
  issueId: z.string(),
  developerId: z.string(),
  inProgressAt: z.string(),
  doneAt: z.string(),
});

export const pullRequestFactSchema = z.object({
  prId: z.string(),
  developerId: z.string(),
  openedAt: z.string(),
  firstReviewAt: z.string(),
  mergedAt: z.string(),
});

export const deploymentFactSchema = z.object({
  deploymentId: z.string(),
  developerId: z.string(),
  completedAt: z.string(),
  status: z.enum(["success", "failed"]),
  environment: z.enum(["staging", "production"]),
  leadTimeDays: z.number(),
});

export const bugFactSchema = z.object({
  bugId: z.string(),
  developerId: z.string(),
  escapedToProd: z.boolean(),
  monthFound: z.string(),
});

export const normalizedWorkbookSchema = z.object({
  developers: z.array(developerDimensionSchema),
  issues: z.array(issueFactSchema),
  pullRequests: z.array(pullRequestFactSchema),
  deployments: z.array(deploymentFactSchema),
  bugs: z.array(bugFactSchema),
});

export type DeveloperDimension = z.infer<typeof developerDimensionSchema>;
export type IssueFact = z.infer<typeof issueFactSchema>;
export type PullRequestFact = z.infer<typeof pullRequestFactSchema>;
export type DeploymentFact = z.infer<typeof deploymentFactSchema>;
export type BugFact = z.infer<typeof bugFactSchema>;
export type NormalizedWorkbook = z.infer<typeof normalizedWorkbookSchema>;
