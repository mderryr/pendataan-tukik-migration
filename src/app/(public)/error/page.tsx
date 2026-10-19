import type { Metadata } from "next";
import ErrorView from "@/components/error/error-view.component";

export const metadata: Metadata = { title: "Terjadi Kesalahan" };

// Halaman /error untuk redirect manual, mis. /error?pesan=...&kode=...
export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ pesan?: string; kode?: string }>;
}) {
  const { pesan, kode } = await searchParams;
  // Objek biasa (bukan instance Error) supaya bisa dikirim ke komponen client
  const error = { name: "Error", message: pesan?.slice(0, 500) ?? "Terjadi kesalahan", digest: kode?.slice(0, 100) };

  return <ErrorView error={error} className="min-h-[60vh]" />;
}
