"use client";

import { useState } from "react";
import { Download, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Laporan } from "@/services/laporan/hitung";
import useStatusUtils from "@/utils/status-toast.utils";

// PDF dibuat di browser dari JSON laporan; @react-pdf baru dimuat saat tombol ditekan.
export default function LaporanUnduh({ laporan, size = "default" }: { laporan: Laporan; size?: "default" | "sm" }) {
  const { onCustomMessage } = useStatusUtils();
  const [memproses, setMemproses] = useState(false);
  const namaFile = `${laporan.id}-v${laporan.versi}`;

  const unduhPdf = async () => {
    setMemproses(true);
    try {
      const [{ pdf }, { default: LaporanPdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./laporan-pdf"),
      ]);
      const blob = await pdf(<LaporanPdf laporan={laporan} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `${namaFile}.pdf` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      onCustomMessage({ Message: "PDF gagal dibuat, silakan coba lagi", tittle: "Gagal", variant: "destructive" });
    } finally {
      setMemproses(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size={size} onClick={unduhPdf} disabled={memproses}>
        <Download className="mr-2 h-4 w-4" />
        {memproses ? "Membuat PDF..." : "Unduh PDF"}
      </Button>
      <Button size={size} variant="outline" asChild>
        <a href={`/api/laporan/${laporan.id}`} download={`${namaFile}.json`}>
          <FileJson className="mr-2 h-4 w-4" />
          Data (JSON)
        </a>
      </Button>
    </div>
  );
}
