import { useCallback, useEffect, useRef, useState } from "react";
import { haversine } from "@/lib/geo";
import type { LatLng } from "@/types";

export const DEFAULT_CENTER: LatLng = [-7.2654, 112.7425];

export type GeoStatus = "loading" | "gps" | "manual" | "fallback";

export function useGeolocation(minMoveMeters = 30) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<GeoStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const manualRef = useRef(false);
  const lastRef = useRef<LatLng | null>(null);
  const [gpsNonce, setGpsNonce] = useState(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Browser tidak mendukung geolocation.");
      setPosition(DEFAULT_CENTER);
      setStatus("fallback");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (manualRef.current) return;
        const next: LatLng = [p.coords.latitude, p.coords.longitude];
        if (lastRef.current && haversine(lastRef.current, next) < minMoveMeters) return;
        lastRef.current = next;
        setPosition(next);
        setStatus("gps");
        setError(null);
      },
      (e) => {
        if (manualRef.current) return;
        setError(e.code === e.PERMISSION_DENIED ? "Izin lokasi ditolak." : "Lokasi tidak tersedia.");
        setPosition((prev) => prev ?? DEFAULT_CENTER);
        setStatus((s) => (s === "gps" ? s : "fallback"));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [minMoveMeters, gpsNonce]);

  const setManual = useCallback((p: LatLng) => {
    manualRef.current = true;
    lastRef.current = p;
    setPosition(p);
    setStatus("manual");
  }, []);

  const useGps = useCallback(() => {
    manualRef.current = false;
    lastRef.current = null;
    setStatus("loading");
    setGpsNonce((n) => n + 1);
  }, []);

  return { position, status, error, setManual, useGps };
}
