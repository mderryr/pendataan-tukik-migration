"use server";

import { revalidatePath } from "next/cache";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import type { ActionResult } from "@/services/auth/actions";
import type { Permission } from "@/services/auth/roles";
import { requirePermission } from "@/services/auth/session";
import { TempatError } from "@/services/tempat/errors";
import { bukaKembaliRantai, hapusRantai } from "./arsip";

// Mode tampilan: tidak ada yang disimpan.
async function run(tempatId: string, permission: Permission, task: () => Promise<unknown>): Promise<ActionResult> {
  await requirePermission(permission, tempatId);
  if (!FIREBASE_ENABLED) return { ok: true };

  try {
    await task();
    revalidatePath(`/${tempatId}/arsip`);
    return { ok: true };
  } catch (error) {
    if (error instanceof TempatError) return { ok: false, message: error.message };
    console.error("Gagal mengelola arsip:", error);
    return { ok: false, message: "Terjadi kesalahan, silakan coba lagi" };
  }
}

export async function bukaKembaliAction(tempatId: string, rantaiId: string) {
  return run(tempatId, "arsip:update", () => bukaKembaliRantai(tempatId, rantaiId));
}

export async function hapusArsipAction(tempatId: string, rantaiId: string) {
  return run(tempatId, "arsip:delete", () => hapusRantai(tempatId, rantaiId));
}
