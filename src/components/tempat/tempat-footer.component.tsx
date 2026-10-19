import type { Device } from "@/services/device/device";
import type { Tempat } from "@/services/tempat/types";

// SEMENTARA: footer untuk halaman /{tempat}/..., nanti diganti desain final.
export default function TempatFooter({ tempat }: { tempat: Pick<Tempat, "nama">; device: Device }) {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Si Penyu · {tempat.nama}
      </div>
    </footer>
  );
}
