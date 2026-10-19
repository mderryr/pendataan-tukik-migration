"use server";

import { revalidatePath } from "next/cache";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import type { ActionResult } from "@/services/auth/actions";
import {
  anggotaSchema,
  jabatanSchema,
  saranaSchema,
  tempatProfilSchema,
  type AnggotaInput,
  type JabatanInput,
  type SaranaInput,
  type TempatProfilInput,
} from "@/services/auth/schema";
import { requireTempatAdmin } from "@/services/auth/session";
import { createAnggota, setAnggotaAktif, setAnggotaJabatan } from "./anggota";
import { TempatError } from "./errors";
import { deleteJabatan, saveJabatan } from "./jabatan";
import { saveSarana, saveZonaWilayah, setSaranaAktif } from "./sarana";
import { getTempat, updateTempat } from "./tempat";
import { SARANA, type JenisSarana } from "./types";

// Semua aksi di sini hanya untuk admin tempat (atau owner).
// Mode tampilan: validasi tetap jalan, tapi tidak ada yang disimpan.
async function run(tempatId: string, task: () => Promise<unknown>): Promise<ActionResult> {
  await requireTempatAdmin(tempatId);
  if (!FIREBASE_ENABLED) return { ok: true };

  try {
    await task();
    revalidatePath(`/${tempatId}`, "layout");
    return { ok: true };
  } catch (error) {
    if (error instanceof TempatError) return { ok: false, message: error.message };
    console.error("Gagal mengelola tempat:", error);
    return { ok: false, message: "Terjadi kesalahan, silakan coba lagi" };
  }
}

export async function createAnggotaAction(tempatId: string, input: AnggotaInput): Promise<ActionResult> {
  const parsed = anggotaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  return run(tempatId, async () => {
    const tempat = await getTempat(tempatId);
    if (!tempat) throw new TempatError("Tempat tidak ditemukan");
    await createAnggota(tempatId, tempat.nama, parsed.data);
  });
}

export async function setAnggotaAktifAction(tempatId: string, uid: string, aktif: boolean) {
  return run(tempatId, () => setAnggotaAktif(tempatId, uid, aktif));
}

export async function setAnggotaJabatanAction(tempatId: string, uid: string, jabatanId: string) {
  return run(tempatId, () => setAnggotaJabatan(tempatId, uid, jabatanId));
}

export async function saveJabatanAction(
  tempatId: string,
  input: JabatanInput,
  jabatanId?: string
): Promise<ActionResult> {
  const parsed = jabatanSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  return run(tempatId, () => saveJabatan(tempatId, parsed.data, jabatanId));
}

export async function deleteJabatanAction(tempatId: string, jabatanId: string) {
  return run(tempatId, () => deleteJabatan(tempatId, jabatanId));
}

export async function updateTempatAction(tempatId: string, input: TempatProfilInput): Promise<ActionResult> {
  const parsed = tempatProfilSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid" };

  return run(tempatId, () => updateTempat(tempatId, parsed.data));
}

export async function saveSaranaAction(
  tempatId: string,
  jenis: JenisSarana,
  input: SaranaInput,
  id?: string
): Promise<ActionResult> {
  const parsed = saranaSchema.safeParse(input);
  if (!parsed.success || !SARANA.includes(jenis)) {
    return { ok: false, message: parsed.error?.issues[0]?.message ?? "Data tidak valid" };
  }
  return run(tempatId, () => saveSarana(tempatId, jenis, parsed.data, id));
}

export async function setSaranaAktifAction(tempatId: string, jenis: JenisSarana, id: string, aktif: boolean) {
  if (!SARANA.includes(jenis)) return { ok: false as const, message: "Data tidak valid" };
  return run(tempatId, () => setSaranaAktif(tempatId, jenis, id, aktif));
}

export async function saveZonaWilayahAction(tempatId: string, zonaId: string, sel: string[]): Promise<ActionResult> {
  if (!Array.isArray(sel) || !sel.every((s) => typeof s === "string")) {
    return { ok: false, message: "Data wilayah tidak valid" };
  }
  return run(tempatId, () => saveZonaWilayah(tempatId, zonaId, sel));
}
