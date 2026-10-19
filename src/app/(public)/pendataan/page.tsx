import type { Metadata } from "next";
import TempatKartu from "@/components/tempat/tempat-kartu.component";
import { laporanSorotan } from "@/services/laporan/hitung";
import { listLaporanTempat } from "@/services/laporan/laporan";
import { listTempat } from "@/services/tempat/tempat";

export const metadata: Metadata = { title: "Pendataan" };

// Direktori tempat konservasi; tiap tempat menautkan ke /pendataan/{tempat}
export default async function PendataanPublikPage() {
  const tempat = (await listTempat()).filter((t) => t.aktif);
  const laporan = await Promise.all(tempat.map((t) => listLaporanTempat(t.id)));

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Tempat Konservasi</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Hasil pendataan penyu dari tiap tempat konservasi. Pilih tempat untuk melihat dan mengunduh laporannya.
        </p>
      </div>

      {!tempat.length ? (
        <p className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          Belum ada tempat konservasi yang terdaftar.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tempat.map((t, i) => (
            <TempatKartu key={t.id} tempat={t} jumlahLaporan={laporan[i].length} sorotan={laporanSorotan(laporan[i])} />
          ))}
        </div>
      )}
    </section>
  );
}
