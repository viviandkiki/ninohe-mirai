"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { eventGoogleMapsUrl, type NinoheEvent } from "@/lib/events";

interface GoogleEventMapProps {
  events: NinoheEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  apiKey?: string;
}

let googleMapsPromise: Promise<typeof google> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps is available in the browser only."));
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-ninohe-google-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load.")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.ninoheGoogleMaps = "true";
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Google Maps failed to load."));
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

const PIN_COLORS: Record<NinoheEvent["category"], string> = {
  "祭り": "#b54a34",
  "食・マルシェ": "#92670e",
  "朝市・市日": "#627d1b",
  "体験・講座": "#0e6b7c",
  "文化・芸術": "#6941a5",
  "子ども・家族": "#2f6b39",
  "行政・地域": "#475569",
};

export default function GoogleEventMap({ events, selectedId, onSelect, apiKey }: GoogleEventMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [loadFailed, setLoadFailed] = useState(false);
  const selected = events.find((event) => event.id === selectedId) ?? events[0] ?? null;

  useEffect(() => {
    if (!apiKey || !mapElementRef.current || events.length === 0) return;
    let cancelled = false;
    const listeners: google.maps.MapsEventListener[] = [];
    const markers = new Map<string, google.maps.Marker>();

    loadGoogleMaps(apiKey)
      .then((googleApi) => {
        if (cancelled || !mapElementRef.current) return;

        const map = new googleApi.maps.Map(mapElementRef.current, {
          center: { lat: 40.255, lng: 141.25 },
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
        });
        mapRef.current = map;
        markersRef.current = markers;
        const bounds = new googleApi.maps.LatLngBounds();

        for (const event of events) {
          const position = { lat: event.latitude, lng: event.longitude };
          const marker = new googleApi.maps.Marker({
            map,
            position,
            title: event.title,
            icon: {
              path: googleApi.maps.SymbolPath.CIRCLE,
              fillColor: PIN_COLORS[event.category],
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
              scale: event.id === selectedId ? 10 : 8,
            },
            zIndex: event.id === selectedId ? 10 : 1,
          });
          listeners.push(marker.addListener("click", () => onSelect(event.id)));
          markers.set(event.id, marker);
          bounds.extend(position);
        }

        if (events.length === 1) {
          map.setCenter(bounds.getCenter());
          map.setZoom(14);
        } else {
          map.fitBounds(bounds, 52);
        }
      })
      .catch(() => setLoadFailed(true));

    return () => {
      cancelled = true;
      listeners.forEach((listener) => listener.remove());
      markers.forEach((marker) => marker.setMap(null));
      markers.clear();
      markersRef.current = new Map();
      mapRef.current = null;
    };
  }, [apiKey, events, onSelect, selectedId]);

  useEffect(() => {
    if (!apiKey || !mapRef.current || !selected) return;
    for (const [id, marker] of markersRef.current) {
      const isSelected = id === selected.id;
      const event = events.find((item) => item.id === id);
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: event ? PIN_COLORS[event.category] : "#0e6b7c",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
        scale: isSelected ? 10 : 8,
      });
      marker.setZIndex(isSelected ? 10 : 1);
    }
    mapRef.current.panTo({ lat: selected.latitude, lng: selected.longitude });
  }, [apiKey, events, selected]);

  if (events.length === 0) {
    return (
      <div className="min-h-[420px] bg-slate-100 flex items-center justify-center text-center p-8">
        <div>
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-600 font-bold">条件に合うイベントがありません</p>
          <p className="text-sm text-slate-500 mt-1">絞り込みを変更してください。</p>
        </div>
      </div>
    );
  }

  if (!apiKey || loadFailed) {
    const bounds = { north: 40.31, south: 40.12, east: 141.34, west: 141.07 };
    const positionFor = (event: NinoheEvent, index: number) => ({
      left: `${Math.min(94, Math.max(6, ((event.longitude - bounds.west) / (bounds.east - bounds.west)) * 100 + (index % 3) * 1.2))}%`,
      top: `${Math.min(88, Math.max(8, ((bounds.north - event.latitude) / (bounds.north - bounds.south)) * 100 + (index % 2) * 1.2))}%`,
    });

    return (
      <div
        className="relative min-h-[420px] h-full overflow-hidden bg-[#eaf3f5]"
        style={{
          backgroundImage: "linear-gradient(rgba(14,107,124,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14,107,124,0.08) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        role="region"
        aria-label="二戸市内のイベント位置を示す概略図"
      >
        <div className="absolute inset-5 rounded-[2rem] border-2 border-[#0e6b7c]/15 bg-white/35 shadow-inner" aria-hidden="true" />
        <div className="absolute left-5 top-5 rounded-lg bg-white/95 px-3 py-2 shadow border border-slate-200">
          <p className="text-xs font-black tracking-wide text-[#0e6b7c]">イベント位置（概略）</p>
          <p className="text-xs text-slate-500">正確な場所はGoogleマップで確認</p>
        </div>
        <div className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-black shadow" aria-hidden="true">
          N
        </div>

        {events.map((event, index) => {
          const isSelected = event.id === selected?.id;
          const position = positionFor(event, index);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 ${isSelected ? "z-20 scale-110" : "z-10"}`}
              style={position}
              aria-label={`${event.title}を選択`}
              aria-pressed={isSelected}
              title={event.title}
            >
              <span
                className={`flex items-center justify-center rounded-full border-[3px] border-white shadow-lg ${isSelected ? "w-12 h-12" : "w-10 h-10"}`}
                style={{ backgroundColor: PIN_COLORS[event.category] }}
              >
                <MapPin className="w-5 h-5 text-white" aria-hidden="true" />
              </span>
              {isSelected && (
                <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-max max-w-52 rounded-lg bg-[#0f172a] px-3 py-2 text-xs font-bold leading-snug text-white shadow-xl">
                  {event.venue}
                </span>
              )}
            </button>
          );
        })}

        {selected && (
          <>
            <a
              href={eventGoogleMapsUrl(selected)}
              target="_blank"
              rel="noreferrer"
              className="absolute left-3 bottom-3 min-h-11 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#0e6b7c] shadow-lg border border-slate-200 hover:bg-[#f0f9fa] transition-colors"
            >
              Googleマップで開く
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </>
        )}
      </div>
    );
  }

  return <div ref={mapElementRef} className="min-h-[420px] h-full w-full" aria-label="イベント開催場所のGoogleマップ" />;
}
