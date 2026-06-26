export * from "../data";

import scoresRaw from "@/data/manual/scores.json";

export interface PowerScore {
  slug: string;
  score: number;
  scoreLabel: string;
  basis: string;
}

export const powerScores: PowerScore[] = scoresRaw.scores;

export function getPowerScore(slug: string): PowerScore | undefined {
  return powerScores.find((s) => s.slug === slug);
}

export const scoresMeta = {
  version: scoresRaw.version,
  note: scoresRaw.note,
};
