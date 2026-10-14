import { Crosshair, LocateFixed, Navigation, Pause, Play, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeoStatus } from "@/hooks/useGeolocation";
import { formatDistance, formatDuration } from "@/lib/geo";
import { cn } from "@/lib/utils";

export const SPEEDS = [1, 5, 10, 25] as const;

interface Props {
  routeLoading: boolean;
  routeError: string | null;
  hasRoute: boolean;
  arrived: boolean;
  running: boolean;
  remainingDistance: number;
  remainingDuration: number;
  totalDistance: number;
  geoStatus: GeoStatus;
  geoError: string | null;
  multiplier: number;
  follow: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onMultiplier: (m: number) => void;
  onToggleFollow: () => void;
  onUseGps: () => void;
}

const geoLabel: Record<GeoStatus, string> = {
  loading: "Mencari lokasi…",
  gps: "Lokasi dari GPS",
  manual: "Lokasi dipilih di peta",
  fallback: "Lokasi bawaan (Surabaya)",
};

export default function InfoPanel(p: Props) {
  const eta = new Date(Date.now() + p.remainingDuration * 1000);
  const progress = p.totalDistance > 0 ? 1 - p.remainingDistance / p.totalDistance : 0;

  const badge = p.routeLoading ? (
    <Badge variant="outline">Menghitung rute…</Badge>
  ) : p.routeError ? (
    <Badge variant="destructive">Rute gagal</Badge>
  ) : p.arrived ? (
    <Badge variant="success">Driver sudah tiba</Badge>
  ) : p.running ? (
    <Badge variant="accent">Menuju lokasimu</Badge>
  ) : (
    <Badge variant="outline">Dijeda</Badge>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:inset-y-0 md:right-auto md:w-[380px] md:p-4">
      <Card className="pointer-events-auto md:max-h-full md:overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Driver kamu</CardTitle>
            {badge}
          </div>
          <CardDescription>
            {p.routeError ?? (p.arrived ? "Driver sudah sampai di titik jemput." : "Posisi driver diperbarui langsung di peta.")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Sisa jarak" value={p.hasRoute ? formatDistance(p.remainingDistance) : "–"} />
            <Stat label="Sisa waktu" value={p.hasRoute ? formatDuration(p.remainingDuration) : "–"} />
            <Stat
              label="Tiba pukul"
              value={p.hasRoute ? eta.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "–"}
            />
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={p.onToggleRun} disabled={!p.hasRoute || p.arrived}>
              {p.running ? <Pause /> : <Play />}
              {p.running ? "Jeda" : "Lanjut"}
            </Button>
            <Button variant="outline" onClick={p.onReset} aria-label="Mulai ulang dengan driver baru">
              <RotateCcw />
              Driver baru
            </Button>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Kecepatan simulasi</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SPEEDS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={p.multiplier === s ? "default" : "secondary"}
                  onClick={() => p.onMultiplier(s)}
                  aria-pressed={p.multiplier === s}
                  className="font-mono"
                >
                  {s}×
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button size="sm" variant={p.follow ? "default" : "outline"} onClick={p.onToggleFollow} aria-pressed={p.follow}>
              <Navigation /> Ikuti driver
            </Button>
            <Button size="sm" variant="outline" onClick={p.onUseGps}>
              <LocateFixed /> Pakai GPS
            </Button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Crosshair className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {geoLabel[p.geoStatus]}
              {p.geoError ? ` — ${p.geoError}` : ""}. Klik peta untuk memindahkan titik jemput.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary px-2.5 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-base font-bold leading-tight tabular-nums")}>{value}</p>
    </div>
  );
}
