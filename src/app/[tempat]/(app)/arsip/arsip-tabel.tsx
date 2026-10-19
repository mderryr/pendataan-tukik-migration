"use client";

import type { ReactNode } from "react";
import { namaPenyu, type DaftarNama } from "@/components/pendataan/rantai-info";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RINGKASAN_LABEL, ringkas, type Ringkasan } from "@/services/laporan/hitung";
import {
  CATATAN_INFO,
  semuaCatatan,
  tanggalMulai,
  type Catatan,
  type JenisCatatan,
  type Rantai,
} from "@/services/pendataan/rantai";
import { formatTanggal } from "@/utils/tanggal.utils";

const KOLOM_RANTAI: (keyof Ringkasan)[] = [
  "telurDiselamatkan",
  "tukikMenetas",
  "telurTidakMenetas",
  "tukikMati",
  "tukikDilepas",
];

function Kosong({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</p>;
}

// Satu baris per rantai (sarang), angka dijumlah dari semua tahapnya
export function TabelRantai({
  rantai,
  nama,
  onDetail,
}: {
  rantai: Rantai[];
  nama: DaftarNama;
  onDetail: (rantaiId: string) => void;
}) {
  if (!rantai.length) return <Kosong>Belum ada arsip di tahun ini.</Kosong>;
  const total = ringkas(rantai.flatMap(semuaCatatan));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mulai</TableHead>
            <TableHead>Jenis</TableHead>
            {KOLOM_RANTAI.map((key) => (
              <TableHead key={key} className="text-right">
                {RINGKASAN_LABEL[key]}
              </TableHead>
            ))}
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rantai.map((r) => {
            const angka = ringkas(semuaCatatan(r));
            return (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap">{formatTanggal(tanggalMulai(r))}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {r.ditemukan && !r.ditemukan.bertelur ? "Tidak bertelur" : namaPenyu(r, nama)}
                </TableCell>
                {KOLOM_RANTAI.map((key) => (
                  <TableCell key={key} className="text-right tabular-nums">
                    {angka[key]}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onDetail(r.id)}>
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/50 font-medium">
            <TableCell colSpan={2}>Total {rantai.length} pendataan</TableCell>
            {KOLOM_RANTAI.map((key) => (
              <TableCell key={key} className="text-right tabular-nums">
                {total[key]}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

interface Kolom {
  label: string;
  isi: (c: Catatan, nama: DaftarNama) => ReactNode;
  angka?: keyof Catatan; // kolom angka dijumlahkan di baris total
}

const namaZona = (c: Catatan, nama: DaftarNama) => (c.zonaId ? (nama.zona[c.zonaId] ?? "-") : "-");

// Kolom khusus tiap jenis data (selain tanggal, jenis penyu, penanggung jawab, keterangan)
const KOLOM_JENIS: Record<JenisCatatan, Kolom[]> = {
  ditemukan: [
    { label: "Bertelur", isi: (c) => (c.bertelur ? "Ya" : "Tidak") },
    { label: CATATAN_INFO.ditemukan.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" },
    { label: "Zona", isi: namaZona },
  ],
  diinkubasi: [{ label: CATATAN_INFO.diinkubasi.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" }],
  menetas: [
    { label: CATATAN_INFO.menetas.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" },
    { label: "Tidak menetas", isi: (c) => c.jumlahTidakMenetas, angka: "jumlahTidakMenetas" },
  ],
  dirawat: [
    { label: CATATAN_INFO.dirawat.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" },
    { label: "Inkubator", isi: (c, nama) => (c.inkubatorId ? (nama.inkubator[c.inkubatorId] ?? "-") : "-") },
  ],
  mati: [{ label: CATATAN_INFO.mati.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" }],
  dilepas: [
    { label: CATATAN_INFO.dilepas.labelJumlah, isi: (c) => c.jumlah, angka: "jumlah" },
    { label: "Lokasi", isi: namaZona },
  ],
};

// Data mentah satu koleksi, satu baris per catatan
export function TabelCatatan({
  jenis,
  catatan,
  nama,
  onDetail,
}: {
  jenis: JenisCatatan;
  catatan: Catatan[];
  nama: DaftarNama;
  onDetail: (rantaiId: string) => void;
}) {
  if (!catatan.length) return <Kosong>Belum ada data {CATATAN_INFO[jenis].label.toLowerCase()} di arsip tahun ini.</Kosong>;
  const kolom = KOLOM_JENIS[jenis];
  const total = (key: keyof Catatan) => catatan.reduce((sum, c) => sum + Number(c[key] ?? 0), 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jenis Penyu</TableHead>
            {kolom.map((k) => (
              <TableHead key={k.label} className={k.angka ? "text-right" : undefined}>
                {k.label}
              </TableHead>
            ))}
            <TableHead>Penanggung Jawab</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {catatan.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="whitespace-nowrap">{formatTanggal(c.tanggal)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {c.jenisPenyuId ? (nama.penyu[c.jenisPenyuId] ?? "-") : "-"}
              </TableCell>
              {kolom.map((k) => (
                <TableCell key={k.label} className={k.angka ? "text-right tabular-nums" : "whitespace-nowrap"}>
                  {k.isi(c, nama)}
                </TableCell>
              ))}
              <TableCell className="whitespace-nowrap">{c.penanggungJawabNama || "-"}</TableCell>
              <TableCell className="min-w-40 max-w-xs truncate text-muted-foreground" title={c.keterangan}>
                {c.keterangan || "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={() => onDetail(c.rantaiId)}>
                  Rantai
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50 font-medium">
            <TableCell colSpan={2}>Total {catatan.length} catatan</TableCell>
            {kolom.map((k) => (
              <TableCell key={k.label} className="text-right tabular-nums">
                {k.angka ? total(k.angka) : ""}
              </TableCell>
            ))}
            <TableCell colSpan={3} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
