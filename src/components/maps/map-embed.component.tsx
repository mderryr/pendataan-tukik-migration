import type { LatLng } from "@/services/tempat/types";

export const googleMapsUrl = ({ lat, lng }: LatLng) => `https://www.google.com/maps?q=${lat},${lng}`;

// Pratinjau peta tanpa API key (hanya tampilan, tidak bisa diklik untuk memilih titik).
export default function MapEmbed({ lokasi, className = "h-56" }: { lokasi: LatLng; className?: string }) {
  return (
    <iframe
      title="Lokasi di peta"
      src={`https://maps.google.com/maps?q=${lokasi.lat},${lokasi.lng}&z=15&output=embed`}
      className={`w-full rounded-md border ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
