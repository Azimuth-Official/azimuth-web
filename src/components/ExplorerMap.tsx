"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
} from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { cellToParent, cellToBoundary, getResolution } from "h3-js";
import { TIER_COLORS, TIER_LABELS, SIGNAL_COLORS, THIRD_PARTY_LAYERS, FRESHNESS_COLORS } from "@/lib/explorer-constants";

function zoomToH3Resolution(zoom: number): number {
  if (zoom >= 14) return 8;
  if (zoom >= 12) return 7;
  if (zoom >= 10) return 6;
  if (zoom >= 8) return 5;
  if (zoom >= 6) return 4;
  return 3;
}

function aggregateHexes(
  features: GeoJSON.Feature[],
  targetRes: number
): GeoJSON.FeatureCollection {
if (targetRes >= 8) {
    return {
        type: "FeatureCollection",
        features: features.map((f): GeoJSON.Feature | null => {
            if (f.geometry) return f;
            const h3Index = (f.properties as Record<string, unknown>)?.h3_index as string | undefined;
            if (!h3Index) return null;
            try {
                const boundary = cellToBoundary(h3Index, true);
                return { ...f, geometry: { type: "Polygon" as const, coordinates: [boundary] } };
            } catch { return null; }
        }).filter((f): f is GeoJSON.Feature => f !== null),
    };
}

  const parentMap = new globalThis.Map<
    string,
    { count: number; signalTypes: Set<string>; contributors: number; strength: number; strengthN: number }
  >();

  for (const f of features) {
    const props = f.properties as Record<string, unknown> | null;
    if (!props) continue;
    const h3Index = props.h3_index as string | undefined;
    if (!h3Index || h3Index.startsWith("grid")) continue;

    try {
      const cellRes = getResolution(h3Index);
      const parent = targetRes <= cellRes ? cellToParent(h3Index, targetRes) : h3Index;
      const existing = parentMap.get(parent);
      const obsCount = (props.observation_count as number) || 0;
      const signals = (props.signal_types as string[]) || [];
      const contribs = (props.contributor_count as number) || 0;
      const str = (props.avg_signal_strength as number) || 0;

      if (existing) {
        existing.count += obsCount;
        signals.forEach((s) => existing.signalTypes.add(s));
        existing.contributors += contribs;
        if (str) { existing.strength += str; existing.strengthN++; }
      } else {
        parentMap.set(parent, {
          count: obsCount,
          signalTypes: new Set(signals),
          contributors: contribs,
          strength: str || 0,
          strengthN: str ? 1 : 0,
        });
      }
    } catch {
      // Skip invalid H3 indices
    }
  }

  const aggregated = Array.from(parentMap.entries())
    .map(([parentH3, data]): GeoJSON.Feature | null => {
      try {
        const boundary = cellToBoundary(parentH3, true);
        const ring = [...boundary.map(([lng, lat]) => [lng, lat]), boundary[0]];
        return {
          type: "Feature" as const,
          geometry: { type: "Polygon" as const, coordinates: [ring] },
          properties: {
            h3_index: parentH3,
            observation_count: data.count,
            signal_types: Array.from(data.signalTypes),
            avg_signal_strength: data.strengthN > 0 ? Math.round(data.strength / data.strengthN) : null,
            contributor_count: data.contributors,
          },
        };
      } catch {
        return null;
      }
    })
    .filter((f): f is GeoJSON.Feature => f !== null);

  return { type: "FeatureCollection", features: aggregated };
}

const MAP_STYLES = {
  primary: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  fallback: "https://tiles.openfreemap.org/styles/dark",
};

interface ExplorerNode {
  id: string;
  tier: string;
  label: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  observation_count: number;
  signal_types: string[] | null;
  last_seen_at: string | null;
  registered_at: string;
}

interface HexProperties {
  h3_index: string;
  observation_count: number;
  signal_types: string[];
  avg_signal_strength: number | null;
  contributor_count: number;
}

interface FreshnessHexProperties {
  h3_index: string;
  freshness_tier: string;
  freshness_multiplier: number;
  observation_count: number;
  last_observation: string | null;
}

interface ThirdPartyPopupData {
  lng: number;
  lat: number;
  layerKey: string;
  type: 'hex' | 'dot';
  properties: Record<string, unknown>;
}

