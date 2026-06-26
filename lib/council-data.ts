import councilJson from "@/data/processed/council.json";
import { CouncilMemberSchema, MayorSchema } from "@/lib/schemas";
import type { CouncilMember, Mayor } from "@/lib/schemas";

const raw = councilJson as {
  mayor: unknown;
  councilInfo: {
    capacity: number;
    currentMembers: number;
    nextElection: string;
    lastElection: string;
    lastElectionTurnout: number;
    nextCapacity: number;
    note: string;
    source: string;
    sourceUrl: string;
  };
  members: unknown[];
  formerCandidates: { name: string; nameKana: string; party: string; age: number; background: string; votes2023: number; result: string }[];
};

export const mayor: Mayor = MayorSchema.parse(raw.mayor);

export const councilInfo = raw.councilInfo;

export const councilMembers: CouncilMember[] = raw.members.map((m) =>
  CouncilMemberSchema.parse(m)
);

export const activeMembers = councilMembers.filter((m) => !m.isFormer);
export const formerMembers = councilMembers.filter((m) => m.isFormer);
export const formerCandidates = raw.formerCandidates;

export const FACTION_ORDER = [
  "にのへ未来創生会",
  "清和会",
  "優和会",
  "日本共産党二戸市議団",
  "無会派",
] as const;

export type FactionName = (typeof FACTION_ORDER)[number];

export function getMembersByFaction(members: CouncilMember[]): Map<string, CouncilMember[]> {
  const map = new Map<string, CouncilMember[]>();
  for (const faction of FACTION_ORDER) {
    const group = members.filter((m) => m.faction === faction);
    if (group.length > 0) map.set(faction, group);
  }
  return map;
}
