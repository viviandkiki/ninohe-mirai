import keywordsRaw from "@/data/keywords.json";
import actorsRaw from "@/data/processed/actors.json";
import movementsRaw from "@/data/processed/movements.json";
import type { GraphData, GraphNode, GraphLink } from "@/lib/graph-data";

export const CATEGORY_COLORS: Record<string, string> = {
  産業: "#d97706",
  歴史: "#7c3aed",
  自然: "#2d7a5f",
  文化: "#c9614a",
  まち: "#2e7d8c",
};

export const ACTOR_TYPE_COLORS: Record<string, string> = {
  official:  "#2563eb",
  community: "#475569",
  npo:       "#b45309",
};

export const KEYWORD_CATEGORIES = Object.keys(CATEGORY_COLORS);

// focusPower slug → keyword IDs it activates
const POWER_TO_KEYWORDS: Record<string, string[]> = {
  earn: [
    "kw-nanbubijin", "kw-tankaku", "kw-agriculture", "kw-sake",
    "kw-apple", "kw-tourism", "kw-forestry", "kw-urushi",
  ],
  inherit: [
    "kw-urushi", "kw-lacquerware", "kw-lacquer-tapping", "kw-traditional-crafts",
    "kw-tendaiji", "kw-joboji", "kw-festival", "kw-joboji-urushi",
  ],
  work: ["kw-revitalization", "kw-migration", "kw-ninohe", "kw-depopulation"],
  connect: ["kw-revitalization", "kw-migration", "kw-tourism", "kw-festival"],
  prepare: ["kw-healthcare", "kw-childcare", "kw-depopulation"],
  live: ["kw-childcare", "kw-healthcare", "kw-satoyama", "kw-mabuchi-river"],
};

// text patterns in movement title/summary → keyword IDs
const TEXT_PATTERNS: Array<{ id: string; patterns: string[] }> = [
  { id: "kw-urushi",            patterns: ["漆"] },
  { id: "kw-joboji-urushi",     patterns: ["浄法寺漆"] },
  { id: "kw-kunohe-castle",     patterns: ["九戸城"] },
  { id: "kw-migration",         patterns: ["移住定住", "移住・定住", "移住"] },
  { id: "kw-depopulation",      patterns: ["人口減少", "少子高齢化"] },
  { id: "kw-childcare",         patterns: ["子育て", "育児"] },
  { id: "kw-healthcare",        patterns: ["医療", "福祉"] },
  { id: "kw-agriculture",       patterns: ["農業", "農林業"] },
  { id: "kw-forestry",          patterns: ["林業", "森林"] },
  { id: "kw-tourism",           patterns: ["観光"] },
  { id: "kw-origashidake",      patterns: ["折爪岳"] },
  { id: "kw-traditional-crafts", patterns: ["伝統工芸", "漆工芸"] },
  { id: "kw-lacquerware",       patterns: ["漆器", "塗り椀"] },
  { id: "kw-revitalization",    patterns: ["地域おこし", "まちづくり"] },
];

const ACTOR_SHORT_NAMES: Record<string, string> = {
  "actor-mayor":          "五日市市長",
  "actor-shokokai":       "商工会",
  "actor-nsk":            "二戸信金",
  "actor-nokyo":          "JAふるさと",
  "actor-ringyo":         "林業関係",
  "actor-kanko":          "観光協会",
  "actor-kouiki":         "商工観光推進",
  "actor-hospital":       "市立病院",
  "actor-shakyo":         "社会福祉協議",
  "actor-kominkan":       "公民館",
  "actor-joboji-urushi":  "漆生産組合",
  "actor-chiikiokoshi":   "協力隊OB",
  "actor-kanko-kinuichi": "金田一温泉",
  "actor-npo-center":     "NPOセンター",
  "actor-doyo":           "農業共済",
  "actor-kenminkyoku":    "県北振興局",
  "actor-nanbu-bijin":    "南部美人",
};

