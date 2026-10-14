# Live Tracking Driver

Vite + React (TSX) · Leaflet · OpenStreetMap · shadcn/ui · Tailwind CSS

## Jalankan
```bash
npm install
npm run dev
```
Buka URL yang tampil (mis. http://localhost:5173) dan izinkan akses lokasi. Jika ditolak, aplikasi memakai Surabaya sebagai titik awal; klik peta untuk memindahkan titik jemput.

## Cara kerja
| Bagian | File |
| --- | --- |
| Posisi pengguna real-time (`watchPosition`, filter jitter 30 m) | `src/hooks/useGeolocation.ts` |
| Rute jalan asli dari OSRM (data OSM) | `src/hooks/useRoute.ts` |
| Simulasi gerak driver sepanjang rute + sisa jarak/ETA | `src/hooks/useDriverSimulation.ts` |
| Peta Leaflet, marker, polyline | `src/components/MapView.tsx` |
| Panel info (shadcn Card/Button/Badge) | `src/components/InfoPanel.tsx` |
| Haversine, interpolasi, format jarak/waktu | `src/lib/geo.ts` |

Jarak & waktu tempuh diambil dari respons OSRM, lalu sisa jarak dihitung dari titik polyline yang belum dilewati driver. ETA = sisa jarak ÷ kecepatan rata-rata rute.

## Ganti simulasi dengan driver sungguhan
Di `useDriverSimulation.ts`, ganti loop `requestAnimationFrame` dengan data dari WebSocket / Supabase Realtime / Firebase, lalu perbarui posisi driver dari sana.

## Catatan produksi
- `router.project-osrm.org` dan tile `tile.openstreetmap.org` adalah server publik dengan batas pemakaian wajar. Untuk trafik nyata, gunakan OSRM/Valhalla sendiri dan penyedia tile sendiri (lihat OSM tile usage policy).
- Geolocation hanya jalan di HTTPS atau `localhost`.