interface ExplorerMapProps {
  nodeGeoJSON: GeoJSON.FeatureCollection | null;
  coverageGeoJSON: GeoJSON.FeatureCollection | null;
  freshnessGeoJSON: GeoJSON.FeatureCollection | null;
  nodes: ExplorerNode[];
  selectedNode: ExplorerNode | null;
  onNodeSelect: (node: ExplorerNode | null) => void;
  layers: { coverage: boolean; nodes: boolean; heatmap: boolean };
  heatmapGeoJSON: GeoJSON.FeatureCollection | null;
  signalVisibility: Record<string, boolean>;
  thirdPartyLayers: Record<string, boolean>;
  thirdPartyGeoJSON: Record<string, GeoJSON.FeatureCollection | null>;
  thirdPartyDotGeoJSON: Record<string, GeoJSON.FeatureCollection | null>;
  onDotFetch: (bbox: [number, number, number, number], zoom: number) => void;
  onFreshnessFetch: (bbox: [number, number, number, number]) => void;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ExplorerMap({
  nodeGeoJSON,
  coverageGeoJSON,
  freshnessGeoJSON,
  nodes,
  selectedNode,
  onNodeSelect,
  layers,
  heatmapGeoJSON,
  signalVisibility,
  thirdPartyLayers,
  thirdPartyGeoJSON,
  thirdPartyDotGeoJSON,
  onDotFetch,
  onFreshnessFetch,
}: ExplorerMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.primary);
  const [styleFailed, setStyleFailed] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<{
    lng: number;
    lat: number;
    properties: HexProperties;
  } | null>(null);
  const [freshnessPopup, setFreshnessPopup] = useState<{
    lng: number;
    lat: number;
    properties: FreshnessHexProperties;
  } | null>(null);
  const [thirdPartyPopup, setThirdPartyPopup] = useState<ThirdPartyPopupData | null>(null);
  const [displayResolution, setDisplayResolution] = useState(3);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const dotFetchRef = useRef<ReturnType<typeof setTimeout>>(null);
  const freshnessFetchRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleMoveEnd = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const zoom = map.getZoom();

