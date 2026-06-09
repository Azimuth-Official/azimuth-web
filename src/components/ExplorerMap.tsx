"use client";

import { useState, useRef } from "react";
import Map, {
  Source,
  Layer,
  Popup,
  NavigationControl,
} from "react-map-gl/maplibre";
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre";
import { TIER_COLORS, TIER_LABELS, SIGNAL_COLORS } from "@/lib/explorer-constants";

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

interface ExplorerMapProps {
  nodeGeoJSON: GeoJSON.FeatureCollection | null;
  coverageGeoJSON: GeoJSON.FeatureCollection | null;
  nodes: ExplorerNode[];
  selectedNode: ExplorerNode | null;
  onNodeSelect: (node: ExplorerNode | null) => void;
  layers: { coverage: boolean; nodes: boolean; heatmap: boolean };
  heatmapGeoJSON: GeoJSON.FeatureCollection | null;
  signalVisibility: Record<string, boolean>;
}

export default function ExplorerMap({
  nodeGeoJSON,
  coverageGeoJSON,
  nodes,
  selectedNode,
  onNodeSelect,
  layers,
  heatmapGeoJSON,
  signalVisibility,
}: ExplorerMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapStyle, setMapStyle] = useState(MAP_STYLES.primary);
  const [styleFailed, setStyleFailed] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<{
    lng: number;
    lat: number;
    properties: HexProperties;
  } | null>(null);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    const hexFeature = e.features?.find((f) => f.layer.id === "hex-fill");
    if (hexFeature) {
      setHoveredHex({
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        properties: hexFeature.properties as unknown as HexProperties,
      });
      onNodeSelect(null);
      return;
    }

    const nodeFeature = e.features?.find((f) => f.layer.id === "node-circles");
    if (nodeFeature) {
      const node = nodes.find((n) => n.id === nodeFeature.properties?.id);
      if (node) {
        onNodeSelect(node);
        setHoveredHex(null);
      }
      return;
    }

    onNodeSelect(null);
    setHoveredHex(null);
  };

  const interactiveLayerIds = [
    ...(layers.coverage ? ["hex-fill"] : []),
    ...(layers.nodes ? ["node-circles"] : []),
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
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="bottom-right" />


      {/* Signal overlay — rendered first (below hexes and nodes) */}
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
                    3, 1.5,
                    8, 3,
                    12, 5,
                    16, 8,
                  ],
                  "circle-opacity": 0.5,
                  "circle-blur": 0.4,
                  "circle-stroke-width": 0,
                }}
              />
            ))}
        </Source>
      )}

      {/* Hex coverage — rendered first (below nodes) */}
      {layers.coverage && coverageGeoJSON && (
        <Source id="coverage" type="geojson" data={coverageGeoJSON}>
          <Layer
            id="hex-fill"
            type="fill"
            paint={{
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "observation_count"],
                1,
                "rgba(245, 158, 11, 0.15)",
                100,
                "rgba(245, 158, 11, 0.4)",
                1000,
                "rgba(6, 182, 212, 0.5)",
                5000,
                "rgba(6, 182, 212, 0.7)",
              ],
              "fill-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                8, 0,
                11, 0.7,
              ],
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

      {/* Node clusters — rendered after hex (on top) */}
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
              "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                10,
                30,
                50,
                40,
              ],
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

      {/* Hex popup */}
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
    </Map>
  );
}
