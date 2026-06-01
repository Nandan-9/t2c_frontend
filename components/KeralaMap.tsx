"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getDistrictPostCounts, type DistrictPostCount } from "@/lib/api/districts";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const GEOJSON_URLS: Record<string, string> = {
  district: "https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/kerala.district.geojson",
  taluk: "https://raw.githubusercontent.com/geohacker/kerala/master/geojsons/kerala.taluk.geojson",
};

type Level = "state" | "district" | "taluk";

const INDIGO = "#4F46E5";
const INDIGO_HOVER = "#4338CA";

function getNameFromProps(props: Record<string, string>): string {
  return props?.DISTRICT || props?.TALUK || props?.NAME_2 || props?.name || props?.district || props?.taluk || "";
}

function choroplethStyle(count: number, max: number): L.PathOptions {
  const t = max > 0 ? count / max : 0;
  const fillOpacity = count === 0 ? 0.04 : 0.12 + t * 0.58;
  return {
    color: INDIGO,
    weight: 1.5,
    fillColor: INDIGO,
    fillOpacity,
  };
}

function buildCountMap(counts: DistrictPostCount[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of counts) {
    map[d.name.toLowerCase()] = d.post_count;
  }
  return map;
}

export default function KeralaMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [level, setLevel] = useState<Level>("district");
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState<Record<string, unknown> | null>(null);
  const [districtCounts, setDistrictCounts] = useState<DistrictPostCount[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    getDistrictPostCounts().then(setDistrictCounts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const keralaBounds = L.latLngBounds(L.latLng(8.17, 74.85), L.latLng(12.78, 77.40));
    const map = L.map(containerRef.current, {
      center: [10.5, 76.27],
      zoom: 8,
      minZoom: 7,
      maxZoom: 13,
      maxBounds: keralaBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, subdomains: "abcd", maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    setMapReady(true);
    return () => { map.remove(); mapRef.current = null; setMapReady(false); };
  }, []);

  useEffect(() => {
    if (level === "state") {
      if (geoJsonLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
      setGeoData(null);
      return;
    }
    const url = GEOJSON_URLS[level];
    if (!url) return;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setGeoData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [level]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (geoJsonLayerRef.current) {
      mapRef.current.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (!geoData || level === "state") return;

    const countMap = buildCountMap(districtCounts);
    const max = Math.max(...districtCounts.map((d) => d.post_count), 1);

    const layer = L.geoJSON(geoData as unknown as GeoJSON.GeoJsonObject, {
      style(feature) {
        const name = getNameFromProps((feature?.properties ?? {}) as Record<string, string>);
        const count = countMap[name.toLowerCase()] ?? 0;
        return choroplethStyle(count, max);
      },
      onEachFeature(feature, featureLayer) {
        const name = getNameFromProps(feature.properties as Record<string, string>);
        const count = level === "district" ? (countMap[name.toLowerCase()] ?? 0) : null;
        const tooltipContent =
          count !== null
            ? `<strong>${name}</strong><br/><span>${count} post${count !== 1 ? "s" : ""} tagged</span>`
            : name;
        featureLayer.bindTooltip(tooltipContent, { sticky: true, className: "kerala-tooltip" });
        featureLayer.on({
          mouseover(e) {
            (e.target as L.Path).setStyle({ fillOpacity: 0.4, color: INDIGO_HOVER, weight: 2.5 });
          },
          mouseout(e) {
            layer.resetStyle(e.target as L.Path);
          },
        });
      },
    });
    layer.addTo(mapRef.current);
    geoJsonLayerRef.current = layer;
  }, [geoData, level, districtCounts, mapReady]);

  const maxCount = Math.max(...districtCounts.map((d) => d.post_count), 0);
  const levels: Level[] = ["state", "district", "taluk"];

  return (
    <div className="relative w-full h-screen flex flex-col" style={{ background: "#f5f5f0" }}>
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(79,70,229,0.04) 59px, rgba(79,70,229,0.04) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(79,70,229,0.04) 59px, rgba(79,70,229,0.04) 60px)",
        }}
      />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <p className="font-bold text-[#4F46E5] leading-tight text-sm">keralam speaks</p>
            <p className="text-xs text-gray-400">Kerala at a glance</p>
          </div>
        </div>

        {/* Level switcher */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                level === l
                  ? "bg-[#4F46E5] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1 z-0 px-6 pb-6">
        <div className="w-full h-full rounded-2xl overflow-hidden border border-[#4F46E5]/20 shadow-sm" ref={containerRef} />

        {/* Choropleth legend — only on district level */}
        {level === "district" && districtCounts.length > 0 && (
          <div className="absolute bottom-10 right-10 bg-white/95 border border-gray-200 rounded-xl px-4 py-3 shadow-sm z-10 min-w-37.5">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Posts tagged</p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: `${maxCount}`, opacity: 0.7 },
                { label: `${Math.round(maxCount * 0.5)}`, opacity: 0.41 },
                { label: "0", opacity: 0.04 },
              ].map(({ label, opacity }) => (
                <div key={opacity} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm border border-[#4F46E5]/30 shrink-0"
                    style={{ background: `rgba(79,70,229,${opacity})` }}
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 rounded-xl px-4 py-2 text-sm text-[#4F46E5] font-medium shadow-sm">
              Loading…
            </div>
          </div>
        )}
      </div>

      <style>{`
        .kerala-tooltip {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #1f2937;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          line-height: 1.5;
        }
        .kerala-tooltip::before { display: none; }
        .kerala-tooltip strong { color: #111827; }
        .kerala-tooltip span { color: #6b7280; font-size: 12px; font-weight: 400; }
      `}</style>
    </div>
  );
}
