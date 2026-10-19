"use client";

import { useRouter } from "next/navigation";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import type { ActionResult } from "@/services/auth/actions";
import useStatusUtils from "@/utils/status-toast.utils";

// Menjalankan server action, menampilkan toast hasilnya, lalu memuat ulang data halaman.
export function useActionToast() {
  const router = useRouter();
  const { onCustomMessage } = useStatusUtils();

  return async (action: Promise<ActionResult>, pesanBerhasil: string) => {
    const result = await action.catch(
      (): ActionResult => ({ ok: false, message: "Tidak bisa terhubung. Periksa koneksi internet kamu." })
    );

    if (result.ok) {
      onCustomMessage({
        Message: FIREBASE_ENABLED ? pesanBerhasil : `${pesanBerhasil} (mode tampilan, tidak disimpan)`,
        tittle: "Berhasil",
        variant: "default",
      });
      router.refresh();
    } else {
      onCustomMessage({ Message: result.message, tittle: "Gagal", variant: "destructive" });
    }
    return result.ok;
  };
}