export function buildKeywordGraphData(): GraphData {
  const keywords = keywordsRaw as Array<{
    id: string; label: string; category: string;
    description: string; related: string[]; weight: number;
  }>;
  const actors = actorsRaw as Array<{
    id: string; name: string; type: string;
    description?: string; focusPowers: string[];
  }>;
  const movements = movementsRaw as Array<{
    id: string; title: string; summary?: string;
    powerSlugs: string[]; actorIds: string[];
  }>;

  const kwIdSet  = new Set(keywords.map(k => k.id));
  const actorIdSet = new Set(actors.map(a => a.id));

  // Accumulate actor-keyword edge weights
  const akWeights = new Map<string, number>(); // `${actorId}|${kwId}` → weight

  const add = (actorId: string, kwId: string, w: number) => {
    if (!actorIdSet.has(actorId) || !kwIdSet.has(kwId)) return;
    const key = `${actorId}|${kwId}`;
    akWeights.set(key, (akWeights.get(key) ?? 0) + w);
  };

  // 1. focusPowers → keywords
  for (const actor of actors) {
    for (const power of actor.focusPowers) {
      for (const kwId of POWER_TO_KEYWORDS[power] ?? []) {
        add(actor.id, kwId, 1);
      }
    }
  }

  // 2. Movement text matching × actorIds
  for (const mov of movements) {
    const text = `${mov.title} ${mov.summary ?? ""}`;
    for (const { id: kwId, patterns } of TEXT_PATTERNS) {
      if (patterns.some(p => text.includes(p))) {
        for (const actorId of mov.actorIds) {
          add(actorId, kwId, 1);
        }
      }
    }
  }

  // Count unique connections for node sizing
  const kwActorCount  = new Map<string, number>(); // unique actor connections per keyword
  const actorKwCount  = new Map<string, number>(); // unique keyword connections per actor
  for (const key of akWeights.keys()) {
    const [aId, kId] = key.split("|") as [string, string];
    kwActorCount.set(kId, (kwActorCount.get(kId) ?? 0) + 1);
    actorKwCount.set(aId, (actorKwCount.get(aId) ?? 0) + 1);
  }

  // Keyword nodes — radius grows with declared weight + number of actor connections
  const kwNodes: GraphNode[] = keywords.map(kw => ({
    id: kw.id,
    label: kw.label,
    sublabel: kw.description.slice(0, 35) + "…",
    type: kw.category,
    color: CATEGORY_COLORS[kw.category] ?? "#4b5563",
    radius: 15 + kw.weight * 3 + Math.min((kwActorCount.get(kw.id) ?? 0) * 1.5, 12),
  }));

  // Actor nodes — radius grows with number of connected keywords
  const actorNodes: GraphNode[] = actors.map(actor => ({
    id: actor.id,
    label: actor.name,
    shortLabel: ACTOR_SHORT_NAMES[actor.id] ?? actor.name.slice(0, 8),
    sublabel: actor.type === "official" ? "行政" : actor.type === "npo" ? "NPO" : "地域団体",
    type: `actor-${actor.type}`,
    color: ACTOR_TYPE_COLORS[actor.type] ?? "#475569",
    radius: 11 + Math.min((actorKwCount.get(actor.id) ?? 0) * 0.9, 12),
  }));

  // Keyword-keyword links from related[]
  const kwLinkSet = new Set<string>();
  const kwLinks: GraphLink[] = [];
  for (const kw of keywords) {
    for (const relId of kw.related) {
      if (!kwIdSet.has(relId)) continue;
      const key = [kw.id, relId].sort().join("|");
      if (kwLinkSet.has(key)) continue;
      kwLinkSet.add(key);
      kwLinks.push({ source: kw.id, target: relId, weight: 1, kind: "keyword-keyword" });
    }
  }

  // Actor-keyword links
  const akLinks: GraphLink[] = [];
  for (const [key, weight] of akWeights) {
    const [aId, kId] = key.split("|") as [string, string];
    akLinks.push({ source: aId, target: kId, weight, kind: "actor-keyword" });
  }

  return { nodes: [...kwNodes, ...actorNodes], links: [...kwLinks, ...akLinks] };
}
