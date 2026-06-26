import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";
import {
  PowerSchema,
  IndicatorSchema,
  MovementSchema,
  ActorSchema,
  SourceSchema,
  UpdateLogSchema,
} from "../../lib/schemas";

const DATA_DIR = join(process.cwd(), "data", "processed");

function loadJson(filename: string): unknown {
  const raw = readFileSync(join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw);
}

let errors = 0;

function validate<T>(filename: string, schema: z.ZodSchema<T>): T[] {
  try {
    const raw = loadJson(filename) as unknown[];
    const results: T[] = [];
    for (let i = 0; i < raw.length; i++) {
      const result = schema.safeParse(raw[i]);
      if (!result.success) {
        console.error(`[${filename}] index ${i}:`, result.error.flatten());
        errors++;
      } else {
        results.push(result.data);
      }
    }
    console.log(`✓ ${filename}: ${results.length} records valid`);
    return results;
  } catch (e) {
    console.error(`[${filename}] failed to load:`, e);
    errors++;
    return [];
  }
}

const powers = validate("powers.json", PowerSchema);
const indicators = validate("indicators.json", IndicatorSchema);
const movements = validate("movements.json", MovementSchema);
const actors = validate("actors.json", ActorSchema);
const sources = validate("sources.json", SourceSchema);
validate("updates.json", UpdateLogSchema);

// Cross-reference checks
const indicatorIds = new Set(indicators.map((i) => i.id));
const actorIds = new Set(actors.map((a) => a.id));
const sourceIds = new Set(sources.map((s) => s.id));

for (const power of powers) {
  for (const indId of power.indicatorIds) {
    if (!indicatorIds.has(indId)) {
      console.error(`[powers.json] power "${power.slug}" references missing indicator "${indId}"`);
      errors++;
    }
  }
}

for (const movement of movements) {
  for (const actorId of movement.actorIds) {
    if (!actorIds.has(actorId)) {
      console.error(`[movements.json] movement "${movement.id}" references missing actor "${actorId}"`);
      errors++;
    }
  }
}

for (const indicator of indicators) {
  if (!sourceIds.has(indicator.sourceId)) {
    console.error(`[indicators.json] indicator "${indicator.id}" references missing source "${indicator.sourceId}"`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log("\nAll checks passed.");
}
