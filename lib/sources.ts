export type SourceTier =
  | "city"
  | "estat"
  | "prefecture"
  | "estimate"
  | "survey"
  | "reference";

export type GeographyScope =
  | "二戸市"
  | "岩手県北圏域"
  | "岩手県"
  | "全国";

export interface SourceDef {
  id: string;
  name: string;
  organization: string;
  url: string;
  tier: SourceTier;
  description: string;
}

export const SOURCE_DEFS: Record<string, SourceDef> = {
  ninohe_official: {
    id: "ninohe_official",
    name: "二戸市公式資料",
    organization: "二戸市",
    url: "https://www.city.ninohe.iwate.jp/",
    tier: "city",
    description: "二戸市が公式に公表する統計・報告書・施策資料",
  },
  iwate_official: {
    id: "iwate_official",
    name: "岩手県公式統計",
    organization: "岩手県",
    url: "https://www.pref.iwate.jp/",
    tier: "prefecture",
    description: "岩手県が公表する統計・観光統計・医療統計等",
  },
  estat: {
    id: "estat",
    name: "e-Stat（政府統計の総合窓口）",
    organization: "総務省統計局",
    url: "https://www.e-stat.go.jp/",
    tier: "estat",
    description: "国勢調査・社会・人口統計体系・経済センサス等の一次統計",
  },
  census: {
    id: "census",
    name: "国勢調査",
    organization: "総務省統計局",
    url: "https://www.stat.go.jp/data/kokusei/",
    tier: "estat",
    description: "5年ごとに実施される国内最大規模の人口統計",
  },
  population_system: {
    id: "population_system",
    name: "社会・人口統計体系",
    organization: "総務省統計局",
    url: "https://www.e-stat.go.jp/regional-statistics/ssdsview",
    tier: "estat",
    description: "都道府県・市区町村別の社会・人口統計体系データ",
  },
  economic_census: {
    id: "economic_census",
    name: "経済センサス",
    organization: "総務省・経済産業省",
    url: "https://www.stat.go.jp/data/e-census/",
    tier: "estat",
    description: "事業所・企業の産業・従業者数・売上等",
  },
  stat_gis: {
    id: "stat_gis",
    name: "統計GIS",
    organization: "総務省統計局",
    url: "https://www.e-stat.go.jp/gis",
    tier: "estat",
    description: "地域メッシュ統計・境界データ等の地理統計情報",
  },
  iwate_labor: {
    id: "iwate_labor",
    name: "岩手労働市場年報",
    organization: "岩手労働局",
    url: "https://jsite.mhlw.go.jp/iwate-roudoukyoku/",
    tier: "prefecture",
    description: "岩手県内公共職業安定所管内の求人・求職・就職状況",
  },
  ninohe_survey: {
    id: "ninohe_survey",
    name: "二戸市市民意識調査",
    organization: "二戸市総合政策課",
    url: "https://www.city.ninohe.iwate.jp/",
    tier: "survey",
    description: "二戸市が実施する市民アンケート調査",
  },
  whitepaper: {
    id: "whitepaper",
    name: "国の白書・年次報告書",
    organization: "各省庁",
    url: "https://www.e-gov.go.jp/",
    tier: "reference",
    description: "政策文脈・背景説明の補助線として参照。数値の一次根拠には使用しない。",
  },
};

export const TIER_BADGE: Record<SourceTier, { label: string; bg: string; text: string; border: string }> = {
  city:       { label: "市公式ベース",   bg: "bg-blue-50",    text: "text-blue-800",    border: "border-blue-200" },
  estat:      { label: "政府統計ベース", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  prefecture: { label: "県統計ベース",   bg: "bg-teal-50",    text: "text-teal-800",    border: "border-teal-200" },
  estimate:   { label: "推計値",         bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200" },
  survey:     { label: "調査値",         bg: "bg-purple-50",  text: "text-purple-800",  border: "border-purple-200" },
  reference:  { label: "参考値",         bg: "bg-gray-50",    text: "text-gray-600",    border: "border-gray-200" },
};
