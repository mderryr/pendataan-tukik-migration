import type { Metadata } from "next";
import { requireTempatAdmin } from "@/services/auth/session";
import { listAnggota } from "@/services/tempat/anggota";
import { listJabatan } from "@/services/tempat/jabatan";
import JabatanManager from "./jabatan-manager";

export const metadata: Metadata = { title: "Jabatan" };

export default async function JabatanPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);

  const [jabatan, anggota] = await Promise.all([listJabatan(tempatId), listAnggota(tempatId)]);
  const jumlahAnggota = Object.fromEntries(
    jabatan.map((j) => [j.id, anggota.filter((a) => a.jabatanId === j.id).length])
  );

  return <JabatanManager tempatId={tempatId} jabatan={jabatan} jumlahAnggota={jumlahAnggota} />;
}
