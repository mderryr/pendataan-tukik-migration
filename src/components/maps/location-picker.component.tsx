/// <reference types="google.maps" />
"use client";

import { useEffect, useRef, useState } from "react";
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LatLng } from "@/services/tempat/types";
import MapEmbed, { googleMapsUrl } from "./map-embed.component";

// Tanpa API key, peta tidak bisa diklik: titik dipilih lewat GPS atau menempel koordinat
// dari Google Maps, lalu ditampilkan sebagai pratinjau.
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const INDONESIA = { lat: -2.5, lng: 118 };

const round = (value: number) => Math.round(value * 1e6) / 1e6;
const toLatLng = (lat: number, lng: number): LatLng => ({ lat: round(lat), lng: round(lng) });

// Menerima format "-8.302700, 111.469700" (hasil salin dari Google Maps)
function parseKoordinat(text: string): LatLng | null {
  const match = text.trim().match(/^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const [lat, lng] = [Number(match[1]), Number(match[2])];
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return toLatLng(lat, lng);
}

function InteractiveMap({ value, onChange }: { value: LatLng | undefined; onChange: (value: LatLng) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map>();
  const markerRef = useRef<google.maps.Marker>();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Peta dibuat sekali; perubahan titik ditangani effect di bawahnya
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new google.maps.Map(containerRef.current, {
      center: value ?? INDONESIA,
      zoom: value ? 15 : 5,
      streetViewControl: false,
      mapTypeControl: false,
    });
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (event.latLng) onChangeRef.current(toLatLng(event.latLng.lat(), event.latLng.lng()));
    });
    mapRef.current = map;
  }, [value]);

  useEffect(() => {
    if (!value || !mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({ map: mapRef.current, draggable: true });
      markerRef.current.addListener("dragend", (event: google.maps.MapMouseEvent) => {
        if (event.latLng) onChangeRef.current(toLatLng(event.latLng.lat(), event.latLng.lng()));
      });
    }
    markerRef.current.setPosition(value);
    mapRef.current.panTo(value);
  }, [value]);

  return <div ref={containerRef} className="h-64 w-full rounded-md border" />;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | undefined;
  onChange: (value: LatLng) => void;
}) {
  const [koordinat, setKoordinat] = useState(value ? `${value.lat}, ${value.lng}` : "");
  const [pesan, setPesan] = useState<string | null>(null);
  const [mencari, setMencari] = useState(false);

  // Sinkron dari peta/GPS, tapi jangan menimpa teks yang sedang diketik kalau artinya sama
  useEffect(() => {
    if (!value) return;
    setKoordinat((current) => {
      const parsed = parseKoordinat(current);
      return parsed?.lat === value.lat && parsed?.lng === value.lng ? current : `${value.lat}, ${value.lng}`;
    });
  }, [value]);

  const pakaiLokasiSaya = () => {
    if (!navigator.geolocation) return setPesan("Perangkat ini tidak mendukung GPS");
    setMencari(true);
    setPesan(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(toLatLng(pos.coords.latitude, pos.coords.longitude));
        setMencari(false);
      },
      () => {
        setPesan("Lokasi tidak bisa dibaca. Pastikan izin lokasi aktif.");
        setMencari(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const onKoordinatChange = (text: string) => {
    setKoordinat(text);
    const parsed = parseKoordinat(text);
    setPesan(text && !parsed ? "Format: -8.302700, 111.469700" : null);
    if (parsed) onChange(parsed);
  };

  return (
    <div className="space-y-2">
      {MAPS_API_KEY ? (
        <Wrapper
          apiKey={MAPS_API_KEY}
          render={(status) =>
            status === Status.FAILURE ? (
              <p className="text-sm text-destructive">Peta gagal dimuat</p>
            ) : (
              <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
            )
          }
        >
          <InteractiveMap value={value} onChange={onChange} />
        </Wrapper>
      ) : (
        value && <MapEmbed lokasi={value} />
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={koordinat}
          onChange={(e) => onKoordinatChange(e.target.value)}
          placeholder="Tempel koordinat, mis. -8.3027, 111.4697"
          inputMode="decimal"
        />
        <Button type="button" variant="outline" onClick={pakaiLokasiSaya} disabled={mencari} className="shrink-0">
          {mencari ? "Mencari..." : "Pakai lokasi saya"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {MAPS_API_KEY
          ? "Klik peta untuk menandai lokasi, titik bisa digeser."
          : "Di Google Maps: klik kanan pada lokasi → klik koordinat untuk menyalin, lalu tempel di sini."}
        {value && (
          <>
            {" "}
            <a href={googleMapsUrl(value)} target="_blank" rel="noreferrer" className="underline">
              Cek di Google Maps
            </a>
          </>
        )}
      </p>
      {pesan && <p className="text-sm text-destructive">{pesan}</p>}
    </div>
  );
}
