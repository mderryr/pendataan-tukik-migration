import type { Metadata } from "next";
import PasswordForm from "@/components/akun/password-form.component";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTempatAccess } from "@/services/auth/session";

export const metadata: Metadata = { title: "Ganti Password" };

export default async function PasswordPage({ params }: { params: Promise<{ tempat: string }> }) {
  await requireTempatAccess((await params).tempat);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ganti Password</CardTitle>
        <CardDescription>Masukkan password sekarang untuk memastikan ini memang kamu.</CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordForm />
      </CardContent>
    </Card>
  );
}
