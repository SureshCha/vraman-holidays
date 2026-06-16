"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

interface RoutePoint {
  dayNumber: number;
  title: string;
  latitude: number;
  longitude: number;
  elevation?: number | null;
}

interface RouteMapProps {
  points: RoutePoint[];
  packageTitle?: string;
}

export function RouteMap({ points, packageTitle }: RouteMapProps) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    Polyline: typeof import("react-leaflet").Polyline;
  } | null>(null);

  // Dynamically import Leaflet + react-leaflet (client-only, avoids SSR issues)
  useEffect(() => {
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
      import("leaflet/dist/leaflet.css"),
    ]).then(([rl, L]) => {
      // Fix default marker icon (Leaflet + webpack issue)
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapComponents({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        Popup: rl.Popup,
        Polyline: rl.Polyline,
      });
    });
  }, []);

  // Need at least 2 points for a route
  if (points.length < 2) return null;

  const positions: [number, number][] = points.map((p) => [p.latitude, p.longitude]);

  // Calculate bounds for auto-fit
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats) - 0.02, Math.min(...lngs) - 0.02],
    [Math.max(...lats) + 0.02, Math.max(...lngs) + 0.02],
  ];

  if (!MapComponents) {
    // Loading skeleton
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Route Map
        </h2>
        <div className="h-[400px] sm:h-[500px] rounded-2xl bg-muted animate-pulse" />
      </section>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Polyline } = MapComponents;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Route Map
      </h2>
      <div className="rounded-2xl overflow-hidden border shadow-sm">
        <MapContainer
          bounds={bounds}
          scrollWheelZoom={false}
          style={{ height: "500px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route line */}
          <Polyline
            positions={positions}
            pathOptions={{ color: "#0ea5e9", weight: 3, opacity: 0.8, dashArray: "8 4" }}
          />

          {/* Day markers */}
          {points.map((point) => (
            <Marker key={point.dayNumber} position={[point.latitude, point.longitude]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Day {point.dayNumber}</p>
                  <p>{point.title}</p>
                  {point.elevation && (
                    <p className="text-muted-foreground mt-1">
                      📍 {point.elevation.toLocaleString()}m elevation
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {packageTitle && (
        <p className="text-xs text-muted-foreground text-center">
          Route overview for {packageTitle} · {points.length} stops · Click markers for details
        </p>
      )}
    </section>
  );
}
