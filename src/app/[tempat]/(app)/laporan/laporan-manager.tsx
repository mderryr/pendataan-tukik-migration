"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LaporanDaftar from "@/components/laporan/laporan-daftar.component";
import LaporanRingkasan from "@/components/laporan/laporan-ringkasan";
import LaporanUnduh from "@/components/laporan/laporan-unduh.component";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/useActionToast";
import { terbitkanLaporanAction } from "@/services/laporan/actions";
import {
  isiSama,
  judulLaporan,
  namaPeriode,
  periodeBerjalan,
  type IsiLaporan,
  type Laporan,
  type Periode,
} from "@/services/laporan/hitung";
import { hariIni } from "@/services/pendataan/rantai";
import { namaBulanPanjang } from "@/utils/nama-bulan.utils";

const TAHUN_AWAL = 2018;

const tanggalTerbit = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

function PilihPeriode({ periode }: { periode: Periode }) {
  const router = useRouter();
  const pathname = usePathname();
  const tahunIni = new Date().getFullYear();
  const bulan = periode.jenis === "bulanan" ? periode.bulan : new Date().getMonth() + 1;

  const ke = (next: { jenis?: string; tahun?: number; bulan?: number }) => {
    const q = new URLSearchParams({
      jenis: next.jenis ?? periode.jenis,
      tahun: String(next.tahun ?? periode.tahun),
      bulan: String(next.bulan ?? bulan),
    });
    router.push(`${pathname}?${q}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={periode.jenis} onValueChange={(jenis) => ke({ jenis })}>
        <SelectTrigger className="w-32" aria-label="Jenis laporan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bulanan">Bulanan</SelectItem>
          <SelectItem value="tahunan">Tahunan</SelectItem>
        </SelectContent>
      </Select>
      {periode.jenis === "bulanan" && (
        <Select value={String(bulan)} onValueChange={(v) => ke({ bulan: Number(v) })}>
          <SelectTrigger className="w-36" aria-label="Bulan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {namaBulanPanjang.map((nama, i) => (
              <SelectItem key={nama} value={String(i + 1)}>
                {nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={String(periode.tahun)} onValueChange={(v) => ke({ tahun: Number(v) })}>
        <SelectTrigger className="w-28" aria-label="Tahun">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: tahunIni - TAHUN_AWAL + 1 }, (_, i) => tahunIni - i).map((t) => (
            <SelectItem key={t} value={String(t)}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function LaporanManager({
  tempatId,
  periode,
  pratinjau,
  terbit,
  daftar,
  bolehTerbitkan,
}: {
  tempatId: string;
  periode: Periode;
  pratinjau: IsiLaporan;
  terbit: Laporan | null;
  daftar: Laporan[];
  bolehTerbitkan: boolean;
}) {
  const runAction = useActionToast();
  const berjalan = periodeBerjalan(periode, hariIni());
  const berubah = terbit !== null && !isiSama(terbit.isi, pratinjau);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          Laporan diringkas dari data pendataan (berjalan & arsip) menurut tanggal tiap catatan, lalu diterbitkan untuk
          umum. Kalau ada data yang tertinggal, terbitkan ulang. Versinya akan naik.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-base">{judulLaporan(periode)}</CardTitle>
            <CardDescription>
              {terbit
                ? `Diterbitkan versi ${terbit.versi} · ${tanggalTerbit(terbit.diterbitkanPada)} oleh ${terbit.diterbitkanOleh}`
                : "Belum diterbitkan. Di bawah ini pratinjau dari data saat ini."}
            </CardDescription>
          </div>
          <PilihPeriode periode={periode} />
        </CardHeader>
        <CardContent className="space-y-4">
          {berjalan && (
            <Alert>
              <AlertDescription>
                Periode {namaPeriode(periode)} belum berakhir, jadi angkanya masih bisa bertambah.
              </AlertDescription>
            </Alert>
          )}
          {berubah && (
            <Alert variant="destructive">
              <AlertDescription>
                Data berubah sejak versi {terbit.versi} diterbitkan. Terbitkan ulang supaya laporan publik ikut
                diperbarui.
              </AlertDescription>
            </Alert>
          )}

          <LaporanRingkasan isi={pratinjau} />

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {bolehTerbitkan && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={terbit !== null && !berubah}>
                    {terbit ? (berubah ? "Terbitkan Ulang" : "Sudah Terbaru") : "Terbitkan"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {terbit ? "Terbitkan ulang" : "Terbitkan"} {judulLaporan(periode).toLowerCase()}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Laporan akan bisa dilihat dan diunduh siapa saja di halaman Laporan.
                      {terbit && ` Versi ${terbit.versi} diganti dengan versi ${terbit.versi + 1}.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => runAction(terbitkanLaporanAction(tempatId, periode), "Laporan diterbitkan")}
                    >
                      Terbitkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {terbit && (
              <>
                <LaporanUnduh laporan={terbit} />
                <Button variant="link" asChild>
                  <Link href={`/laporan/${terbit.id}`}>Halaman publik</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-medium">Sudah Diterbitkan</h3>
        <LaporanDaftar daftar={daftar} tampilPenerbit />
      </div>
    </div>
  );
}
