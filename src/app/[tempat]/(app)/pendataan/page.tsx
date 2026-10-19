import type { Metadata } from "next";
import { can } from "@/services/auth/roles";
import { requirePermission } from "@/services/auth/session";
import { getAnggota } from "@/services/tempat/anggota";
import { listJenisPenyu, listSarana } from "@/services/tempat/sarana";
import PendataanBoard from "./pendataan-board";

export const metadata: Metadata = { title: "Pendataan" };

export default async function PendataanPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  const user = await requirePermission("pendataan:read", tempatId);

  const [profil, jenisPenyu, zona, inkubator] = await Promise.all([
    getAnggota(user.uid),
    listJenisPenyu(),
    listSarana(tempatId, "zona"),
    listSarana(tempatId, "inkubator"),
  ]);

  return (
    <PendataanBoard
      tempatId={tempatId}
      penulis={{ uid: user.uid, nama: profil?.nama ?? user.email ?? "" }}
      izin={{
        create: can(user, "pendataan:create", tempatId),
        update: can(user, "pendataan:update", tempatId),
        delete: can(user, "pendataan:delete", tempatId),
      }}
      pilihan={{ jenisPenyu, zona, inkubator }}
    />
  );
}
