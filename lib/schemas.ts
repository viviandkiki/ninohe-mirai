import { z } from "zod";

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  url: z.string().url().optional(),
  year: z.number().int(),
  type: z.enum(["official", "academic", "media", "survey"]),
});
export type Source = z.infer<typeof SourceSchema>;

export const TrendPointSchema = z.object({
  year: z.number().int(),
  value: z.number(),
});
export type TrendPoint = z.infer<typeof TrendPointSchema>;

export const IndicatorSchema = z.object({
  id: z.string(),
  powerId: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  year: z.number().int(),
  trend: z.array(TrendPointSchema),
  sourceId: z.string(),
  notes: z.string().optional(),
});
export type Indicator = z.infer<typeof IndicatorSchema>;

export const PowerTrendSchema = z.enum(["up", "down", "stable"]);
export type PowerTrend = z.infer<typeof PowerTrendSchema>;

export const PowerSlugSchema = z.enum(["work", "earn", "inherit", "connect", "prepare", "live"]);
export type PowerSlug = z.infer<typeof PowerSlugSchema>;

export const PowerSchema = z.object({
  id: z.string(),
  slug: PowerSlugSchema,
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  color: z.string(),
  score: z.number().int().min(0).max(100).optional(),
  summary: z.string(),
  interpretation: z.string().optional(),
  headline: z.string(),
  trend: PowerTrendSchema,
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  indicatorIds: z.array(z.string()),
});
export type Power = z.infer<typeof PowerSchema>;

export const ActorTypeSchema = z.enum(["official", "council", "community", "npo"]);
export type ActorType = z.infer<typeof ActorTypeSchema>;

export const ActorSchema = z.object({
  id: z.string(),
  type: ActorTypeSchema,
  name: z.string(),
  role: z.string(),
  affiliation: z.string(),
  focusPowers: z.array(z.string()),
  lastActive: z.string(),
  summary: z.string(),
});
export type Actor = z.infer<typeof ActorSchema>;

export const MovementTypeSchema = z.enum(["policy", "event", "initiative", "announcement"]);
export type MovementType = z.infer<typeof MovementTypeSchema>;

export const MovementSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  type: MovementTypeSchema,
  actorIds: z.array(z.string()),
  powerSlugs: z.array(z.string()),
  sourceId: z.string().optional(),
});
export type Movement = z.infer<typeof MovementSchema>;

export const UpdateCategorySchema = z.enum(["data", "content", "design", "system"]);
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;

export const UpdateLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  category: UpdateCategorySchema,
  summary: z.string(),
  author: z.string(),
});
export type UpdateLog = z.infer<typeof UpdateLogSchema>;
