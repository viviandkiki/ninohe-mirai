import { type PowerSlug, type MovementType, type ActorType, type PowerTrend, type UpdateCategory } from "./schemas";

export const BRAND = {
  teal: "#2e7d8c",
  coral: "#c9614a",
  gold: "#b8872a",
  bg: "#f7f4ef",
  surface: "#ffffff",
  text: "#1a1a2e",
  border: "#e5e1da",
};

export const POWER_COLOR_MAP: Record<
  PowerSlug,
  { bg: string; text: string; border: string; badge: string; accent: string; leftBorder: string }
> = {
  work: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    accent: "#c9614a",
    leftBorder: "border-l-4 border-l-[#c9614a]",
  },
  earn: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    accent: "#d4783a",
    leftBorder: "border-l-4 border-l-[#d4783a]",
  },
  inherit: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    accent: "#b8872a",
    leftBorder: "border-l-4 border-l-[#b8872a]",
  },
  connect: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    accent: "#2e7d8c",
    leftBorder: "border-l-4 border-l-[#2e7d8c]",
  },
  prepare: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    accent: "#3b6fa0",
    leftBorder: "border-l-4 border-l-[#3b6fa0]",
  },
  live: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    accent: "#2d7a5f",
    leftBorder: "border-l-4 border-l-[#2d7a5f]",
  },
};

export const MOVEMENT_TYPE_MAP: Record<MovementType, { label: string; color: string }> = {
  policy: { label: "政策", color: "bg-blue-100 text-blue-700" },
  event: { label: "イベント", color: "bg-emerald-100 text-emerald-700" },
  initiative: { label: "取組", color: "bg-amber-100 text-amber-700" },
  announcement: { label: "発表", color: "bg-slate-100 text-slate-600" },
};

export const ACTOR_TYPE_MAP: Record<ActorType, { label: string; color: string }> = {
  official: { label: "行政", color: "bg-blue-100 text-blue-700" },
  council: { label: "議会", color: "bg-violet-100 text-violet-700" },
  community: { label: "地域団体", color: "bg-emerald-100 text-emerald-700" },
  npo: { label: "NPO", color: "bg-amber-100 text-amber-700" },
};

export const TREND_MAP: Record<PowerTrend, { label: string; icon: string; color: string }> = {
  up: { label: "改善傾向", icon: "↑", color: "text-emerald-600" },
  down: { label: "悪化傾向", icon: "↓", color: "text-red-500" },
  stable: { label: "横ばい", icon: "→", color: "text-slate-500" },
};

export const UPDATE_CATEGORY_MAP: Record<UpdateCategory, { label: string; color: string }> = {
  data: { label: "データ更新", color: "bg-blue-100 text-blue-700" },
  content: { label: "コンテンツ", color: "bg-emerald-100 text-emerald-700" },
  design: { label: "デザイン", color: "bg-violet-100 text-violet-700" },
  system: { label: "システム", color: "bg-slate-100 text-slate-600" },
};

export function getScoreColor(score: number): { bar: string; text: string; bg: string } {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
  if (score >= 60) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" };
  return { bar: "bg-[#c9614a]", text: "text-[#c9614a]", bg: "bg-red-50" };
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "A";
  if (score >= 75) return "A-";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 55) return "C+";
  if (score >= 45) return "C";
  return "D";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function formatYearMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}
