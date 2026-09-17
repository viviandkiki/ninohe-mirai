"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import type { CircleMarker, Map as LeafletMap } from "leaflet";
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

  const promise = new Promise<typeof google>((resolve, reject) => {
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
  }).catch((error) => {
    googleMapsPromise = null;
    throw error;
  });
  googleMapsPromise = promise;

  return promise;
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

function FallbackEventMap({ events, selectedId, onSelect }: Omit<GoogleEventMapProps, "apiKey">) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, CircleMarker>>(new Map());
  const selectedIdRef = useRef(selectedId);
  const selected = events.find((event) => event.id === selectedId) ?? events[0] ?? null;

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!mapElementRef.current || events.length === 0) return;
    let cancelled = false;
    let initializedMap: LeafletMap | null = null;

    void import("leaflet").then((leafletModule) => {
      if (cancelled || !mapElementRef.current) return;
      const leaflet = leafletModule.default;
      const map = leaflet.map(mapElementRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      });
      initializedMap = map;
      mapRef.current = map;

      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);

      const bounds = leaflet.latLngBounds([]);
      const markers = new Map<string, CircleMarker>();
      for (const event of events) {
        const isSelected = event.id === selectedIdRef.current;
        const marker = leaflet.circleMarker([event.latitude, event.longitude], {
          radius: isSelected ? 10 : 8,
          color: "#ffffff",
          weight: 3,
          fillColor: PIN_COLORS[event.category],
          fillOpacity: 1,
        });
        marker.bindTooltip(event.title, { direction: "top", offset: [0, -8] });
        marker.on("click", () => onSelect(event.id));
        marker.addTo(map);
        markers.set(event.id, marker);
        bounds.extend([event.latitude, event.longitude]);
      }
      markersRef.current = markers;

      if (events.length === 1) {
        map.setView(bounds.getCenter(), 14);
      } else {
        map.fitBounds(bounds, { padding: [44, 44] });
      }
    });

    return () => {
      cancelled = true;
      markersRef.current.clear();
      if (initializedMap) initializedMap.remove();
      mapRef.current = null;
    };
  }, [events, onSelect]);

  useEffect(() => {
    if (!selected || !mapRef.current) return;
    for (const [id, marker] of markersRef.current) {
      const isSelected = id === selected.id;
      marker.setRadius(isSelected ? 10 : 8);
      marker.setStyle({ weight: isSelected ? 4 : 3 });
      if (isSelected) marker.bringToFront();
    }
    mapRef.current.panTo([selected.latitude, selected.longitude]);
  }, [selected]);

  return (
    <div className="relative min-h-[420px] h-full overflow-hidden bg-[#eaf3f5]" role="region" aria-label="イベント会場の地図">
      <div ref={mapElementRef} className="absolute inset-0 min-h-[420px] h-full w-full" />

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-[500] flex items-start justify-between gap-3">
        <div className="max-w-[calc(100%-3.5rem)] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
          <p className="text-xs font-black tracking-wide text-[#0e6b7c]">VENUE MAP</p>
          <p className="truncate text-sm font-bold text-slate-900">{selected?.venue ?? "二戸市"}</p>
          <p className="text-xs text-slate-500">地点を選択・詳細はGoogleマップへ</p>
        </div>
      </div>

      {selected && (
        <a
          href={eventGoogleMapsUrl(selected)}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-7 left-3 z-[500] inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-[#0e6b7c] shadow-lg transition-colors hover:bg-[#f0f9fa]"
        >
          Googleマップで開く
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

export default function GoogleEventMap({ events, selectedId, onSelect, apiKey }: GoogleEventMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const selectedIdRef = useRef(selectedId);
  const [loadFailed, setLoadFailed] = useState(false);
  const selected = events.find((event) => event.id === selectedId) ?? events[0] ?? null;

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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
              scale: event.id === selectedIdRef.current ? 10 : 8,
            },
            zIndex: event.id === selectedIdRef.current ? 10 : 1,
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
  }, [apiKey, events, onSelect]);

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
    return <FallbackEventMap events={events} selectedId={selectedId} onSelect={onSelect} />;
  }

  return <div ref={mapElementRef} className="min-h-[420px] h-full w-full" aria-label="イベント開催場所のGoogleマップ" />;
}
