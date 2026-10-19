import Link from "next/link";
import type { Laporan } from "@/services/laporan/hitung";
import LaporanUnduh from "./laporan-unduh.component";

const tanggalTerbit = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });

// Daftar laporan terbit: judul (ke halaman detail), versi & tanggal, tombol unduh PDF/data.
// Dipakai halaman publik konservasi dan dashboard.
export default function LaporanDaftar({
  daftar,
  kosong = "Belum ada laporan yang diterbitkan.",
  tampilPenerbit = false,
}: {
  daftar: Laporan[];
  kosong?: string;
  tampilPenerbit?: boolean;
}) {
  if (!daftar.length) {
    return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{kosong}</p>;
  }

  return (
    <ul className="divide-y rounded-md border">
      {daftar.map((laporan) => (
        <li key={laporan.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link href={`/laporan/${laporan.id}`} className="font-medium underline-offset-4 hover:underline">
              {laporan.judul}
            </Link>
            <p className="text-xs text-muted-foreground">
              Versi {laporan.versi} · diterbitkan {tanggalTerbit(laporan.diterbitkanPada)}
              {tampilPenerbit && ` · ${laporan.diterbitkanOleh}`} · {laporan.isi.ringkasan.telurDiselamatkan} telur
              diselamatkan · {laporan.isi.ringkasan.tukikDilepas} tukik dilepas
            </p>
          </div>
          <LaporanUnduh laporan={laporan} size="sm" />
        </li>
      ))}
    </ul>
  );
}
