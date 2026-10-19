// Wilayah zona pantai dipetakan dengan sel heksagon H3 (https://h3geo.org).
// Resolusi 11: sisi heksagon ±25 m, luas ±0,2 ha — cukup halus untuk pantai yang sempit.
import { cellArea, getResolution, isValidCell } from "h3-js";

export const ZONA_RESOLUSI = 11;
export const ZONA_MAKS_SEL = 3000;

// Warna tiap zona di peta (urut sesuai daftar zona)
export const WARNA_ZONA = ["#0d9488", "#f97316", "#8b5cf6", "#e11d48", "#0284c7", "#ca8a04", "#16a34a", "#db2777"];

export const warnaZona = (index: number) => WARNA_ZONA[index % WARNA_ZONA.length];

export function selValid(sel: string) {
  return isValidCell(sel) && getResolution(sel) === ZONA_RESOLUSI;
}

export function luasSel(sel: string[]) {
  return sel.reduce((total, s) => total + cellArea(s, "m2"), 0);
}

// 2150 → "2.150 m²", 41000 → "4,1 ha"
export function formatLuas(m2: number) {
  if (m2 < 10_000) return `${Math.round(m2).toLocaleString("id-ID")} m²`;
  return `${(m2 / 10_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} ha`;
}