    // Update hex resolution
    const newRes = zoomToH3Resolution(zoom);
    if (newRes !== displayResolution) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setDisplayResolution(newRes), 300);
    }

    // Trigger dot fetch with debounce
    if (dotFetchRef.current) clearTimeout(dotFetchRef.current);
    dotFetchRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
      ];
      onDotFetch(bbox, Math.floor(zoom));
    }, 300);

    // Trigger freshness fetch with debounce
    if (freshnessFetchRef.current) clearTimeout(freshnessFetchRef.current);
    freshnessFetchRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
      ];
      onFreshnessFetch(bbox);
    }, 500);
  }, [displayResolution, onDotFetch, onFreshnessFetch]);

  const displayCoverage = useMemo(() => {
    if (!coverageGeoJSON) return null;
    return aggregateHexes(coverageGeoJSON.features, displayResolution);
  }, [coverageGeoJSON, displayResolution]);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    // Freshness hex click
    const freshnessFeature = e.features?.find((f) => f.layer.id === "freshness-fill");
    if (freshnessFeature) {
      setFreshnessPopup({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        properties: freshnessFeature.properties as unknown as FreshnessHexProperties,
      });
      setHoveredHex(null);
      onNodeSelect(null);
      setThirdPartyPopup(null);
      return;
    }

    const hexFeature = e.features?.find((f) => f.layer.id === "hex-fill");
    if (hexFeature) {
      setHoveredHex({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        properties: hexFeature.properties as unknown as HexProperties,
      });
      onNodeSelect(null);
      setFreshnessPopup(null);
      setThirdPartyPopup(null);
      return;
    }

    const nodeFeature = e.features?.find((f) => f.layer.id === "node-circles");
    if (nodeFeature) {
      const node = nodes.find((n) => n.id === nodeFeature.properties?.id);
      if (node) {
        onNodeSelect(node);
        setHoveredHex(null);
        setFreshnessPopup(null);
        setThirdPartyPopup(null);
      }
      return;
    }

    // Third-party click
    const map = mapRef.current?.getMap();
    if (map) {
      const point: [number, number] = [e.point.x, e.point.y];
      const tpLayerIds = map.getStyle().layers
        .map(l => l.id)
        .filter(id => id.startsWith("tp-dot-") || id.startsWith("tp-fill-"));
      if (tpLayerIds.length > 0) {
        const tpFeatures = map.queryRenderedFeatures(point, { layers: tpLayerIds });
        const dotHit = tpFeatures.find(f => f.layer.id.startsWith("tp-dot-"));
        if (dotHit) {
          const layerKey = dotHit.layer.id.replace("tp-dot-", "");
          setThirdPartyPopup({
            lng: e.lngLat.lng, lat: e.lngLat.lat, layerKey, type: 'dot',
            properties: dotHit.properties as Record<string, unknown>,
          });
          setHoveredHex(null);
          setFreshnessPopup(null);
          onNodeSelect(null);
          return;
        }
        const hexHit = tpFeatures.find(f => f.layer.id.startsWith("tp-fill-"));
        if (hexHit) {
          const layerKey = hexHit.layer.id.replace("tp-fill-", "");
          setThirdPartyPopup({
            lng: e.lngLat.lng, lat: e.lngLat.lat, layerKey, type: 'hex',
            properties: hexHit.properties as Record<string, unknown>,
          });
          setHoveredHex(null);
          setFreshnessPopup(null);
          onNodeSelect(null);
          return;
        }
      }
    }

    onNodeSelect(null);
    setHoveredHex(null);
    setFreshnessPopup(null);
    setThirdPartyPopup(null);
  };

  const interactiveLayerIds = [
    ...(layers.coverage && freshnessGeoJSON ? ["freshness-fill"] : []),
    ...(layers.coverage && !freshnessGeoJSON ? ["hex-fill"] : []),
    ...(layers.nodes ? ["node-circles"] : []),
    ...Object.entries(thirdPartyLayers)
      .filter(([, active]) => active)
      .map(([key]) => `tp-fill-${key}`),
    ...Object.entries(thirdPartyLayers)
      .filter(([key, active]) => active && THIRD_PARTY_LAYERS[key]?.hasDots)
      .map(([key]) => `tp-dot-${key}`),
  ];

  // Build freshness fill color expression
  const freshnessFillColor: any = [
    "match", ["get", "freshness_tier"],
    "stale_30d", FRESHNESS_COLORS.stale_30d.fill,
    "aging_7d", FRESHNESS_COLORS.aging_7d.fill,
    "baseline_24h", FRESHNESS_COLORS.baseline_24h.fill,
    "recent", FRESHNESS_COLORS.recent.fill,
    "saturated", FRESHNESS_COLORS.saturated.fill,
    "rgba(100, 116, 139, 0.1)", // default
  ];

  const freshnessStrokeColor: any = [
    "match", ["get", "freshness_tier"],
    "stale_30d", FRESHNESS_COLORS.stale_30d.stroke,
    "aging_7d", FRESHNESS_COLORS.aging_7d.stroke,
    "baseline_24h", FRESHNESS_COLORS.baseline_24h.stroke,
    "recent", FRESHNESS_COLORS.recent.stroke,
    "saturated", FRESHNESS_COLORS.saturated.stroke,
    "rgba(100, 116, 139, 0.3)",
  ];

  return (
    <Map
      ref={mapRef}
      mapStyle={mapStyle}
      onError={() => {
        if (!styleFailed && mapStyle === MAP_STYLES.primary) {
          console.warn("[Explorer] Primary tile style failed, falling back");
          setStyleFailed(true);
          setMapStyle(MAP_STYLES.fallback);
        }
      }}
      initialViewState={{ longitude: -92.5, latitude: 44.09, zoom: 3 }}
      interactiveLayerIds={interactiveLayerIds}
      onClick={handleMapClick}
      onMoveEnd={handleMoveEnd}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="bottom-right" />

      {/* Signal overlay */}
      {layers.heatmap && heatmapGeoJSON && heatmapGeoJSON.features.length > 0 && (
        <Source id="signal-overlay" type="geojson" data={heatmapGeoJSON}>
          {Object.entries(signalVisibility)
            .filter(([, visible]) => visible)
            .map(([type]) => (
              <Layer
                key={type}
                id={`signal-${type}`}
                type="circle"
                filter={["==", ["get", "signal_type"], type]}
                paint={{
                  "circle-color": SIGNAL_COLORS[type] || "#94A3B8",
                  "circle-radius": [
                    "interpolate", ["linear"], ["zoom"],
                    3, 1.5, 8, 3, 12, 5, 16, 8,
                  ],
                  "circle-opacity": 0.5,
                  "circle-blur": 0.4,
                  "circle-stroke-width": 0,
                }}
              />
            ))}
        </Source>
      )}

      {/* Third-party hex layers */}
      {Object.entries(thirdPartyLayers).map(([layerKey, active]) => {
        if (!active) return null;
        const geo = thirdPartyGeoJSON[layerKey];
        if (!geo?.features?.length) return null;
        const layerDef = THIRD_PARTY_LAYERS[layerKey];
        if (!layerDef) return null;
        const aggregated = aggregateHexes(geo.features, displayResolution);
        return (
          <Source key={layerKey} id={`tp-${layerKey}`} type="geojson" data={aggregated}>
            <Layer
              id={`tp-fill-${layerKey}`}
              type="fill"
              paint={{ 'fill-color': layerDef.fillColor, 'fill-opacity': 0.7 }}
            />
            <Layer
              id={`tp-outline-${layerKey}`}
              type="line"
              paint={{ 'line-color': layerDef.outlineColor, 'line-width': 1 }}
            />
          </Source>
        );
      })}

      {/* Third-party dot layers */}
      {Object.entries(thirdPartyLayers).map(([layerKey, active]) => {
        if (!active) return null;
        const layerDef = THIRD_PARTY_LAYERS[layerKey];
        if (!layerDef?.hasDots) return null;
        const geo = thirdPartyDotGeoJSON[layerKey];
        if (!geo?.features?.length) return null;
        return (
          <Source key={`dots-${layerKey}`} id={`tp-dots-${layerKey}`} type="geojson" data={geo}>
            <Layer
              id={`tp-dot-${layerKey}`}
              type="circle"
              paint={{
                'circle-color': layerDef.outlineColor,
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 10, 4, 14, 6],
                'circle-opacity': 0.85,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#0A0F1E',
              }}
            />
          </Source>
        );
      })}

      {/* Freshness hex layer — replaces default coverage coloring when available */}
      {layers.coverage && freshnessGeoJSON && freshnessGeoJSON.features.length > 0 && (
        <Source id="freshness" type="geojson" data={freshnessGeoJSON}>
          <Layer
            id="freshness-fill"
            type="fill"
            paint={{
              "fill-color": freshnessFillColor,
              "fill-opacity": 0.8,
            }}
          />
          <Layer
            id="freshness-outline"
            type="line"
            paint={{
              "line-color": freshnessStrokeColor,
              "line-width": 1,
            }}
          />
        </Source>
      )}

      {/* Fallback: observation-count coverage when freshness not loaded yet */}
      {layers.coverage && !freshnessGeoJSON && displayCoverage && (
        <Source id="coverage" type="geojson" data={displayCoverage}>
          <Layer
            id="hex-fill"
            type="fill"
            paint={{
              "fill-color": [
                "interpolate", ["linear"], ["get", "observation_count"],
                1, "rgba(245, 158, 11, 0.15)",
                100, "rgba(245, 158, 11, 0.4)",
                1000, "rgba(6, 182, 212, 0.5)",
                5000, "rgba(6, 182, 212, 0.7)",
              ],
              "fill-opacity": 0.7,
            }}
          />
          <Layer
            id="hex-outline"
            type="line"
            paint={{
              "line-color": "rgba(245, 158, 11, 0.6)",
              "line-width": 1,
            }}
          />
        </Source>
      )}

      {/* Node clusters */}
      {layers.nodes && nodeGeoJSON && (
        <Source
          id="nodes"
          type="geojson"
          data={nodeGeoJSON}
          cluster
          clusterMaxZoom={10}
          clusterRadius={50}
        >
          <Layer
            id="cluster-circles"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": "#F59E0B",
              "circle-opacity": 0.7,
              "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40],
            }}
          />
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-size": 13,
              "text-font": ["Noto Sans Bold"],
            }}
            paint={{ "text-color": "#0A0F1E" }}
          />
          <Layer
            id="node-circles"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": ["get", "color"],
              "circle-radius": 8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#0A0F1E",
              "circle-opacity": 0.9,
            }}
          />
        </Source>
      )}

      {/* Freshness hex popup */}
      {freshnessPopup && (
        <Popup
          latitude={freshnessPopup.lat}
          longitude={freshnessPopup.lng}
          onClose={() => setFreshnessPopup(null)}
          closeOnClick={false}
          className="explorer-popup"
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: FRESHNESS_COLORS[freshnessPopup.properties.freshness_tier]?.fill || '#64748B',
                }}
              />
              <span className="font-semibold text-slate-100 text-sm">
                Coverage Hex
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>
                Hex: <span className="text-slate-300 font-mono text-[10px]">
                  {freshnessPopup.properties.h3_index}
                </span>
              </p>
              <p>
                Last mapped: <span className="text-slate-100">
                  {formatRelativeTime(freshnessPopup.properties.last_observation)}
                </span>
              </p>
              <p>
                Reward multiplier: <span className="text-amber-400 font-semibold">
                  {freshnessPopup.properties.freshness_multiplier}x
                </span>
              </p>
              <p>
                Observations: <span className="text-cyan-400">
                  {freshnessPopup.properties.observation_count?.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
        </Popup>
      )}

      {/* Legacy hex popup (fallback before freshness loads) */}
      {hoveredHex && (
        <Popup
          latitude={hoveredHex.lat}
          longitude={hoveredHex.lng}
          onClose={() => setHoveredHex(null)}
          closeOnClick={false}
          className="explorer-popup"
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded bg-amber-500/50" />
              <span className="font-semibold text-slate-100 text-sm">
                Coverage Hex
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>
                Observations:{" "}
                <span className="text-cyan-400">
                  {hoveredHex.properties.observation_count?.toLocaleString()}
                </span>
              </p>
              <p>
                Signals:{" "}
                {Array.isArray(hoveredHex.properties.signal_types)
                  ? hoveredHex.properties.signal_types.join(", ")
                  : String(hoveredHex.properties.signal_types || "none")}
              </p>
              {hoveredHex.properties.avg_signal_strength != null && (
                <p>
                  Avg strength:{" "}
                  <span className="text-slate-100">
                    {hoveredHex.properties.avg_signal_strength} dBm
                  </span>
                </p>
              )}
              <p>Contributors: {hoveredHex.properties.contributor_count}</p>
            </div>
          </div>
        </Popup>
      )}

      {/* Node popup */}
      {selectedNode && selectedNode.latitude && selectedNode.longitude && (
        <Popup
          latitude={selectedNode.latitude}
          longitude={selectedNode.longitude}
          onClose={() => onNodeSelect(null)}
          closeOnClick={false}
          className="explorer-popup"
        >
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: TIER_COLORS[selectedNode.tier] }}
              />
              <span className="font-semibold text-slate-100 text-sm">
                {selectedNode.label || "Unnamed Node"}
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <p>{TIER_LABELS[selectedNode.tier] || selectedNode.tier}</p>
              <p>
                Status:{" "}
                <span
                  className={
                    selectedNode.status === "active"
                      ? "text-teal-400"
                      : "text-slate-500"
                  }
                >
                  {selectedNode.status}
                </span>
              </p>
              <p>
                Observations:{" "}
                {selectedNode.observation_count.toLocaleString()}
              </p>
              {selectedNode.signal_types && (
                <p>Signals: {selectedNode.signal_types.join(", ")}</p>
              )}
              {selectedNode.last_seen_at && (
                <p>
                  Last seen:{" "}
                  {new Date(selectedNode.last_seen_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </Popup>
      )}

      {/* Third-party popup */}
      {thirdPartyPopup && (
        <Popup
          latitude={thirdPartyPopup.lat}
          longitude={thirdPartyPopup.lng}
          onClose={() => setThirdPartyPopup(null)}
          closeOnClick={false}
          className="explorer-popup"
        >
          <div className="p-3 min-w-[180px]">
            {(() => {
              const layerDef = THIRD_PARTY_LAYERS[thirdPartyPopup.layerKey];
              if (!layerDef) return null;
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layerDef.outlineColor }}
                    />
                    <span className="font-semibold text-slate-100 text-sm">
                      {thirdPartyPopup.type === 'dot' ? layerDef.dotLabel : `${layerDef.label} Coverage`}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    {thirdPartyPopup.type === 'hex' && (
                      <p>
                        Observations:{" "}
                        <span className="text-slate-100">
                          {((thirdPartyPopup.properties.observation_count as number) ?? 0).toLocaleString()}
                        </span>
                      </p>
                    )}
                    {thirdPartyPopup.type === 'dot' && typeof thirdPartyPopup.properties.source_type === 'string' && (
                      <p>
                        Type:{" "}
                        <span className="text-slate-100">
                          {thirdPartyPopup.properties.source_type}
                        </span>
                      </p>
                    )}
                    {thirdPartyPopup.type === 'dot' && typeof thirdPartyPopup.properties.name === 'string' && (
                      <p>
                        Name:{" "}
                        <span className="text-slate-100">
                          {thirdPartyPopup.properties.name}
                        </span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">{layerDef.attribution}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </Popup>
      )}
    </Map>
  );
}
