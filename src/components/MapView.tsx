import { useEffect, useMemo } from "react";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Car } from "lucide-react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import type { LatLng, RouteData } from "@/types";

const userIcon = L.divIcon({ className: "", html: '<div class="marker-user"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
const driverIcon = L.divIcon({
  className: "",
  html: `<div class="marker-driver">${renderToStaticMarkup(
    <Car size={20} strokeWidth={2.4} color="#1e293b" />,
  )}</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

function FitRoute({ route }: { route: RouteData | null }) {
  const map = useMap();
  useEffect(() => {
    if (!route) return;
    const desktop = window.innerWidth >= 768;
    map.fitBounds(L.latLngBounds(route.path), {
      paddingTopLeft: desktop ? [400, 40] : [30, 40],
      paddingBottomRight: desktop ? [40, 40] : [30, 300],
      animate: true,
    });
  }, [route, map]);
  return null;
}

function FollowDriver({ position, enabled }: { position: LatLng | null; enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (enabled && position) map.panTo(position, { animate: true, duration: 0.25, easeLinearity: 1 });
  }, [enabled, position, map]);
  return null;
}

function ClickToSetLocation({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

interface Props {
  user: LatLng;
  driver: LatLng | null;
  route: RouteData | null;
  /** indeks titik rute terakhir yang sudah dilewati driver */
  driverIndex: number;
  follow: boolean;
  onPickLocation: (p: LatLng) => void;
}

export default function MapView({ user, driver, route, driverIndex, follow, onPickLocation }: Props) {
  const { done, left } = useMemo(() => {
    if (!route) return { done: [] as LatLng[], left: [] as LatLng[] };
    const cut = driver ? [driver] : [];
    return {
      done: [...route.path.slice(0, driverIndex + 1), ...cut],
      left: [...cut, ...route.path.slice(driverIndex + 1)],
    };
  }, [route, driver, driverIndex]);

  return (
    <MapContainer center={user} zoom={15} zoomControl={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {route && (
        <>
          <Polyline positions={done} pathOptions={{ color: "#94a3b8", weight: 5, opacity: 0.9, dashArray: "2 9", lineCap: "round" }} />
          <Polyline positions={left} pathOptions={{ color: "#ffffff", weight: 10, opacity: 0.95 }} />
          <Polyline positions={left} pathOptions={{ color: "#0e7490", weight: 5, opacity: 1 }} />
        </>
      )}

      <Marker position={user} icon={userIcon}>
        <Tooltip direction="top" offset={[0, -8]}>Kamu</Tooltip>
      </Marker>
      {driver && (
        <Marker position={driver} icon={driverIcon} zIndexOffset={1000}>
          <Tooltip direction="top" offset={[0, -16]}>Driver</Tooltip>
        </Marker>
      )}

      <FitRoute route={route} />
      <FollowDriver position={driver} enabled={follow} />
      <ClickToSetLocation onPick={onPickLocation} />
    </MapContainer>
  );
}