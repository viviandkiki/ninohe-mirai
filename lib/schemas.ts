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
  sourceTier: z.enum(["city", "estat", "prefecture", "estimate", "survey", "reference"]).optional(),
  geographyScope: z.enum(["二戸市", "岩手県北圏域", "岩手県", "全国"]).optional(),
  targetPeriod: z.string().optional(),
  lastUpdated: z.string().optional(),
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
  url: z.string().url().optional(),
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

export const CouncilMemberSchema = z.object({
  id: z.string(),
  seatNumber: z.number().int(),
  name: z.string(),
  nameKana: z.string(),
  role: z.string(),
  faction: z.string(),
  party: z.string(),
  committees: z.array(z.string()),
  councilOps: z.string().nullable(),
  age: z.number().int(),
  background: z.string(),
  term: z.string(),
  votes2023: z.number().int(),
  address: z.string(),
  isNew2023: z.boolean(),
  isFormer: z.boolean(),
  note: z.string().optional(),
});
export type CouncilMember = z.infer<typeof CouncilMemberSchema>;

export const MayorSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKana: z.string(),
  role: z.string(),
  termNumber: z.number().int(),
  termStart: z.string(),
  termEnd: z.string(),
  party: z.string(),
  background: z.string(),
  note: z.string(),
  source: z.string(),
  lastUpdated: z.string(),
});
export type Mayor = z.infer<typeof MayorSchema>;

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
