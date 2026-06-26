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
  kind: "actor-theme" | "actor-actor";
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const POWER_COLORS: Record<string, string> = {
  work:    "#c9614a",
  earn:    "#d97706",
  inherit: "#b8872a",
  connect: "#2e7d8c",
  prepare: "#3b6fa0",
  live:    "#2d7a5f",
};

const ACTOR_TYPE_COLORS: Record<string, string> = {
  official:  "#1e3a5f",
  council:   "#2e7d8c",
  community: "#2d7a5f",
  npo:       "#b8872a",
};

function shortName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function buildGraphData(): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const linkSet = new Set<string>();

  const addLink = (source: string, target: string, weight: number, kind: GraphLink["kind"]) => {
    const key = [source, target].sort().join("|");
    if (linkSet.has(key)) {
      const existing = links.find(l => [l.source, l.target].sort().join("|") === key);
      if (existing) existing.weight += weight;
      return;
    }
    linkSet.add(key);
    links.push({ source, target, weight, kind });
  };

  // Theme nodes
  for (const power of powers) {
    nodes.push({
      id: `theme-${power.slug}`,
      label: power.name,
      type: "theme",
      color: POWER_COLORS[power.slug] ?? "#2e7d8c",
      radius: 28,
    });
  }

  // Actor nodes
  for (const actor of actors) {
    const roleBase = actor.role.split("（")[0];
    const sublabel = roleBase.length > 8 ? roleBase.slice(0, 8) + "…" : roleBase;
    nodes.push({
      id: actor.id,
      label: shortName(actor.name),
      sublabel,
      type: actor.type as GraphNode["type"],
      color: ACTOR_TYPE_COLORS[actor.type] ?? "#4b5563",
      radius: actor.type === "official" ? 22 : 17,
    });
  }

  // Actor → Theme edges via focusPowers
  for (const actor of actors) {
    for (const slug of actor.focusPowers) {
      addLink(actor.id, `theme-${slug}`, 1, "actor-theme");
    }
  }

  // Supplement actor → theme edges via movements
  for (const movement of movements) {
    for (const actorId of movement.actorIds) {
      if (!actors.find(a => a.id === actorId)) continue;
      for (const slug of movement.powerSlugs) {
        addLink(actorId, `theme-${slug}`, 0.5, "actor-theme");
      }
    }
  }

  // Actor → Actor edges via shared focusPowers (2+ shared themes = connected)
  for (let i = 0; i < actors.length; i++) {
    for (let j = i + 1; j < actors.length; j++) {
      const a = actors[i]!;
      const b = actors[j]!;
      const shared = a.focusPowers.filter(p => b.focusPowers.includes(p));
      if (shared.length >= 2) {
        addLink(a.id, b.id, shared.length, "actor-actor");
      }
    }
  }

  // Actor → Actor edges via co-movements
  for (const movement of movements) {
    const validIds = movement.actorIds.filter(id => actors.find(a => a.id === id));
    for (let i = 0; i < validIds.length; i++) {
      for (let j = i + 1; j < validIds.length; j++) {
        addLink(validIds[i]!, validIds[j]!, 1, "actor-actor");
      }
    }
  }

  return { nodes, links };
}
