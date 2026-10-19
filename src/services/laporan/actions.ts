"use server";

import { revalidatePath } from "next/cache";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import type { ActionResult } from "@/services/auth/actions";
import { requirePermission } from "@/services/auth/session";
import { getAnggota } from "@/services/tempat/anggota";
import { getTempat } from "@/services/tempat/tempat";
import { bacaPeriode, type Periode } from "./hitung";
import { terbitkanLaporan } from "./laporan";

export async function terbitkanLaporanAction(tempatId: string, input: Periode): Promise<ActionResult> {
  const user = await requirePermission("laporan:create", tempatId);
  const periode = bacaPeriode(input);
  if (!periode) return { ok: false, message: "Periode tidak valid" };
  if (!FIREBASE_ENABLED) return { ok: true };

  try {
    const tempat = await getTempat(tempatId);
    if (!tempat) return { ok: false, message: "Tempat tidak ditemukan" };
    const penerbit = (await getAnggota(user.uid))?.nama ?? user.email ?? "Pengelola";

    const laporan = await terbitkanLaporan(tempat, periode, penerbit);
    revalidatePath(`/${tempatId}/laporan`);
    revalidatePath("/laporan");
    revalidatePath(`/laporan/${laporan.id}`);
    return { ok: true };
  } catch (error) {
    console.error("Gagal menerbitkan laporan:", error);
    return { ok: false, message: "Terjadi kesalahan, silakan coba lagi" };
  }
}
