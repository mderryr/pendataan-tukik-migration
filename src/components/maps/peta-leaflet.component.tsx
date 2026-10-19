"use client";

// Pengganti <MapContainer> react-leaflet v4 yang aman untuk StrictMode.
// App Router menjalankan React 19 (bawaan Next), yang memanggil ref callback dua kali di dev;
// MapContainer v4 lalu membuat peta kedua di elemen yang sama → "Map container is already initialized".
// Di sini peta dibuat di useEffect dan dihapus saat cleanup, jadi aman dipasang-lepas berulang kali.
// Hanya jalan di browser — impor lewat next/dynamic dengan ssr: false.
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createLeafletContext, LeafletProvider, type LeafletContextInterface } from "@react-leaflet/core";
import { Map as LeafletMap, Util, type MapOptions } from "leaflet";

export default function PetaLeaflet({
  center,
  zoom,
  options,
  className,
  children,
}: {
  center: [number, number];
  zoom: number;
  options?: MapOptions; // hanya dibaca saat peta dibuat
  className?: string;
  children?: ReactNode; // komponen react-leaflet: TileLayer, Polygon, useMapEvents, dst.
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [context, setContext] = useState<LeafletContextInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = new LeafletMap(ref.current, options).setView(center, zoom);
    setContext(createLeafletContext(map));
    return () => {
      setContext(null);
      map.remove();
    };
    // Peta dibuat sekali; pindah posisi dilakukan lewat instance map (useMap), bukan lewat props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {/* key = ID peta: komponen anak ikut dibuat ulang saat petanya dibuat ulang */}
      {context && (
        <LeafletProvider key={Util.stamp(context.map)} value={context}>
          {children}
        </LeafletProvider>
      )}
    </div>
  );
}
