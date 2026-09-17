"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import GoogleEventMap from "@/components/GoogleEventMap";
import {
  EVENT_AREAS,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_STYLES,
  EVENT_SOURCE_LABELS,
  eventGoogleMapsUrl,
  type NinoheEvent,
} from "@/lib/events";

type ViewMode = "map" | "calendar" | "list";
type PeriodFilter = "all" | "today" | "weekend" | "30days";

interface EventExplorerProps {
  events: NinoheEvent[];
  googleMapsApiKey?: string;
}

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "今後すべて" },
  { value: "today", label: "今日" },
  { value: "weekend", label: "今週末" },
  { value: "30days", label: "30日以内" },
];

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getRange(period: PeriodFilter, now: Date | null) {
  if (!now) return null;
  const today = startOfDay(now);

  if (period === "all") return { start: today, end: new Date("9999-12-31T23:59:59+09:00") };

  if (period === "today") return { start: today, end: endOfDay(today) };
  if (period === "30days") {
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    return { start: today, end: endOfDay(end) };
  }

  const saturday = new Date(today);
  const untilSaturday = (6 - today.getDay() + 7) % 7;
  saturday.setDate(saturday.getDate() + untilSaturday);
  const sunday = new Date(saturday);
  sunday.setDate(sunday.getDate() + 1);
  return { start: startOfDay(saturday), end: endOfDay(sunday) };
}

function overlaps(event: NinoheEvent, start: Date, end: Date) {
  return new Date(event.start) <= end && new Date(event.end) >= start;
}

