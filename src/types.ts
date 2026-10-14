export type LatLng = [number, number]; // [lat, lng]

export interface RouteData {
  path: LatLng[];
  /** meter */
  distance: number;
  /** detik */
  duration: number;
}
