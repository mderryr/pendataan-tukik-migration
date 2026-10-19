import type { Metadata } from "next";
import FotoUpload from "@/components/akun/foto-upload.component";
import ProfilForm from "@/components/akun/profil-form.component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfil } from "@/services/akun/akun";
import { requireTempatAccess } from "@/services/auth/session";

export const metadata: Metadata = { title: "Data Diri" };

export default async function DataDiriPage({ params }: { params: Promise<{ tempat: string }> }) {
  const profil = await getProfil(await requireTempatAccess((await params).tempat));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Data Diri</CardTitle>
        <CardDescription>
          Nama tampil di sidebar, sebagai penanggung jawab pendataan, dan penerbit laporan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FotoUpload nama={profil.nama} foto={profil.foto} />
        <ProfilForm profil={profil} />
      </CardContent>
    </Card>
  );
}
