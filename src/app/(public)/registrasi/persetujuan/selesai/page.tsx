import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card.component";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Persetujuan Tempat", robots: { index: false, follow: false } };

const RESULTS = {
  disetujui: {
    title: "Tempat Disetujui",
    message: "Tempat konservasi sudah dibuat dan email verifikasi sudah dikirim ke pengelolanya.",
  },
  ditolak: { title: "Pendaftaran Ditolak", message: "Pendaftaran ditolak dan pengelolanya sudah diberi tahu lewat email." },
  gagal: { title: "Gagal", message: "Link tidak valid, sudah dipakai, atau sudah kedaluwarsa." },
} as const;

export default async function SelesaiPage({
  searchParams,
}: {
  searchParams: Promise<{ hasil?: string; email?: string }>;
}) {
  const { hasil, email } = await searchParams;
  const result = RESULTS[hasil as keyof typeof RESULTS] ?? RESULTS.gagal;

  return (
    <section className="min-h-screen flex items-center px-4 py-10">
      <AuthCard title={result.title}>
        <Alert variant={result === RESULTS.gagal ? "destructive" : "default"}>
          <AlertDescription>
            {hasil === "disetujui" && email === "gagal"
              ? "Tempat sudah dibuat, tetapi email verifikasi gagal dikirim. Minta pengelolanya menekan \"Kirim ulang email verifikasi\" di halaman masuk."
              : result.message}
          </AlertDescription>
        </Alert>
      </AuthCard>
    </section>
  );
}
