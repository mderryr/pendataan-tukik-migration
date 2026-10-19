import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { listLaporanTerbaru } from "@/services/laporan/laporan";

export const metadata: Metadata = { title: "Laporan" };

const tanggalTerbit = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" });

// Laporan bulanan & tahunan yang diterbitkan tempat konservasi
export default async function LaporanPublikPage() {
  const daftar = await listLaporanTerbaru();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Daftar Laporan</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Laporan bulanan dan tahunan pendataan penyu dari tempat-tempat konservasi. Bisa diunduh sebagai PDF atau
          JSON.
        </p>
      </div>

      {!daftar.length ? (
        <p className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          Belum ada laporan yang diterbitkan.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {daftar.map((laporan) => (
            <Card key={laporan.id} className="flex h-full flex-col transition-shadow hover:shadow-lg">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  {laporan.periode.jenis === "bulanan" ? "Bulanan" : "Tahunan"}
                </Badge>
                <CardTitle className="line-clamp-2 text-lg">{laporan.judul}</CardTitle>
                <CardDescription>
                  {laporan.tempatNama} · {laporan.kabupaten}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground">
                <p>
                  {laporan.isi.ringkasan.telurDiselamatkan} telur diselamatkan ·{" "}
                  {laporan.isi.ringkasan.tukikDilepas} tukik dilepas
                </p>
                <p className="mt-1 text-xs">
                  Diterbitkan {tanggalTerbit(laporan.diterbitkanPada)} · versi {laporan.versi}
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/laporan/${laporan.id}`}>Lihat Laporan</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
