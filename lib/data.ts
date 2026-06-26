import { z } from "zod";
import powersRaw from "@/data/processed/powers.json";
import indicatorsRaw from "@/data/processed/indicators.json";
import actorsRaw from "@/data/processed/actors.json";
import movementsRaw from "@/data/processed/movements.json";
import sourcesRaw from "@/data/processed/sources.json";
import updatesRaw from "@/data/processed/updates.json";
import {
  PowerSchema,
  IndicatorSchema,
  ActorSchema,
  MovementSchema,
  SourceSchema,
  UpdateLogSchema,
  type Power,
  type Indicator,
  type Actor,
  type Movement,
  type Source,
  type UpdateLog,
} from "./schemas";

export const powers: Power[] = z.array(PowerSchema).parse(powersRaw);
export const indicators: Indicator[] = z.array(IndicatorSchema).parse(indicatorsRaw);
export const actors: Actor[] = z.array(ActorSchema).parse(actorsRaw);
export const movements: Movement[] = z.array(MovementSchema).parse(movementsRaw);
export const sources: Source[] = z.array(SourceSchema).parse(sourcesRaw);
export const updates: UpdateLog[] = z.array(UpdateLogSchema).parse(updatesRaw);

export function getPowerBySlug(slug: string): Power | undefined {
  return powers.find((p) => p.slug === slug);
}

export function getIndicatorById(id: string): Indicator | undefined {
  return indicators.find((i) => i.id === id);
}

export function getIndicatorsForPower(powerId: string): Indicator[] {
  return indicators.filter((i) => i.powerId === powerId);
}

export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}

export function getActorById(id: string): Actor | undefined {
  return actors.find((a) => a.id === id);
}

export function getMovementsForPower(slug: string): Movement[] {
  return [...movements]
    .filter((m) => m.powerSlugs.includes(slug))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentMovements(limit = 6): Movement[] {
  return [...movements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getActorsForMovement(movement: Movement): Actor[] {
  return movement.actorIds
    .map((id) => getActorById(id))
    .filter((a): a is Actor => a !== undefined);
}

export function getPowersForActor(actor: Actor): Power[] {
  return actor.focusPowers
    .map((slug) => getPowerBySlug(slug))
    .filter((p): p is Power => p !== undefined);
}
