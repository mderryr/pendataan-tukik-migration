import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import LaporanRingkasan from "@/components/laporan/laporan-ringkasan";
import LaporanUnduh from "@/components/laporan/laporan-unduh.component";
import { Button } from "@/components/ui/button";
import { getLaporan } from "@/services/laporan/laporan";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const laporan = await getLaporan((await params).id);
  return { title: laporan ? `${laporan.judul} · ${laporan.tempatNama}` : "Laporan" };
}

const tanggalTerbit = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function LaporanDetailPage({ params }: Props) {
  const laporan = await getLaporan((await params).id);
  if (!laporan) notFound();

  return (
    <section className="container mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-3" asChild>
          <Link href="/laporan">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Semua laporan
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold md:text-3xl">{laporan.judul}</h1>
            <p className="text-muted-foreground">
              <Link href={`/pendataan/${laporan.tempatId}`} className="underline-offset-4 hover:underline">
                {laporan.tempatNama}
              </Link>{" "}
              · {laporan.kabupaten}, {laporan.provinsi}
            </p>
            <p className="text-sm text-muted-foreground">
              Versi {laporan.versi} · diterbitkan {tanggalTerbit(laporan.diterbitkanPada)} oleh {laporan.diterbitkanOleh}
            </p>
          </div>
          <LaporanUnduh laporan={laporan} />
        </div>
      </div>

      <LaporanRingkasan isi={laporan.isi} />
    </section>
  );
}
