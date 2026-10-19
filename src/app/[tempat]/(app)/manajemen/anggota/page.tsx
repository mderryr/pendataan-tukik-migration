import type { Metadata } from "next";
import { requireTempatAdmin } from "@/services/auth/session";
import { listAnggota } from "@/services/tempat/anggota";
import { listJabatan } from "@/services/tempat/jabatan";
import AnggotaManager from "./anggota-manager";

export const metadata: Metadata = { title: "Anggota" };

export default async function AnggotaPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);

  const [anggota, jabatan] = await Promise.all([listAnggota(tempatId), listJabatan(tempatId)]);
  return <AnggotaManager tempatId={tempatId} anggota={anggota} jabatan={jabatan} />;
}
