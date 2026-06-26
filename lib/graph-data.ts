import { actors, powers, movements } from "@/lib/data";

export interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  type: "member" | "theme" | "organization" | "npo" | "official" | "council" | "community";
  color: string;
  radius: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const POWER_COLORS: Record<string, string> = {
  work: "#c9614a",
  earn: "#d97706",
  inherit: "#b8872a",
  connect: "#2e7d8c",
  prepare: "#3b6fa0",
  live: "#2d7a5f",
};

const ACTOR_TYPE_COLORS: Record<string, string> = {
  official: "#1e3a5f",
  council: "#2e7d8c",
  community: "#2d7a5f",
  npo: "#b8872a",
};

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[0] ?? name;
}

export function buildGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const linkMap = new Map<string, number>();

  // Add power theme nodes
  for (const power of powers) {
    nodes.push({
      id: `theme-${power.slug}`,
      label: power.name,
      type: "theme",
      color: POWER_COLORS[power.slug] ?? "#2e7d8c",
      radius: 30,
    });
  }

  // Add actor nodes
  for (const actor of actors) {
    const roleBase = actor.role.split("（")[0];
    const sublabel = roleBase.includes("議員")
      ? roleBase
      : roleBase.length > 8
      ? roleBase.slice(0, 8) + "…"
      : roleBase;
    nodes.push({
      id: actor.id,
      label: shortName(actor.name),
      sublabel,
      type: actor.type as GraphNode["type"],
      color: ACTOR_TYPE_COLORS[actor.type] ?? "#4b5563",
      radius: actor.type === "official" ? 28 : 22,
    });
  }

  // Build links via focusPowers
  for (const actor of actors) {
    for (const slug of actor.focusPowers) {
      const linkKey = `${actor.id}::theme-${slug}`;
      linkMap.set(linkKey, (linkMap.get(linkKey) ?? 0) + 1);
    }
  }

  // Supplement via movements
  for (const movement of movements) {
    for (const actorId of movement.actorIds) {
      for (const slug of movement.powerSlugs) {
        const linkKey = `${actorId}::theme-${slug}`;
        linkMap.set(linkKey, (linkMap.get(linkKey) ?? 0) + 1);
      }
    }
  }

  const links: GraphLink[] = [];
  for (const [key, weight] of linkMap.entries()) {
    const parts = key.split("::");
    const source = parts[0];
    const target = parts[1];
    if (source && target) {
      links.push({ source, target, weight });
    }
  }

  return { nodes, links };
}
