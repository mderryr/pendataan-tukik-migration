// Laporan = data mentah pendataan yang diringkas (dikompres) per periode, lalu disimpan sebagai JSON
// di koleksi laporan/{id} supaya bisa dibagikan ke publik dan diubah ke PDF.
// File ini murni (tanpa Firebase), dipakai server untuk menghitung dan client untuk menampilkan.
import getNamaBulan from "@/utils/nama-bulan.utils";
import type { Catatan } from "@/services/pendataan/rantai";
import type { JenisPenyu } from "@/services/tempat/types";

export const FORMAT_LAPORAN = "sipenyu-laporan/1";

export type Periode = { jenis: "bulanan"; tahun: number; bulan: number } | { jenis: "tahunan"; tahun: number };

export const RINGKASAN_KEYS = [
  "penyuNaik",
  "penyuBertelur",
  "penyuTidakBertelur",
  "telurDiselamatkan",
  "telurDiinkubasi",
  "tukikMenetas",
  "telurTidakMenetas",
  "tukikDirawat",
  "tukikMati",
  "tukikDilepas",
] as const;
export type Ringkasan = Record<(typeof RINGKASAN_KEYS)[number], number>;

export const RINGKASAN_LABEL: Record<keyof Ringkasan, string> = {
  penyuNaik: "Penyu naik",
  penyuBertelur: "Penyu naik bertelur",
  penyuTidakBertelur: "Penyu naik tidak bertelur",
  telurDiselamatkan: "Telur diselamatkan",
  telurDiinkubasi: "Telur diinkubasi",
  tukikMenetas: "Telur menetas",
  telurTidakMenetas: "Telur tidak menetas",
  tukikDirawat: "Tukik dirawat",
  tukikMati: "Tukik mati",
  tukikDilepas: "Tukik dilepas",
};

// Kolom ringkas untuk tabel per jenis & per bulan
export const KOLOM_TABEL: (keyof Ringkasan)[] = [
  "penyuNaik",
  "telurDiselamatkan",
  "tukikMenetas",
  "telurTidakMenetas",
  "tukikMati",
  "tukikDilepas",
];

export interface IsiLaporan {
  ringkasan: Ringkasan;
  perJenis: { jenisPenyuId: string | null; nama: string; ringkasan: Ringkasan }[];
  perBulan: Ringkasan[] | null; // 12 bulan, hanya laporan tahunan
  jumlahCatatan: number;
}

// Dokumen laporan/{id}
export interface Laporan {
  id: string;
  format: typeof FORMAT_LAPORAN;
  tempatId: string;
  tempatNama: string;
  kabupaten: string;
  provinsi: string;
  periode: Periode;
  judul: string;
  isi: IsiLaporan;
  versi: number; // naik setiap diterbitkan ulang
  diterbitkanPada: string; // ISO
  diterbitkanOleh: string; // nama
}

export function laporanId(tempatId: string, periode: Periode) {
  return periode.jenis === "bulanan"
    ? `${tempatId}_${periode.tahun}-${String(periode.bulan).padStart(2, "0")}`
    : `${tempatId}_${periode.tahun}`;
}

export function namaPeriode(periode: Periode) {
  return periode.jenis === "bulanan" ? `${getNamaBulan(periode.bulan)} ${periode.tahun}` : `Tahun ${periode.tahun}`;
}

export function judulLaporan(periode: Periode) {
  return `Laporan ${periode.jenis === "bulanan" ? "Bulanan" : "Tahunan"} ${namaPeriode(periode)}`;
}

// Rentang tanggal [dari, sampai) dalam format YYYY-MM-DD
export function rentangPeriode(periode: Periode) {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (periode.jenis === "tahunan") return { dari: `${periode.tahun}-01-01`, sampai: `${periode.tahun + 1}-01-01` };
  const [tahunBerikut, bulanBerikut] = periode.bulan === 12 ? [periode.tahun + 1, 1] : [periode.tahun, periode.bulan + 1];
  return { dari: `${periode.tahun}-${pad(periode.bulan)}-01`, sampai: `${tahunBerikut}-${pad(bulanBerikut)}-01` };
}

// Periode yang belum berakhir masih bisa bertambah datanya
export function periodeBerjalan(periode: Periode, hariIni: string) {
  return hariIni < rentangPeriode(periode).sampai;
}

export function ringkasanKosong(): Ringkasan {
  return Object.fromEntries(RINGKASAN_KEYS.map((key) => [key, 0])) as Ringkasan;
}

