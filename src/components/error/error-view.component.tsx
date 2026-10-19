"use client";

// Tampilan error bersama untuk error.tsx di tiap lapisan dan global-error.tsx.
// Tidak bergantung pada provider (toast, react-query) supaya tetap jalan saat root layout gagal.
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronDown, Copy, LogIn, RefreshCw, RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  detailError,
  klasifikasiError,
  pesanTersembunyi,
  type ErrorHalaman,
} from "@/services/error/klasifikasi";
import { cn } from "@/utils/cn-tools";

export default function ErrorView({
  error,
  retry,
  className,
}: {
  error: ErrorHalaman;
  retry?: () => void; // dari error boundary Next.js; tanpa ini tombolnya memuat ulang halaman
  className?: string;
}) {
  const [online, setOnline] = useState(true);
  const [info, setInfo] = useState({ halaman: "-", waktu: "-", perangkat: "-" });
  const [tersalin, setTersalin] = useState(false);

  useEffect(() => {
    console.error(error);
    setOnline(navigator.onLine);
    setInfo({
      halaman: window.location.pathname + window.location.search,
      waktu: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" }),
      perangkat: navigator.userAgent,
    });
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [error]);

  const penjelasan = klasifikasiError(error, online);
  const detail = detailError(error, info);
  const Ikon = penjelasan.jenis === "offline" ? WifiOff : AlertTriangle;

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(detail);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 2000);
    } catch {
      // Clipboard bisa diblokir browser; detail tetap bisa diblok & disalin manual
    }
  };

  const muatUlang = () => window.location.reload();

  return (
    <div className={cn("flex w-full items-center justify-center px-4 py-12", className)}>
      <div className="w-full max-w-lg space-y-6">
        <div className="space-y-3 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Ikon className="size-7" />
          </span>
          <h1 className="text-2xl font-semibold">{penjelasan.judul}</h1>
          <p className="text-muted-foreground">{penjelasan.penjelasan}</p>
        </div>

        <ul className="space-y-2 rounded-md border bg-muted/40 p-4 text-sm">
          {penjelasan.saran.map((saran) => (
            <li key={saran} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {saran}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap justify-center gap-2">
          {penjelasan.aksi === "masuk" ? (
            <Button asChild>
              <Link href={`/login?next=${encodeURIComponent(info.halaman)}`}>
                <LogIn className="mr-2 size-4" />
                Masuk Lagi
              </Link>
            </Button>
          ) : penjelasan.aksi === "muat-ulang" || !retry ? (
            <Button onClick={muatUlang}>
              <RefreshCw className="mr-2 size-4" />
              Muat Ulang Halaman
            </Button>
          ) : (
            <Button onClick={retry}>
              <RotateCcw className="mr-2 size-4" />
              Coba Lagi
            </Button>
          )}
          <Button variant="outline" onClick={() => window.history.back()}>
            Kembali
          </Button>
          <Button variant="ghost" asChild>
            <a href="/">Beranda</a>
          </Button>
        </div>

        <details className="group rounded-md border text-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium">
            Detail error
            <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 border-t px-4 py-3">
            {pesanTersembunyi(error) && (
              <p className="text-xs text-muted-foreground">
                Pesan lengkap error dari server disembunyikan demi keamanan. Pengelola sistem bisa melihatnya di log
                server dengan mencari kode di bawah.
              </p>
            )}
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded bg-muted p-3 font-mono text-xs">
              {detail}
              {process.env.NODE_ENV !== "production" && error.stack ? `\n\n${error.stack}` : ""}
            </pre>
            <Button size="sm" variant="outline" onClick={salin}>
              {tersalin ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />}
              {tersalin ? "Tersalin" : "Salin detail"}
            </Button>
          </div>
        </details>
      </div>
    </div>
  );
}
