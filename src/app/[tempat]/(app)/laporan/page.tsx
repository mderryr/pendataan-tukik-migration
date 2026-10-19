import type { Metadata } from "next";
import { can } from "@/services/auth/roles";
import { requirePermission } from "@/services/auth/session";
import { bacaPeriode, laporanId, type Periode } from "@/services/laporan/hitung";
import { getLaporan, hitungLaporan, listLaporanTempat } from "@/services/laporan/laporan";
import LaporanManager from "./laporan-manager";

export const metadata: Metadata = { title: "Laporan" };

// Default: laporan bulanan bulan lalu (bulan yang sudah selesai)
function periodeDariQuery(query: { jenis?: string; tahun?: string; bulan?: string }): Periode {
  const periode = bacaPeriode({ jenis: query.jenis, tahun: Number(query.tahun), bulan: Number(query.bulan) });
  if (periode) return periode;

  const lalu = new Date();
  lalu.setDate(1);
  lalu.setMonth(lalu.getMonth() - 1);
  return { jenis: "bulanan", tahun: lalu.getFullYear(), bulan: lalu.getMonth() + 1 };
}

export default async function LaporanPage({
  params,
  searchParams,
}: {
  params: Promise<{ tempat: string }>;
  searchParams: Promise<{ jenis?: string; tahun?: string; bulan?: string }>;
}) {
  const [{ tempat: tempatId }, query] = await Promise.all([params, searchParams]);
  const user = await requirePermission("laporan:read", tempatId);
  const periode = periodeDariQuery(query);

  const [pratinjau, terbit, daftar] = await Promise.all([
    hitungLaporan(tempatId, periode),
    getLaporan(laporanId(tempatId, periode)),
    listLaporanTempat(tempatId),
  ]);

  return (
    <LaporanManager
      tempatId={tempatId}
      periode={periode}
      pratinjau={pratinjau}
      terbit={terbit}
      daftar={daftar}
      bolehTerbitkan={can(user, "laporan:create", tempatId)}
    />
  );
}
