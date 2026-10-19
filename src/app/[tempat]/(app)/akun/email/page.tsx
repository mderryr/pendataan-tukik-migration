import type { Metadata } from "next";
import EmailForm from "@/components/akun/email-form.component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfil } from "@/services/akun/akun";
import { requireTempatAccess } from "@/services/auth/session";

export const metadata: Metadata = { title: "Ganti Email" };

export default async function EmailPage({ params }: { params: Promise<{ tempat: string }> }) {
  const profil = await getProfil(await requireTempatAccess((await params).tempat));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ganti Email</CardTitle>
        <CardDescription>Email dipakai untuk masuk dan menerima link atur ulang password.</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailForm emailSekarang={profil.email} />
      </CardContent>
    </Card>
  );
}
