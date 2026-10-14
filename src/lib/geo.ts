import type { LatLng } from "@/types";

const R = 6371000; // radius bumi (m)
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function haversine(a: LatLng, b: LatLng): number {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Titik baru dari `origin` sejauh `meters` ke arah `bearing` (derajat). */
export function offsetPoint(origin: LatLng, meters: number, bearing: number): LatLng {
  const d = meters / R;
  const br = rad(bearing);
  const lat1 = rad(origin[0]);
  const lng1 = rad(origin[1]);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(br));
  const lng2 =
    lng1 + Math.atan2(Math.sin(br) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return [deg(lat2), deg(lng2)];
}

/** Jarak kumulatif (m) di tiap titik polyline. */
export function buildCumulative(path: LatLng[]): number[] {
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + haversine(path[i - 1], path[i]));
  return cum;
}

/** Posisi pada polyline setelah menempuh `dist` meter (interpolasi linear). */
export function pointAtDistance(path: LatLng[], cum: number[], dist: number): { position: LatLng; index: number } {
  const total = cum[cum.length - 1];
  if (dist <= 0) return { position: path[0], index: 0 };
  if (dist >= total) return { position: path[path.length - 1], index: path.length - 1 };

  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= dist) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo] || 1;
  const t = (dist - cum[lo]) / seg;
  return {
    position: [path[lo][0] + (path[hi][0] - path[lo][0]) * t, path[lo][1] + (path[hi][1] - path[lo][1]) * t],
    index: lo,
  };
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(m < 10000 ? 2 : 1)} km`;
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s} dtk`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} mnt`;
  return `${Math.floor(m / 60)} j ${m % 60} mnt`;
}
