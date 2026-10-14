import { useCallback, useEffect, useState } from "react";
import InfoPanel from "@/components/InfoPanel";
import MapView from "@/components/MapView";
import { useDriverSimulation } from "@/hooks/useDriverSimulation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useRoute } from "@/hooks/useRoute";
import { offsetPoint } from "@/lib/geo";
import type { LatLng } from "@/types";

const randomDriverStart = (user: LatLng): LatLng =>
  offsetPoint(user, 1500 + Math.random() * 2000, Math.random() * 360);

export default function App() {
  const geo = useGeolocation();
  const user = geo.position;

  const [driverOrigin, setDriverOrigin] = useState<LatLng | null>(null);
  const [multiplier, setMultiplier] = useState(10);
  const [running, setRunning] = useState(true);
  const [follow, setFollow] = useState(false);

  // Rute driver → posisi pengguna (jalan asli dari OSM via OSRM)
  const { route, loading, error } = useRoute(driverOrigin, user);
  const sim = useDriverSimulation(route, multiplier, running);

  // Saat posisi pengguna berubah: driver melanjutkan dari posisinya sekarang (atau spawn baru di awal)
  useEffect(() => {
    if (!user) return;
    setDriverOrigin(sim.positionRef.current ?? randomDriverStart(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const reset = useCallback(() => {
    if (!user) return;
    sim.positionRef.current = null;
    setRunning(true);
    setDriverOrigin(randomDriverStart(user));
  }, [user, sim.positionRef]);

  if (!user) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">
        Mencari lokasimu…
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapView
        user={user}
        driver={sim.position}
        route={route}
        driverIndex={sim.index}
        follow={follow}
        onPickLocation={geo.setManual}
      />
      <InfoPanel
        routeLoading={loading}
        routeError={error}
        hasRoute={!!route}
        arrived={sim.arrived}
        running={running && !sim.arrived}
        remainingDistance={sim.remainingDistance}
        remainingDuration={sim.remainingDuration}
        totalDistance={route?.distance ?? 0}
        geoStatus={geo.status}
        geoError={geo.error}
        multiplier={multiplier}
        follow={follow}
        onToggleRun={() => setRunning((r) => !r)}
        onReset={reset}
        onMultiplier={setMultiplier}
        onToggleFollow={() => setFollow((f) => !f)}
        onUseGps={geo.useGps}
      />
    </div>
  );
}