function formatVerified(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日確認`;
}

function EventCard({ event, selected, onSelect }: { event: NinoheEvent; selected: boolean; onSelect: () => void }) {
  const style = EVENT_CATEGORY_STYLES[event.category];

  return (
    <article
      className={`rounded-2xl border bg-white transition-all ${
        selected ? "border-[#0e6b7c] shadow-[0_8px_24px_rgba(14,107,124,0.14)]" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full text-left px-4 pt-4 pb-3 rounded-t-2xl cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="w-14 shrink-0 rounded-xl bg-[#0f172a] text-white text-center overflow-hidden">
            <span className="block bg-[#0e6b7c] text-xs font-bold py-1">
              {new Intl.DateTimeFormat("ja-JP", { month: "short" }).format(new Date(event.start))}
            </span>
            <span className="block text-2xl font-black leading-none py-2">
              {new Intl.DateTimeFormat("ja-JP", { day: "numeric" }).format(new Date(event.start))}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ backgroundColor: style.background, color: style.color }}
              >
                {event.category}
              </span>
              <span className="text-xs text-slate-500">{event.area}</span>
            </div>
            <h3 className="text-lg leading-snug font-black text-slate-900">{event.title}</h3>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
          <p className="flex items-start gap-2">
            <Clock3 className="w-4 h-4 mt-1 shrink-0 text-[#0e6b7c]" aria-hidden="true" />
            <span>{event.scheduleLabel}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-1 shrink-0 text-[#0e6b7c]" aria-hidden="true" />
            <span>{event.venue}</span>
          </p>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">{event.summary}</p>
      </button>

      <div className="px-4 py-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Ticket className="w-4 h-4" aria-hidden="true" />
          {event.fee}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          {event.reservation}
        </span>
        <div className="sm:ml-auto flex items-center gap-3">
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline underline-offset-4"
            aria-label={`${EVENT_SOURCE_LABELS[event.sourceType]}：${event.sourceName}`}
          >
            {EVENT_SOURCE_LABELS[event.sourceType]}：{event.sourceName}
          </a>
          <a
            href={eventGoogleMapsUrl(event)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#0e6b7c] px-3 py-2 text-xs font-bold text-white hover:bg-[#095766] transition-colors no-underline"
          >
            Googleマップ
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

function CalendarView({ events, onSelect }: { events: NinoheEvent[]; onSelect: (id: string) => void }) {
  const firstDate = events[0] ? new Date(events[0].start) : new Date();
  const [month, setMonth] = useState(() => new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leadingDays = new Date(year, monthIndex, 1).getDay();
  const dayCount = new Date(year, monthIndex + 1, 0).getDate();
  const cells = Array.from({ length: leadingDays + dayCount }, (_, index) => (index < leadingDays ? null : index - leadingDays + 1));

  const changeMonth = (offset: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden" aria-label="月間イベントカレンダー">
      <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="touch-target rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="前の月"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <h2 className="text-xl font-black text-slate-900">{year}年{monthIndex + 1}月</h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="touch-target rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="次の月"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-sm font-bold ${index === 0 ? "text-[#991b1b]" : index === 6 ? "text-[#1e3a8a]" : "text-slate-600"}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-slate-200 gap-px">
        {cells.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} className="min-h-24 bg-slate-50" aria-hidden="true" />;
          const dateStart = new Date(year, monthIndex, day);
          const dateEnd = endOfDay(dateStart);
          const dayEvents = events.filter((event) => overlaps(event, dateStart, dateEnd));
          return (
            <div key={day} className="min-h-24 bg-white p-1.5 sm:p-2">
              <span className="block text-sm font-bold text-slate-700 mb-1">{day}</span>
              <div className="space-y-1">
                {dayEvents.map((event) => {
                  const style = EVENT_CATEGORY_STYLES[event.category];
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onSelect(event.id)}
                      className="w-full min-h-8 rounded-md px-1.5 py-1 text-left text-xs font-bold leading-tight cursor-pointer hover:brightness-95 focus-visible:outline-offset-1"
                      style={{ backgroundColor: style.background, color: style.color }}
                      title={event.title}
                    >
                      <span className="hidden sm:block line-clamp-2">{event.title}</span>
                      <span className="sm:hidden block text-center" aria-hidden="true">●</span>
                      <span className="sr-only sm:hidden">{event.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function EventExplorer({ events, googleMapsApiKey }: EventExplorerProps) {
  const [view, setView] = useState<ViewMode>("map");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [area, setArea] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [now] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(events[0]?.id ?? null);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    const range = getRange(period, now);

    return events.filter((event) => {
      if (category !== "all" && event.category !== category) return false;
      if (area !== "all" && event.area !== area) return false;
      if (range && !overlaps(event, range.start, range.end)) return false;
      if (!normalizedQuery) return true;
      return [event.title, event.summary, event.venue, event.address, event.organizer]
        .join(" ")
        .toLocaleLowerCase("ja")
        .includes(normalizedQuery);
    });
  }, [area, category, events, now, period, query]);

  const effectiveSelectedId = filteredEvents.some((event) => event.id === selectedId)
    ? selectedId
    : (filteredEvents[0]?.id ?? null);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleCalendarSelect = useCallback((id: string) => {
    setSelectedId(id);
    setView("map");
  }, []);

  const hasFilters = query || category !== "all" || area !== "all" || period !== "all";

  return (
    <div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.8fr_0.8fr] gap-3">
          <label className="block">
            <span className="block text-sm font-bold text-slate-700 mb-1.5">キーワード</span>
            <span className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="イベント名・会場で検索"
                className="w-full min-h-12 rounded-xl border border-slate-300 bg-white pl-11 pr-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0e6b7c]"
              />
            </span>
          </label>

          <label className="block">
            <span className="block text-sm font-bold text-slate-700 mb-1.5">カテゴリ</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 cursor-pointer focus:border-[#0e6b7c]"
            >
              <option value="all">すべて</option>
              {EVENT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="block text-sm font-bold text-slate-700 mb-1.5">地区</span>
            <select
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="w-full min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 cursor-pointer focus:border-[#0e6b7c]"
            >
              <option value="all">市内すべて</option>
              {EVENT_AREAS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <fieldset>
            <legend className="text-sm font-bold text-slate-700 mb-1.5">日付</legend>
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPeriod(option.value)}
                  aria-pressed={period === option.value}
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm font-bold cursor-pointer transition-colors ${
                    period === option.value
                      ? "border-[#0e6b7c] bg-[#0e6b7c] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex items-center justify-between sm:justify-start gap-3">
            <p className="text-sm text-slate-600" aria-live="polite"><strong className="text-slate-900">{filteredEvents.length}</strong>件</p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setQuery(""); setCategory("all"); setArea("all"); setPeriod("all"); }}
                className="min-h-11 px-3 text-sm font-bold text-[#0e6b7c] underline underline-offset-4 cursor-pointer"
              >
                絞り込みを解除
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1" aria-label="表示方法">
          {([
            { value: "map" as const, label: "地図", icon: MapIcon },
            { value: "calendar" as const, label: "カレンダー", icon: CalendarDays },
            { value: "list" as const, label: "一覧", icon: List },
          ]).map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                aria-pressed={view === option.value}
                className={`min-h-11 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold cursor-pointer transition-colors ${
                  view === option.value ? "bg-[#0f172a] text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500">
          最終確認：{events.length > 0 ? formatVerified(events.map((event) => event.verifiedAt).sort().at(-1)!) : "未確認"}
        </p>
      </div>

      {view === "calendar" && <CalendarView events={filteredEvents} onSelect={handleCalendarSelect} />}

      {view === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="min-h-[420px] lg:min-h-[680px] lg:sticky lg:top-20">
            <GoogleEventMap
              events={filteredEvents}
              selectedId={effectiveSelectedId}
              onSelect={handleSelect}
              apiKey={googleMapsApiKey}
            />
          </div>
          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50 p-3 sm:p-4 lg:max-h-[680px] lg:overflow-y-auto">
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selected={event.id === effectiveSelectedId}
                  onSelect={() => setSelectedId(event.id)}
                />
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <div className="py-16 text-center">
                <CalendarDays className="w-9 h-9 mx-auto text-slate-400 mb-3" aria-hidden="true" />
                <p className="font-bold text-slate-700">条件に合うイベントがありません</p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setCategory("all"); setArea("all"); setPeriod("all"); }}
                  className="mt-3 min-h-11 px-4 text-sm font-bold text-[#0e6b7c] underline underline-offset-4 cursor-pointer"
                >
                  絞り込みを解除
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} selected={event.id === effectiveSelectedId} onSelect={() => setSelectedId(event.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
