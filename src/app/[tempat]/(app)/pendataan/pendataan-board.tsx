"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  buatDaftarNama,
  CatatanList,
  judulRantai,
  keadaanRantai,
  TahapStepper,
} from "@/components/pendataan/rantai-info";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  hapusCatatan,
  pesanError,
  selesaikanRantai,
  subscribeRantaiAktif,
  type KonteksPendataan,
} from "@/services/pendataan/client";
import {
  bolehDihapus,
  CATATAN_INFO,
  selesai,
  sisaTukik,
  TAHAP,
  tahapBerikutnya,
  tahapTerakhir,
  type Catatan,
  type Rantai,
  type Tahap,
} from "@/services/pendataan/rantai";
import { cn } from "@/utils/cn-tools";
import useStatusUtils from "@/utils/status-toast.utils";
import CatatanDialog, { type DataPilihan, type ModeCatatan } from "./catatan-dialog";

export interface IzinPendataan {
  create: boolean;
  update: boolean;
  delete: boolean;
}

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

type Konfirmasi = { judul: string; deskripsi: string; tombol: string; jalankan: () => Promise<unknown> };

export default function PendataanBoard({
  tempatId,
  penulis,
  izin,
  pilihan,
}: {
  tempatId: string;
  penulis: KonteksPendataan["penulis"];
  izin: IzinPendataan;
  pilihan: DataPilihan;
}) {
  const { onCustomMessage } = useStatusUtils();
  const online = useOnline();
  const [rantai, setRantai] = useState<Rantai[] | null>(null);
  const [belumTerkirim, setBelumTerkirim] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Tahap | "semua">("semua");
  const [mode, setMode] = useState<ModeCatatan | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi | null>(null);

  const nama = useMemo(() => buatDaftarNama(pilihan.jenisPenyu, pilihan.zona, pilihan.inkubator), [pilihan]);
  const gagal = (pesan: string) => onCustomMessage({ Message: pesan, tittle: "Gagal", variant: "destructive" });
  const ctx: KonteksPendataan = { tempatId, penulis, onGagalNanti: gagal };

  useEffect(
    () =>
      subscribeRantaiAktif(
        tempatId,
        (data, tertunda) => {
          setRantai(data);
          setBelumTerkirim(tertunda);
        },
        gagal
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tempatId]
  );

  const jumlahPerTahap = useMemo(
    () => Object.fromEntries(TAHAP.map((t) => [t, rantai?.filter((r) => tahapTerakhir(r) === t).length ?? 0])),
    [rantai]
  );
  const tampil = rantai?.filter((r) => filter === "semua" || tahapTerakhir(r) === filter) ?? [];
  const detail = rantai?.find((r) => r.id === detailId) ?? null;

  const jalankan = async (aksi: Promise<{ antre: boolean; diarsipkan: boolean }>, berhasil: string) => {
    try {
      const hasil = await aksi;
      const pesan = [
        berhasil,
        hasil.antre && "Tersimpan di perangkat, dikirim otomatis saat online.",
        hasil.diarsipkan && "Pendataan dipindah ke Arsip.",
      ].filter(Boolean);
      onCustomMessage({ Message: pesan.join(" "), tittle: "Berhasil", variant: "default" });
    } catch (error) {
      gagal(pesanError(error));
    }
  };

  const konfirmasiHapus = (r: Rantai, c: Catatan) =>
    setKonfirmasi({
      judul: `Hapus catatan ${CATATAN_INFO[c.jenis].label}?`,
      deskripsi: "Catatan yang dihapus tidak bisa dikembalikan.",
      tombol: "Hapus",
      jalankan: () => jalankan(hapusCatatan(ctx, r, c), `Catatan ${CATATAN_INFO[c.jenis].label} dihapus.`),
    });

  const konfirmasiSelesai = (r: Rantai) =>
    setKonfirmasi({
      judul: "Selesaikan pendataan ini?",
      deskripsi: selesai(r)
        ? "Pendataan ini sudah lengkap dan akan dipindah ke Arsip."
        : `Masih bisa dilanjutkan${sisaTukik(r) ? ` (${sisaTukik(r)} tukik belum tercatat)` : ""}. Pendataan akan dipindah ke Arsip apa adanya.`,
      tombol: "Selesaikan",
      jalankan: async () => {
        await jalankan(selesaikanRantai(ctx, r), "Pendataan diselesaikan.");
        setDetailId(null);
      },
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pendataan Berjalan</h2>
          <p className="text-sm text-muted-foreground">
            Telur ditemukan → diinkubasi → menetas → dirawat → dilepas. Yang sudah selesai otomatis masuk Arsip.
          </p>
        </div>
        {izin.create && <Button onClick={() => setMode({ aksi: "tambah", rantai: null, jenis: "ditemukan" })}>Pendataan Baru</Button>}
      </div>

      {!online && (
        <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900">
          Kamu sedang offline. Data yang kamu input tetap tersimpan di perangkat dan dikirim otomatis saat online.
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["semua", ...TAHAP] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filter === t ? "default" : "outline"}
            className="shrink-0"
            onClick={() => setFilter(t)}
          >
            {t === "semua" ? "Semua" : CATATAN_INFO[t].label}
            <span className="ml-1.5 opacity-70">{t === "semua" ? (rantai?.length ?? 0) : jumlahPerTahap[t]}</span>
          </Button>
        ))}
      </div>

      {rantai === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !tampil.length ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          {rantai.length ? "Tidak ada pendataan di tahap ini." : "Belum ada pendataan yang berjalan."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tampil.map((r) => {
            const berikut = tahapBerikutnya(r);
            const dirawat = tahapTerakhir(r) === "dirawat";
            return (
              <Card key={r.id} className={cn("flex flex-col", belumTerkirim.has(r.id) && "border-amber-400")}>
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{judulRantai(r, nama)}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-2 -mt-2 h-8 w-8 shrink-0"
                      aria-label="Detail"
                      onClick={() => setDetailId(r.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{keadaanRantai(r)}</CardDescription>
                  {belumTerkirim.has(r.id) && (
                    <Badge variant="outline" className="w-fit border-amber-400 text-amber-700">
                      Belum terkirim
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <TahapStepper rantai={r} />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {izin.create && berikut && (
                    <Button size="sm" onClick={() => setMode({ aksi: "tambah", rantai: r, jenis: berikut })}>
                      {dirawat ? "Catat Pelepasan" : `Lanjut: ${CATATAN_INFO[berikut].label}`}
                    </Button>
                  )}
                  {izin.create && dirawat && sisaTukik(r) > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setMode({ aksi: "tambah", rantai: r, jenis: "mati" })}>
                      Catat Mati
                    </Button>
                  )}
                  {!berikut && izin.update && (
                    <Button size="sm" variant="outline" onClick={() => konfirmasiSelesai(r)}>
                      Arsipkan
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setDetailId(r.id)}>
                    Detail
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{judulRantai(detail, nama)}</DialogTitle>
                <DialogDescription>{keadaanRantai(detail)}</DialogDescription>
              </DialogHeader>
              <TahapStepper rantai={detail} />
              <CatatanList
                rantai={detail}
                nama={nama}
                aksi={(c) =>
                  (izin.update || izin.delete) && (
                    <div className="flex gap-1">
                      {izin.update && (
                        <Button size="sm" variant="outline" onClick={() => setMode({ aksi: "ubah", rantai: detail, catatan: c })}>
                          Ubah
                        </Button>
                      )}
                      {izin.delete && bolehDihapus(detail, c) && (
                        <Button size="sm" variant="ghost" onClick={() => konfirmasiHapus(detail, c)}>
                          Hapus
                        </Button>
                      )}
                    </div>
                  )
                }
              />
              {izin.update && (
                <Button variant="outline" onClick={() => konfirmasiSelesai(detail)}>
                  Selesaikan & Arsipkan
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <CatatanDialog mode={mode} onOpenChange={(open) => !open && setMode(null)} pilihan={pilihan} ctx={ctx} />

      <AlertDialog open={konfirmasi !== null} onOpenChange={(open) => !open && setKonfirmasi(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{konfirmasi?.judul}</AlertDialogTitle>
            <AlertDialogDescription>{konfirmasi?.deskripsi}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => konfirmasi?.jalankan()}>{konfirmasi?.tombol}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
