"use server";

import { revalidatePath } from "next/cache";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import type { ActionResult } from "@/services/auth/actions";
import { requireUser } from "@/services/auth/session";
import { AkunError, getProfil, gantiPassword, hapusFoto, mintaGantiEmail, updateFoto, updateProfil } from "./akun";
import {
  gantiEmailSchema,
  gantiPasswordSchema,
  profilSchema,
  type GantiEmailInput,
  type GantiPasswordInput,
  type ProfilInput,
} from "./schema";

// Semua aksi di sini untuk akun milik user yang sedang login.
// Mode tampilan: validasi tetap jalan, tapi tidak ada yang disimpan.
async function run(task: () => Promise<unknown>): Promise<ActionResult> {
  if (!FIREBASE_ENABLED) return { ok: true };
  try {
    await task();
    revalidatePath("/", "layout"); // nama & foto tampil di sidebar semua halaman
    return { ok: true };
  } catch (error) {
    if (error instanceof AkunError) return { ok: false, message: error.message };
    console.error("Gagal mengubah akun:", error);
    return { ok: false, message: "Terjadi kesalahan, silakan coba lagi" };
  }
}

const tidakValid = (error: { issues: { message: string }[] }): ActionResult => ({
  ok: false,
  message: error.issues[0]?.message ?? "Data tidak valid",
});

export async function updateProfilAction(input: ProfilInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profilSchema.safeParse(input);
  if (!parsed.success) return tidakValid(parsed.error);
  return run(() => updateProfil(user.uid, parsed.data));
}

// FormData: field "foto" (sudah dikecilkan di browser)
export async function updateFotoAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const file = formData.get("foto");
  if (!(file instanceof File)) return { ok: false, message: "Pilih foto dulu" };
  return run(() => updateFoto(user.uid, file));
}

export async function hapusFotoAction(): Promise<ActionResult> {
  const user = await requireUser();
  return run(() => hapusFoto(user.uid));
}

export async function gantiPasswordAction(input: GantiPasswordInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = gantiPasswordSchema.safeParse(input);
  if (!parsed.success) return tidakValid(parsed.error);
  return run(() => gantiPassword(user, parsed.data));
}

export async function gantiEmailAction(input: GantiEmailInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = gantiEmailSchema.safeParse(input);
  if (!parsed.success) return tidakValid(parsed.error);
  return run(async () => mintaGantiEmail(user, (await getProfil(user)).nama, parsed.data));
}
