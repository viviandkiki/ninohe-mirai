import { z } from "zod";
import eventData from "@/data/manual/events.json";

export const EVENT_CATEGORIES = ["祭り", "食・マルシェ", "朝市・市日", "体験・講座", "文化・芸術", "子ども・家族", "行政・地域"] as const;
export const EVENT_AREAS = ["福岡", "石切所", "浄法寺", "金田一", "御返地", "その他"] as const;
export const EVENT_SOURCE_TYPES = ["official", "organizer", "community"] as const;

const eventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  start: z.iso.datetime({ offset: true }),
  end: z.iso.datetime({ offset: true }),
  scheduleLabel: z.string().min(1),
  venue: z.string().min(1),
  address: z.string().min(1),
  area: z.enum(EVENT_AREAS),
  category: z.enum(EVENT_CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  fee: z.string().min(1),
  reservation: z.string().min(1),
  organizer: z.string().min(1),
  contact: z.string().min(1),
  sourceName: z.string().min(1),
  sourceType: z.enum(EVENT_SOURCE_TYPES).default("official"),
  sourceUrl: z.url(),
  imageUrl: z.url().optional(),
  imageAlt: z.string().min(1).optional(),
  imageCredit: z.string().min(1).optional(),
  discoveredVia: z
    .array(
      z.object({
        name: z.string().min(1),
        url: z.url(),
      }),
    )
    .optional(),
  verifiedAt: z.iso.date(),
});

export type NinoheEvent = z.infer<typeof eventSchema>;

export const events: NinoheEvent[] = z.array(eventSchema).parse(eventData).sort(
  (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
);

export const EVENT_CATEGORY_STYLES: Record<NinoheEvent["category"], { background: string; color: string }> = {
  "祭り": { background: "#fff1ed", color: "#9f321f" },
  "食・マルシェ": { background: "#fff7dc", color: "#805400" },
  "朝市・市日": { background: "#eef7df", color: "#4d6815" },
  "体験・講座": { background: "#e8f7fa", color: "#0e6b7c" },
  "文化・芸術": { background: "#f1ecff", color: "#6941a5" },
  "子ども・家族": { background: "#ecf8ed", color: "#2f6b39" },
  "行政・地域": { background: "#edf2f7", color: "#334155" },
};

export const EVENT_SOURCE_LABELS: Record<NinoheEvent["sourceType"], string> = {
  official: "公式情報",
  organizer: "主催者情報",
  community: "地域発信",
};

export function eventGoogleMapsUrl(event: NinoheEvent) {
  const query = encodeURIComponent(`${event.venue} ${event.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
