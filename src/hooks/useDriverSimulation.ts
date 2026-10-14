import { useEffect, useMemo, useRef, useState } from "react";
import { buildCumulative, pointAtDistance } from "@/lib/geo";
import type { LatLng, RouteData } from "@/types";

/**
 * Menggerakkan driver di sepanjang polyline rute.
 * Kecepatan dasar = jarak/durasi rute dari OSRM, dikali `multiplier` supaya demo tidak menunggu lama.
 *
 * Untuk produksi: ganti `requestAnimationFrame` di bawah dengan data lokasi nyata
 * (WebSocket / Supabase Realtime / Firebase) lalu panggil `setPosition` dari sana.
 */
export function useDriverSimulation(route: RouteData | null, multiplier: number, running: boolean) {
  const [traveled, setTraveled] = useState(0);
  const positionRef = useRef<LatLng | null>(null);

  const cum = useMemo(() => (route ? buildCumulative(route.path) : []), [route]);
  const total = cum.length ? cum[cum.length - 1] : 0;
  const baseSpeed = route && route.duration > 0 ? route.distance / route.duration : 8; // m/s

  // Reset saat rute baru masuk
  useEffect(() => {
    setTraveled(0);
  }, [route]);

  // Loop animasi
  useEffect(() => {
    if (!route || !running || total === 0) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTraveled((d) => Math.min(total, d + baseSpeed * multiplier * dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route, running, total, baseSpeed, multiplier]);

  const current = useMemo(() => (route ? pointAtDistance(route.path, cum, traveled) : null), [route, cum, traveled]);
  if (current) positionRef.current = current.position;

  const remaining = Math.max(0, total - traveled);
  const arrived = !!route && remaining < 15;

  return {
    position: current?.position ?? null,
    index: current?.index ?? 0,
    remainingDistance: remaining,
    remainingDuration: baseSpeed > 0 ? remaining / baseSpeed : 0,
    arrived,
    /** posisi terakhir driver (dipakai sebagai titik awal saat rute dihitung ulang) */
    positionRef,
  };
}
