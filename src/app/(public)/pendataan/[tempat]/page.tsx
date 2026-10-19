import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone } from "lucide-react";
import LaporanDaftar from "@/components/laporan/laporan-daftar.component";
import LaporanRingkasan from "@/components/laporan/laporan-ringkasan";
import MapEmbed, { googleMapsUrl } from "@/components/maps/map-embed.component";
import { Button } from "@/components/ui/button";
import { kelompokkanLaporan, laporanSorotan, namaPeriode } from "@/services/laporan/hitung";
import { listLaporanTempat } from "@/services/laporan/laporan";
import { getTempat } from "@/services/tempat/tempat";

type Props = { params: Promise<{ tempat: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tempat = await getTempat((await params).tempat);
  return { title: tempat?.nama ?? "Tempat Konservasi", description: tempat?.keterangan || undefined };
}

// Halaman publik satu tempat konservasi: profil, angka terbaru, laporan yang bisa diunduh
export default async function KonservasiPublikPage({ params }: Props) {
  const { tempat: tempatId } = await params;
  const [tempat, daftar] = await Promise.all([getTempat(tempatId), listLaporanTempat(tempatId)]);
  if (!tempat || !tempat.aktif) notFound();

  const sorotan = laporanSorotan(daftar);
  const { tahunan, bulananPerTahun } = kelompokkanLaporan(daftar);

  return (
    <section className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-3" asChild>
          <Link href="/pendataan">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Semua tempat konservasi
          </Link>
        </Button>
        <div className="grid gap-6 md:grid-cols-5">
          <div className="space-y-3 md:col-span-3">
            <h1 className="text-2xl font-bold md:text-3xl">{tempat.nama}</h1>
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-1 size-4 shrink-0" />
              {tempat.alamat}, {tempat.kabupaten}, {tempat.provinsi}
            </p>
            {tempat.kontak && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                {tempat.kontak}
              </p>
            )}
            {tempat.keterangan && <p>{tempat.keterangan}</p>}
            <a
              href={googleMapsUrl(tempat.lokasi)}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm underline underline-offset-4"
            >
              Buka di Google Maps
            </a>
          </div>
          <div className="md:col-span-2">
            <MapEmbed lokasi={tempat.lokasi} className="h-56" />
          </div>
        </div>
      </div>

      {sorotan && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Angka Terbaru</h2>
            <p className="text-sm text-muted-foreground">
              Dari {sorotan.judul.toLowerCase()} ({namaPeriode(sorotan.periode)}).
            </p>
          </div>
          <LaporanRingkasan isi={sorotan.isi} />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Laporan</h2>
          <p className="text-sm text-muted-foreground">
            Unduh laporan sebagai PDF, atau datanya (JSON) untuk diolah sendiri.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Laporan Tahunan</h3>
          <LaporanDaftar daftar={tahunan} kosong="Belum ada laporan tahunan." />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Laporan Bulanan</h3>
          {!bulananPerTahun.length && <LaporanDaftar daftar={[]} kosong="Belum ada laporan bulanan." />}
          {bulananPerTahun.map(({ tahun, laporan }) => (
            <div key={tahun} className="space-y-2">
              <p className="text-sm text-muted-foreground">{tahun}</p>
              <LaporanDaftar daftar={laporan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
