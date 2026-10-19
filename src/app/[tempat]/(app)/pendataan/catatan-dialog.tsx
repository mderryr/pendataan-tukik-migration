"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PendataanError,
  pesanError,
  tambahCatatan,
  ubahCatatan,
  type HasilSimpan,
  type KonteksPendataan,
} from "@/services/pendataan/client";
import {
  batasJumlah,
  CATATAN_INFO,
  catatanPertama,
  hariIni,
  TAHAP,
  type Catatan,
  type JenisCatatan,
  type Rantai,
} from "@/services/pendataan/rantai";
import { catatanSchema, type CatatanInput } from "@/services/pendataan/schema";
import type { JenisPenyu, Sarana } from "@/services/tempat/types";
import useStatusUtils from "@/utils/status-toast.utils";

export type ModeCatatan =
  | { aksi: "tambah"; rantai: Rantai | null; jenis: JenisCatatan }
  | { aksi: "ubah"; rantai: Rantai; catatan: Catatan };

export interface DataPilihan {
  jenisPenyu: JenisPenyu[];
  zona: Sarana[];
  inkubator: Sarana[];
}

const KOSONG = "-"; // nilai Select untuk "tidak dipilih" (Select tidak menerima null)

function PilihSelect({
  value,
  onChange,
  pilihan,
  placeholder,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  pilihan: { id: string; nama: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value ?? KOSONG} onValueChange={(v) => onChange(v === KOSONG ? null : v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={KOSONG}>{placeholder}</SelectItem>
        {pilihan.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.nama}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Sarana nonaktif disembunyikan, kecuali sedang dipakai catatan yang diubah
const saranaAktif = (list: Sarana[], dipakai: string | null) => list.filter((s) => s.aktif || s.id === dipakai);

function nilaiAwal(mode: ModeCatatan, jenis: JenisCatatan): CatatanInput {
  if (mode.aksi === "ubah") {
    const c = mode.catatan;
    return {
      tanggal: c.tanggal,
      jenisPenyuId: c.jenisPenyuId,
      jumlah: c.jumlah,
      jumlahTidakMenetas: c.jumlahTidakMenetas,
      bertelur: c.bertelur,
      zonaId: c.zonaId,
      inkubatorId: c.inkubatorId,
      keterangan: c.keterangan,
    };
  }
  // Tahap berikutnya langsung diisi jumlah dari tahap sebelumnya, tinggal dikoreksi
  const batas = mode.rantai ? batasJumlah(mode.rantai, jenis) : null;
  return {
    tanggal: hariIni(),
    jenisPenyuId: null,
    jumlah: batas ?? 0,
    jumlahTidakMenetas: 0,
    bertelur: true,
    zonaId: null,
    inkubatorId: mode.rantai?.dirawat?.inkubatorId ?? null,
    keterangan: "",
  };
}

function CatatanForm({
  mode,
  pilihan,
  ctx,
  onSelesai,
}: {
  mode: ModeCatatan;
  pilihan: DataPilihan;
  ctx: KonteksPendataan;
  onSelesai: () => void;
}) {
  const { onCustomMessage } = useStatusUtils();
  const [jenis, setJenis] = useState<JenisCatatan>(mode.aksi === "ubah" ? mode.catatan.jenis : mode.jenis);
  const form = useForm<CatatanInput>({ resolver: zodResolver(catatanSchema), defaultValues: nilaiAwal(mode, jenis) });

  const rantaiBaru = mode.aksi === "tambah" && !mode.rantai;
  // Jenis penyu dipilih di catatan pertama rantai (dokumen tahap ber-ID sama, jadi bandingkan jenisnya)
  const pilihJenisPenyu = rantaiBaru || (mode.aksi === "ubah" && catatanPertama(mode.rantai)?.jenis === jenis);
  const batas = mode.rantai ? batasJumlah(mode.rantai, jenis, mode.aksi === "ubah" ? mode.catatan.id : undefined) : null;
  const bertelur = form.watch("bertelur");

  const onSubmit: SubmitHandler<CatatanInput> = async (values) => {
    if (batas !== null && values.jumlah > batas) {
      form.setError("jumlah", { message: `Maksimal ${batas}` });
      return;
    }
    let hasil: HasilSimpan;
    try {
      hasil =
        mode.aksi === "ubah"
          ? await ubahCatatan(ctx, mode.rantai, mode.catatan, values)
          : await tambahCatatan(ctx, mode.rantai, jenis, values);
    } catch (error) {
      const pesan = error instanceof PendataanError ? error.message : pesanError(error);
      onCustomMessage({ Message: pesan, tittle: "Gagal", variant: "destructive" });
      return;
    }

    const pesan = [
      `${CATATAN_INFO[jenis].label} ${mode.aksi === "ubah" ? "diperbarui" : "dicatat"}.`,
      hasil.antre && "Tersimpan di perangkat, dikirim otomatis saat online.",
      hasil.diarsipkan && "Pendataan ini selesai dan dipindah ke Arsip.",
    ].filter(Boolean);
    onCustomMessage({ Message: pesan.join(" "), tittle: "Berhasil", variant: "default" });
    onSelesai();
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {rantaiBaru && (
          <div className="space-y-2">
            <Label>Mulai dari tahap</Label>
            <Select value={jenis} onValueChange={(v) => setJenis(v as JenisCatatan)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAHAP.map((tahap) => (
                  <SelectItem key={tahap} value={tahap}>
                    {CATATAN_INFO[tahap].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Biasanya mulai dari Ditemukan. Pilih tahap lain kalau datanya baru tercatat di tahap itu, mis. sarang
              alami yang ditemukan sudah menetas.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="tanggal"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <Input type="date" max={hariIni()} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {pilihJenisPenyu && (
            <FormField
              name="jenisPenyuId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Penyu</FormLabel>
                  <PilihSelect
                    value={field.value}
                    onChange={field.onChange}
                    pilihan={pilihan.jenisPenyu}
                    placeholder="Belum diketahui"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {jenis === "ditemukan" && (
          <FormField
            name="bertelur"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <FormLabel>Penyu bertelur</FormLabel>
                  <FormDescription>Matikan kalau penyu naik tapi tidak bertelur.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) form.setValue("jumlah", 0);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="jumlah"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{CATATAN_INFO[jenis].labelJumlah}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={batas ?? undefined}
                    disabled={jenis === "ditemukan" && !bertelur}
                    {...field}
                  />
                </FormControl>
                {batas !== null && <FormDescription>Maksimal {batas}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
          {jenis === "menetas" && (
            <FormField
              name="jumlahTidakMenetas"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telur tidak menetas</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {(jenis === "ditemukan" || jenis === "dilepas") && (
            <FormField
              name="zonaId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{jenis === "dilepas" ? "Lokasi pelepasan" : "Zona"}</FormLabel>
                  <PilihSelect
                    value={field.value}
                    onChange={field.onChange}
                    pilihan={saranaAktif(pilihan.zona, field.value)}
                    placeholder="Tidak dipilih"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {jenis === "dirawat" && (
            <FormField
              name="inkubatorId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inkubator / bak</FormLabel>
                  <PilihSelect
                    value={field.value}
                    onChange={field.onChange}
                    pilihan={saranaAktif(pilihan.inkubator, field.value)}
                    placeholder="Tidak dipilih"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          name="keterangan"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Opsional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}

export default function CatatanDialog({
  mode,
  onOpenChange,
  pilihan,
  ctx,
}: {
  mode: ModeCatatan | null; // null = tertutup
  onOpenChange: (open: boolean) => void;
  pilihan: DataPilihan;
  ctx: KonteksPendataan;
}) {
  const jenis = mode && (mode.aksi === "ubah" ? mode.catatan.jenis : mode.jenis);
  const judul = !mode
    ? ""
    : mode.aksi === "ubah"
      ? `Ubah ${CATATAN_INFO[jenis!].label}`
      : mode.rantai
        ? `Catat ${CATATAN_INFO[jenis!].label}`
        : "Pendataan Baru";

  return (
    <Dialog open={mode !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          <DialogDescription>
            Data tetap tersimpan walau sinyal hilang, lalu dikirim otomatis saat online.
          </DialogDescription>
        </DialogHeader>
        {/* Konten dialog dilepas saat ditutup, jadi form selalu mulai dari nilai awal */}
        {mode && <CatatanForm mode={mode} pilihan={pilihan} ctx={ctx} onSelesai={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
