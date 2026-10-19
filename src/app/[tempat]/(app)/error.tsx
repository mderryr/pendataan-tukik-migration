"use client";

import ErrorView from "@/components/error/error-view.component";
import type { ErrorHalaman } from "@/services/error/klasifikasi";

// Error di halaman aplikasi tempat — sidebar tetap tampil, jadi bisa pindah menu.
export default function ErrorBoundary({
  error,
  retry,
  reset,
}: {
  error: ErrorHalaman;
  retry?: () => void;
  reset: () => void;
}) {
  return <ErrorView error={error} retry={retry ?? reset} className="min-h-[60vh]" />;
}
