import { useEffect, useState } from "react";
import type { LatLng, RouteData } from "@/types";

const OSRM = "https://router.project-osrm.org/route/v1/driving";

/**
 * Rute jalan asli dari OSRM (data OpenStreetMap).
 * NB: server demo OSRM hanya untuk pengembangan. Untuk produksi gunakan instance sendiri / penyedia berbayar.
 */
export function useRoute(from: LatLng | null, to: LatLng | null) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = from && to ? `${from[0]},${from[1]}|${to[0]},${to[1]}` : null;

  useEffect(() => {
    if (!from || !to) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    const url = `${OSRM}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`OSRM ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const r = data.routes?.[0];
        if (!r) throw new Error("Rute tidak ditemukan.");
        setRoute({
          path: (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng] as LatLng),
          distance: r.distance,
          duration: r.duration,
        });
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setRoute(null);
        setError(e instanceof Error ? e.message : "Gagal mengambil rute.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { route, loading, error };
}