// Tiap catatan dihitung pada bulan tanggalnya sendiri, bukan tanggal mulai rantainya
export function ringkas(catatan: Catatan[]): Ringkasan {
  const r = ringkasanKosong();
  for (const c of catatan) {
    switch (c.jenis) {
      case "ditemukan":
        r.penyuNaik += 1;
        if (c.bertelur) r.penyuBertelur += 1;
        else r.penyuTidakBertelur += 1;
        r.telurDiselamatkan += c.jumlah;
        break;
      case "diinkubasi":
        r.telurDiinkubasi += c.jumlah;
        break;
      case "menetas":
        r.tukikMenetas += c.jumlah;
        r.telurTidakMenetas += c.jumlahTidakMenetas;
        break;
      case "dirawat":
        r.tukikDirawat += c.jumlah;
        break;
      case "mati":
        r.tukikMati += c.jumlah;
        break;
      case "dilepas":
        r.tukikDilepas += c.jumlah;
        break;
    }
  }
  return r;
}

export function buatIsiLaporan(catatan: Catatan[], periode: Periode, jenisPenyu: JenisPenyu[]): IsiLaporan {
  const jenisIds = [...new Set(catatan.map((c) => c.jenisPenyuId))];
  const perJenis = jenisIds
    .map((id) => ({
      jenisPenyuId: id,
      nama: jenisPenyu.find((j) => j.id === id)?.nama ?? "Jenis belum diisi",
      ringkasan: ringkas(catatan.filter((c) => c.jenisPenyuId === id)),
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const perBulan =
    periode.jenis === "tahunan"
      ? Array.from({ length: 12 }, (_, i) => {
          const bulan = `${periode.tahun}-${String(i + 1).padStart(2, "0")}`;
          return ringkas(catatan.filter((c) => c.tanggal.startsWith(bulan)));
        })
      : null;

  return { ringkasan: ringkas(catatan), perJenis, perBulan, jumlahCatatan: catatan.length };
}

export function persenMenetas(r: Ringkasan) {
  const total = r.tukikMenetas + r.telurTidakMenetas;
  return total ? Math.round((r.tukikMenetas / total) * 1000) / 10 : null;
}

// Memvalidasi periode kiriman client/URL; hanya field yang dikenal yang dipakai
export function bacaPeriode(value: unknown): Periode | null {
  const p = value as Periode;
  if (!p || !Number.isInteger(p.tahun) || p.tahun < 2000 || p.tahun > 2100) return null;
  if (p.jenis === "tahunan") return { jenis: "tahunan", tahun: p.tahun };
  if (p.jenis === "bulanan" && Number.isInteger(p.bulan) && p.bulan >= 1 && p.bulan <= 12) {
    return { jenis: "bulanan", tahun: p.tahun, bulan: p.bulan };
  }
  return null;
}

// Urutan key dari Firestore tidak dijamin, jadi dibandingkan setelah key diurutkan
function stabil(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stabil);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stabil((value as any)[key])]));
  }
  return value;
}

// Dipakai untuk memberi tahu kalau ada data yang berubah/tertinggal sejak laporan diterbitkan
export function isiSama(a: IsiLaporan, b: IsiLaporan) {
  return JSON.stringify(stabil(a)) === JSON.stringify(stabil(b));
}

// Urut periode terbaru dulu; dalam satu tahun, laporan tahunan di atas bulanan
export function urutPeriode(a: Laporan, b: Laporan) {
  const urutan = (l: Laporan) => (l.periode.jenis === "bulanan" ? l.periode.bulan : 13);
  return b.periode.tahun - a.periode.tahun || urutan(b) - urutan(a);
}

// Angka yang disorot untuk satu tempat: laporan tahunan terbaru, kalau belum ada pakai bulanan terbaru
export function laporanSorotan(daftar: Laporan[]): Laporan | null {
  const urut = [...daftar].sort(urutPeriode);
  return urut.find((l) => l.periode.jenis === "tahunan") ?? urut[0] ?? null;
}

// Laporan tahunan, dan laporan bulanan dikelompokkan per tahun (terbaru dulu)
export function kelompokkanLaporan(daftar: Laporan[]) {
  const urut = [...daftar].sort(urutPeriode);
  const tahunan = urut.filter((l) => l.periode.jenis === "tahunan");
  const bulanan = urut.filter((l) => l.periode.jenis === "bulanan");
  const perTahun = [...new Set(bulanan.map((l) => l.periode.tahun))].map((tahun) => ({
    tahun,
    laporan: bulanan.filter((l) => l.periode.tahun === tahun),
  }));
  return { tahunan, bulananPerTahun: perTahun };
}
