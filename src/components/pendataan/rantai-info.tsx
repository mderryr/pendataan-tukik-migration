import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
  CATATAN_INFO,
  catatanPertama,
  jenisPenyuRantai,
  jumlahDilepas,
  jumlahMati,
  semuaCatatan,
  sisaTukik,
  tahapTerakhir,
  tanggalMulai,
  type Catatan,
  type Rantai,
} from "@/services/pendataan/rantai";
import type { JenisPenyu, Sarana } from "@/services/tempat/types";
import { cn } from "@/utils/cn-tools";
import { formatTanggal } from "@/utils/tanggal.utils";

// Nama untuk ID jenis penyu, zona, dan inkubator
export interface DaftarNama {
  penyu: Record<string, string>;
  zona: Record<string, string>;
  inkubator: Record<string, string>;
}

export function buatDaftarNama(jenisPenyu: JenisPenyu[], zona: Sarana[], inkubator: Sarana[]): DaftarNama {
  const peta = (list: { id: string; nama: string }[]) => Object.fromEntries(list.map((x) => [x.id, x.nama]));
  return { penyu: peta(jenisPenyu), zona: peta(zona), inkubator: peta(inkubator) };
}

export function namaPenyu(r: Rantai, nama: DaftarNama) {
  const id = jenisPenyuRantai(r);
  return id ? (nama.penyu[id] ?? "Jenis tidak dikenal") : "Jenis belum diisi";
}

const LANGKAH = ["ditemukan", "diinkubasi", "menetas", "dirawat", "dilepas"] as const;

export function TahapStepper({ rantai }: { rantai: Rantai }) {
  const terisi = (langkah: (typeof LANGKAH)[number]) =>
    langkah === "dilepas" ? rantai.dilepas.length > 0 : rantai[langkah] !== null;
  const mulai = LANGKAH.findIndex(terisi);

  return (
    <ol className="flex items-center gap-1" aria-label="Tahap pendataan">
      {LANGKAH.map((langkah, i) => {
        const selesai = terisi(langkah);
        const dilewati = !selesai && i < mulai; // rantai dimulai dari tahap setelahnya
        return (
          <li key={langkah} className="flex flex-1 flex-col items-center gap-1 text-center">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                selesai && "border-primary bg-primary text-primary-foreground",
                dilewati && "border-dashed opacity-50"
              )}
            >
              {selesai ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("text-[10px] leading-tight", selesai ? "text-foreground" : "text-muted-foreground")}>
              {langkah === "dilepas" ? "Dilepas" : CATATAN_INFO[langkah].label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Satu baris ringkas tentang posisi rantai sekarang
export function keadaanRantai(r: Rantai) {
  switch (tahapTerakhir(r)) {
    case "ditemukan":
      return r.ditemukan!.bertelur ? `${r.ditemukan!.jumlah} telur diselamatkan` : "Penyu naik tidak bertelur";
    case "diinkubasi":
      return `${r.diinkubasi!.jumlah} telur diinkubasi`;
    case "menetas":
      return `${r.menetas!.jumlah} tukik menetas, ${r.menetas!.jumlahTidakMenetas} telur tidak menetas`;
    case "dirawat": {
      const rincian = [
        jumlahMati(r) && `${jumlahMati(r)} mati`,
        jumlahDilepas(r) && `${jumlahDilepas(r)} dilepas`,
      ].filter(Boolean);
      return `${sisaTukik(r)} tukik dirawat${rincian.length ? ` (${rincian.join(", ")})` : ""}`;
    }
    default:
      return "";
  }
}

export function judulRantai(r: Rantai, nama: DaftarNama) {
  return `${namaPenyu(r, nama)} · ${formatTanggal(tanggalMulai(r))}`;
}

function rincianCatatan(c: Catatan, nama: DaftarNama) {
  const bagian: string[] = [];
  if (c.jenis === "ditemukan" && !c.bertelur) bagian.push("Tidak bertelur");
  else bagian.push(`${CATATAN_INFO[c.jenis].labelJumlah}: ${c.jumlah}`);
  if (c.jenis === "menetas") bagian.push(`Tidak menetas: ${c.jumlahTidakMenetas}`);
  if (c.zonaId && (c.jenis === "ditemukan" || c.jenis === "dilepas")) {
    bagian.push(`${c.jenis === "dilepas" ? "Lokasi" : "Zona"}: ${nama.zona[c.zonaId] ?? "-"}`);
  }
  if (c.jenis === "dirawat" && c.inkubatorId) bagian.push(`Inkubator: ${nama.inkubator[c.inkubatorId] ?? "-"}`);
  return bagian;
}

// Daftar semua catatan dalam satu rantai, urut tahap. `aksi` = tombol per catatan (opsional).
export function CatatanList({
  rantai,
  nama,
  aksi,
}: {
  rantai: Rantai;
  nama: DaftarNama;
  aksi?: (catatan: Catatan) => ReactNode;
}) {
  const pertama = catatanPertama(rantai);
  return (
    <ol className="space-y-3">
      {semuaCatatan(rantai).map((c) => (
        <li key={`${c.jenis}/${c.id}`} className="rounded-md border p-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium">{CATATAN_INFO[c.jenis].label}</p>
              <p className="text-xs text-muted-foreground">
                {formatTanggal(c.tanggal)} · {c.penanggungJawabNama || "—"}
              </p>
            </div>
            {aksi?.(c)}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {c === pertama && <li>Jenis: {namaPenyu(rantai, nama)}</li>}
            {rincianCatatan(c, nama).map((teks) => (
              <li key={teks}>{teks}</li>
            ))}
          </ul>
          {c.keterangan && <p className="mt-2 text-muted-foreground">{c.keterangan}</p>}
        </li>
      ))}
    </ol>
  );
}
