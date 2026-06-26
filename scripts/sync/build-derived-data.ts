import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const PROCESSED = join(process.cwd(), "data", "processed");
const MANUAL = join(process.cwd(), "data", "manual");
const DERIVED = join(process.cwd(), "data", "derived");

mkdirSync(DERIVED, { recursive: true });

interface ScoreEntry {
  slug: string;
  score: number;
  scoreLabel: string;
  basis: string;
}

interface ScoresFile {
  version: string;
  note: string;
  scores: ScoreEntry[];
}

// Load scores from manual
const scoresRaw = JSON.parse(readFileSync(join(MANUAL, "scores.json"), "utf-8")) as ScoresFile;
const scoreMap = new Map(scoresRaw.scores.map((s) => [s.slug, s]));

// Load powers
const powers = JSON.parse(readFileSync(join(PROCESSED, "powers.json"), "utf-8")) as Array<{
  id: string;
  slug: string;
  name: string;
  [key: string]: unknown;
}>;

// Build radar data
const radarData = powers.map((p) => {
  const scoreEntry = scoreMap.get(p.slug);
  return {
    subject: p.name,
    score: scoreEntry?.score ?? (p.score as number | undefined) ?? 60,
    fullMark: 100,
    scoreLabel: scoreEntry?.scoreLabel,
    basis: scoreEntry?.basis,
  };
});

writeFileSync(
  join(DERIVED, "radar.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), data: radarData }, null, 2)
);
console.log(`✓ data/derived/radar.json (${radarData.length} entries)`);

// Build merged powers with scores
const powersWithScores = powers.map((p) => {
  const scoreEntry = scoreMap.get(p.slug);
  return {
    ...p,
    score: scoreEntry?.score ?? p.score,
    scoreLabel: scoreEntry?.scoreLabel,
    scoreBasis: scoreEntry?.basis,
  };
});

writeFileSync(
  join(DERIVED, "powers-with-scores.json"),
  JSON.stringify(powersWithScores, null, 2)
);
console.log(`✓ data/derived/powers-with-scores.json (${powersWithScores.length} entries)`);
console.log("\nDerived data build complete.");
