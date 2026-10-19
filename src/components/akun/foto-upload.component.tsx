"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/useActionToast";
import { hapusFotoAction, updateFotoAction } from "@/services/akun/actions";
import { FOTO_TIPE } from "@/services/akun/schema";
import { kecilkanGambar } from "@/utils/gambar.utils";
import useStatusUtils from "@/utils/status-toast.utils";
import FotoProfil from "./foto-profil.component";

export default function FotoUpload({ nama, foto }: { nama: string; foto: string | null }) {
  const runAction = useActionToast();
  const { onCustomMessage } = useStatusUtils();
  const input = useRef<HTMLInputElement>(null);
  const [pratinjau, setPratinjau] = useState<string | null>(null); // tampil langsung sebelum server selesai
  const [proses, setProses] = useState(false);

  const pilih = async (file: File | undefined) => {
    if (!file) return;
    if (!FOTO_TIPE.includes(file.type)) {
      onCustomMessage({ Message: "Foto harus JPG, PNG, atau WebP", tittle: "Gagal", variant: "destructive" });
      return;
    }
    setProses(true);
    try {
      const kecil = await kecilkanGambar(file);
      setPratinjau(URL.createObjectURL(kecil));
      const data = new FormData();
      data.set("foto", new File([kecil], "foto.webp", { type: kecil.type }));
      if (!(await runAction(updateFotoAction(data), "Foto profil diganti"))) setPratinjau(null);
    } catch {
      onCustomMessage({ Message: "Foto gagal diproses, coba foto lain", tittle: "Gagal", variant: "destructive" });
    } finally {
      setProses(false);
      if (input.current) input.current.value = "";
    }
  };

  const hapus = async () => {
    setProses(true);
    if (await runAction(hapusFotoAction(), "Foto profil dihapus")) setPratinjau(null);
    setProses(false);
  };

  const tampil = pratinjau ?? foto;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="group relative rounded-full"
        aria-label="Ganti foto profil"
        disabled={proses}
      >
        <FotoProfil nama={nama} foto={tampil} className="size-20 text-lg" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5" />
        </span>
      </button>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()} disabled={proses}>
            {proses ? "Memproses..." : tampil ? "Ganti Foto" : "Unggah Foto"}
          </Button>
          {tampil && (
            <Button type="button" size="sm" variant="ghost" onClick={hapus} disabled={proses}>
              Hapus
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Foto dipotong persegi.</p>
      </div>
      <input
        ref={input}
        type="file"
        accept={FOTO_TIPE.join(",")}
        className="hidden"
        onChange={(e) => pilih(e.target.files?.[0])}
      />
    </div>
  );
}
