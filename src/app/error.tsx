"use client";

import ErrorView from "@/components/error/error-view.component";
import type { ErrorHalaman } from "@/services/error/klasifikasi";

// Error di luar layout publik/dashboard, mis. saat layout (public) atau /{tempat} gagal.
export default function ErrorBoundary({
  error,
  retry,
  reset,
}: {
  error: ErrorHalaman;
  retry?: () => void;
  reset: () => void;
}) {
  return <ErrorView error={error} retry={retry ?? reset} className="min-h-screen" />;
}
