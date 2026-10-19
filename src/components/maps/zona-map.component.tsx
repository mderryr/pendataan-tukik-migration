"use client";

// Peta wilayah zona pantai (Leaflet + OpenStreetMap / citra satelit Esri, tanpa API key).
// Hanya jalan di browser — impor lewat next/dynamic dengan ssr: false.
import { useEffect, useMemo, useState } from "react";
import { cellToBoundary, polygonToCells } from "h3-js";
import { CircleMarker, LayersControl, Polygon, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/services/tempat/types";
import { ZONA_RESOLUSI } from "@/services/tempat/zona-h3";
import PetaLeaflet from "./peta-leaflet.component";

const ZOOM_GRID = 16; // grid heksagon baru ditampilkan mulai zoom ini (supaya tidak terlalu banyak sel)
const MAKS_GRID = 2500;

export interface ZonaPeta {
  id: string;
  nama: string;
  warna: string;
  sel: string[];
}

const batasSel = (sel: string) => cellToBoundary(sel) as [number, number][];

// Sel heksagon yang terlihat di layar
function GridViewport({ onGrid }: { onGrid: (sel: string[] | null) => void }) {
  const map = useMapEvents({
    moveend: () => hitung(),
    zoomend: () => hitung(),
  });

  function hitung() {
    if (map.getZoom() < ZOOM_GRID) return onGrid(null);
    const b = map.getBounds();
    const sel = polygonToCells(
      [
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getWest()],
        [b.getNorth(), b.getEast()],
        [b.getSouth(), b.getEast()],
      ],
      ZONA_RESOLUSI
    );
    onGrid(sel.length > MAKS_GRID ? null : sel);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => hitung(), []);
  return null;
}

export default function ZonaMap({
  pusat,
  zona,
  editId,
  draft,
  onToggle,
}: {
  pusat: LatLng; // lokasi tempat konservasi
  zona: ZonaPeta[];
  editId: string | null; // zona yang sedang diatur wilayahnya
  draft: Set<string>; // sel milik zona yang sedang diatur
  onToggle: (sel: string) => void;
}) {
  const [grid, setGrid] = useState<string[] | null>(null);

  // sel → zona pemiliknya (selain zona yang sedang diatur)
  const pemilik = useMemo(() => {
    const map = new Map<string, ZonaPeta>();
    zona.filter((z) => z.id !== editId).forEach((z) => z.sel.forEach((s) => map.set(s, z)));
    return map;
  }, [zona, editId]);
  const zonaEdit = zona.find((z) => z.id === editId) ?? null;

  // isolate: z-index Leaflet (400–1000) tidak menutupi header & dialog
  return (
    <div className="relative isolate h-full min-h-[420px] w-full">
      <PetaLeaflet
        center={[pusat.lat, pusat.lng]}
        zoom={17}
        options={{ maxZoom: 19, preferCanvas: true }}
        className="absolute inset-0 rounded-md"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satelit">
            <TileLayer
              attribution="Citra &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Peta">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <GridViewport onGrid={setGrid} />

        {/* Grid kosong yang bisa diklik (hanya saat mengatur wilayah) */}
        {editId &&
          grid
            ?.filter((s) => !draft.has(s) && !pemilik.has(s))
            .map((s) => (
              <Polygon
                key={`grid-${s}`}
                positions={batasSel(s)}
                pathOptions={{
                  color: "#ffffff",
                  weight: 0.6,
                  opacity: 0.6,
                  fillOpacity: 0.02,
                }}
                eventHandlers={{ click: () => onToggle(s) }}
              />
            ))}

        {/* Zona lain */}
        {zona
          .filter((z) => z.id !== editId)
          .flatMap((z) =>
            z.sel.map((s) => (
              <Polygon
                key={`${z.id}-${s}`}
                positions={batasSel(s)}
                pathOptions={{
                  color: z.warna,
                  weight: 0.8,
                  fillOpacity: editId ? 0.2 : 0.45,
                }}
              >
                <Tooltip sticky>{z.nama}</Tooltip>
              </Polygon>
            ))
          )}

        {/* Zona yang sedang diatur: klik untuk melepas sel */}
        {zonaEdit &&
          [...draft].map((s) => (
            <Polygon
              key={`edit-${s}`}
              positions={batasSel(s)}
              pathOptions={{
                color: zonaEdit.warna,
                weight: 1.5,
                fillOpacity: 0.6,
              }}
              eventHandlers={{ click: () => onToggle(s) }}
            />
          ))}

        <CircleMarker
          center={[pusat.lat, pusat.lng]}
          radius={6}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#0f172a",
            fillOpacity: 1,
          }}
        >
          <Tooltip>Lokasi tempat konservasi</Tooltip>
        </CircleMarker>
      </PetaLeaflet>
      {editId && !grid && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-background/90 px-3 py-1 text-xs shadow">
          Perbesar peta untuk memilih heksagon
        </p>
      )}
    </div>
  );
}
