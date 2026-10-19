"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buatDaftarNama, CatatanList, namaPenyu, TahapStepper } from "@/components/pendataan/rantai-info";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActionToast } from "@/hooks/useActionToast";
import { bukaKembaliAction, hapusArsipAction } from "@/services/pendataan/actions";
import {
  CATATAN_INFO,
  JENIS_CATATAN,
  semuaCatatan,
  tanggalMulai,
  type Catatan,
  type JenisCatatan,
  type Rantai,
} from "@/services/pendataan/rantai";
import type { JenisPenyu, Sarana } from "@/services/tempat/types";
import { formatTanggal } from "@/utils/tanggal.utils";
import { TabelCatatan, TabelRantai } from "./arsip-tabel";

export default function ArsipView({
  tempatId,
  tahun,
  pilihanTahun,
  rantai,
  pilihan,
  izin,
}: {
  tempatId: string;
  tahun: number;
  pilihanTahun: number[];
  rantai: Rantai[];
  pilihan: { jenisPenyu: JenisPenyu[]; zona: Sarana[]; inkubator: Sarana[] };
  izin: { update: boolean; delete: boolean };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const runAction = useActionToast();
  const [detailId, setDetailId] = useState<string | null>(null);

  const nama = useMemo(() => buatDaftarNama(pilihan.jenisPenyu, pilihan.zona, pilihan.inkubator), [pilihan]);
  // Data mentah per koleksi, terbaru di atas
  const perJenis = useMemo(() => {
    const semua = rantai.flatMap(semuaCatatan).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    return Object.fromEntries(JENIS_CATATAN.map((jenis) => [jenis, semua.filter((c) => c.jenis === jenis)])) as Record<
      JenisCatatan,
      Catatan[]
    >;
  }, [rantai]);
  const detail = rantai.find((r) => r.id === detailId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Arsip Data</h2>
          <p className="text-sm text-muted-foreground">
            Pendataan yang sudah selesai, menurut tahun mulainya. Lihat per rantai (sarang) atau data mentah per jenis.
          </p>
        </div>
        <Select value={String(tahun)} onValueChange={(v) => router.push(`${pathname}?tahun=${v}`)}>
          <SelectTrigger className="w-32" aria-label="Tahun">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pilihanTahun.map((t) => (
              <SelectItem key={t} value={String(t)}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="rantai">
        {/* Banyak tab: bisa digeser di layar kecil */}
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="rantai">
              Rantai <span className="ml-1.5 opacity-60">{rantai.length}</span>
            </TabsTrigger>
            {JENIS_CATATAN.map((jenis) => (
              <TabsTrigger key={jenis} value={jenis}>
                {CATATAN_INFO[jenis].label} <span className="ml-1.5 opacity-60">{perJenis[jenis].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="rantai">
          <TabelRantai rantai={rantai} nama={nama} onDetail={setDetailId} />
        </TabsContent>
        {JENIS_CATATAN.map((jenis) => (
          <TabsContent key={jenis} value={jenis}>
            <TabelCatatan jenis={jenis} catatan={perJenis[jenis]} nama={nama} onDetail={setDetailId} />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {namaPenyu(detail, nama)} · {formatTanggal(tanggalMulai(detail))}
                </DialogTitle>
                <DialogDescription>Data arsip hanya bisa diubah setelah dibuka kembali ke Pendataan.</DialogDescription>
              </DialogHeader>
              <TahapStepper rantai={detail} />
              <CatatanList rantai={detail} nama={nama} />
              {(izin.update || izin.delete) && (
                <div className="flex flex-wrap gap-2">
                  {izin.update && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const ok = await runAction(
                          bukaKembaliAction(tempatId, detail.id),
                          "Pendataan dibuka kembali, lihat di menu Pendataan"
                        );
                        if (ok) setDetailId(null);
                      }}
                    >
                      Buka Kembali
                    </Button>
                  )}
                  {izin.delete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost">Hapus Permanen</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus pendataan ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Semua catatan di pendataan ini dihapus dan tidak bisa dikembalikan. Laporan yang sudah
                            diterbitkan tidak ikut berubah sampai diterbitkan ulang.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              const ok = await runAction(hapusArsipAction(tempatId, detail.id), "Pendataan dihapus");
                              if (ok) setDetailId(null);
                            }}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
