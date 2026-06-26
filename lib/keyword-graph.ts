import keywordsRaw from "@/data/keywords.json";
import type { GraphData, GraphNode, GraphLink } from "@/lib/graph-data";

interface KeywordEntry {
  id: string;
  label: string;
  category: string;
  description: string;
  related: string[];
  weight: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  産業: "#d97706",
  歴史: "#7c3aed",
  自然: "#2d7a5f",
  文化: "#c9614a",
  まち: "#2e7d8c",
};

const CATEGORY_RADIUS: Record<string, number> = {
  産業: 18,
  歴史: 18,
  自然: 18,
  文化: 18,
  まち: 18,
};

const keywords = keywordsRaw as KeywordEntry[];

export { CATEGORY_COLORS };

export function buildKeywordGraphData(): GraphData {
  const nodes: GraphNode[] = keywords.map(kw => ({
    id: kw.id,
    label: kw.label,
    sublabel: kw.description.slice(0, 30) + "…",
    type: kw.category as GraphNode["type"],
    color: CATEGORY_COLORS[kw.category] ?? "#4b5563",
    radius: CATEGORY_RADIUS[kw.category]! + kw.weight * 4,
  }));

  const linkSet = new Set<string>();
  const links: GraphLink[] = [];

  for (const kw of keywords) {
    for (const relId of kw.related) {
      // Only add if the target keyword exists
      if (!keywords.find(k => k.id === relId)) continue;
      const key = [kw.id, relId].sort().join("|");
      if (linkSet.has(key)) continue;
      linkSet.add(key);
      links.push({ source: kw.id, target: relId, weight: 1, kind: "actor-actor" });
    }
  }

  return { nodes, links };
}

export const KEYWORD_CATEGORIES = Object.keys(CATEGORY_COLORS);
