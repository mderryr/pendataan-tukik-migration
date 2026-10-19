"use client";

import "./globals.css";
import ErrorView from "@/components/error/error-view.component";
import type { ErrorHalaman } from "@/services/error/klasifikasi";

// Menggantikan root layout saat root layout sendiri gagal, jadi harus punya <html> & <body>.
export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: ErrorHalaman;
  retry?: () => void;
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-background text-foreground">
        <title>Terjadi Kesalahan | Si Penyu</title>
        <ErrorView error={error} retry={retry ?? reset} className="min-h-screen" />
      </body>
    </html>
  );
}
