import type { Metadata } from "next";
import { can } from "@/services/auth/roles";
import { requirePermission } from "@/services/auth/session";
import { listArsip } from "@/services/pendataan/arsip";
import { listJenisPenyu, listSarana } from "@/services/tempat/sarana";
import ArsipView from "./arsip-view";

export const metadata: Metadata = { title: "Arsip Data" };

const TAHUN_AWAL = 2018;

export default async function ArsipPage({
  params,
  searchParams,
}: {
  params: Promise<{ tempat: string }>;
  searchParams: Promise<{ tahun?: string }>;
}) {
  const [{ tempat: tempatId }, query] = await Promise.all([params, searchParams]);
  const user = await requirePermission("arsip:read", tempatId);

  const tahunIni = new Date().getFullYear();
  const diminta = Number(query.tahun);
  const tahun = Number.isInteger(diminta) && diminta >= TAHUN_AWAL && diminta <= tahunIni ? diminta : tahunIni;

  const [rantai, jenisPenyu, zona, inkubator] = await Promise.all([
    listArsip(tempatId, tahun),
    listJenisPenyu(),
    listSarana(tempatId, "zona"),
    listSarana(tempatId, "inkubator"),
  ]);

  return (
    <ArsipView
      tempatId={tempatId}
      tahun={tahun}
      pilihanTahun={Array.from({ length: tahunIni - TAHUN_AWAL + 1 }, (_, i) => tahunIni - i)}
      rantai={rantai}
      pilihan={{ jenisPenyu, zona, inkubator }}
      izin={{ update: can(user, "arsip:update", tempatId), delete: can(user, "arsip:delete", tempatId) }}
    />
  );
}
