import { namaBulanPendek } from "./nama-bulan.utils";

// "2026-10-19" → "19 Okt 2026"
export function formatTanggal(tanggal: string) {
  const [tahun, bulan, hari] = tanggal.split("-").map(Number);
  if (!tahun || !bulan || !hari) return tanggal;
  return `${hari} ${namaBulanPendek[bulan - 1]} ${tahun}`;
}
