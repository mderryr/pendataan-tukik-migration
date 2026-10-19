import Link from "next/link";
import { DEVICE_LABEL, type Device } from "@/services/device/device";
import type { Tempat } from "@/services/tempat/types";

// SEMENTARA: navbar untuk halaman /{tempat}/..., nanti diganti desain final.
// `device` dari proxy (android / ios / desktop) untuk memilih tampilan per perangkat.
export default function TempatNavbar({ tempat, device }: { tempat: Pick<Tempat, "id" | "nama">; device: Device }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link href={`/${tempat.id}/dashboard`} className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sipenyu.png" alt="Si Penyu" width={28} height={28} />
          <span className="truncate font-semibold">{tempat.nama}</span>
        </Link>
        <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {DEVICE_LABEL[device]}
        </span>
      </div>
    </header>
  );
}
