"use server";

import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { sendMail } from "@/services/mail/mailer";
import { resetPasswordTemplate, verifikasiEmailTemplate } from "@/services/mail/templates";
import { resolveEmail } from "./identifier";
import { IdentityToolkitError, signInWithPassword } from "./identity-toolkit";
import { homePath } from "./constants";
import { mockLoginError, mockRoleFromIdentifier, mockUser } from "./mock";
import { approveRegistration, createRegistrationRequest, RegistrationError, rejectRegistration } from "./registration";
import { isRole } from "./roles";
import {
  forgotPasswordSchema,
  loginSchema,
  registerTempatSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterTempatInput,
} from "./schema";
import { clearSession, createMockSession, createSession, getCurrentUser } from "./session";

export type LoginErrorCode = "invalid" | "unverified" | "disabled" | "too_many";

export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; message: string; code?: LoginErrorCode };

const LOGIN_MESSAGES: Record<LoginErrorCode, string> = {
  invalid: "Email/username atau password salah",
  unverified: "Email kamu belum diverifikasi. Cek kotak masuk (atau folder spam) email kamu.",
  disabled: "Akun belum disetujui atau sedang dinonaktifkan",
  too_many: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
};

const fail = (code: LoginErrorCode) => ({ ok: false as const, code, message: LOGIN_MESSAGES[code] });

type AuthResult =
  | { ok: true; idToken: string; decoded: DecodedIdToken; email: string }
  | ReturnType<typeof fail>;

// Pesan error sengaja dibuat sama untuk username tidak ada & password salah,
// supaya orang luar tidak bisa menebak akun mana yang terdaftar.
async function authenticate(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("invalid");

  const email = await resolveEmail(parsed.data.identifier);
  if (!email) return fail("invalid");

  try {
    const { idToken } = await signInWithPassword(email, parsed.data.password);
    const { auth: adminAuth } = await getFirebaseAdmin();
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { ok: true, idToken, decoded, email };
  } catch (error) {
    if (!(error instanceof IdentityToolkitError)) throw error;
    if (error.code === "USER_DISABLED") return fail("disabled");
    if (error.code === "TOO_MANY_ATTEMPTS_TRY_LATER") return fail("too_many");
    return fail("invalid");
  }
}

// Server membuat session cookie (untuk halaman server) dan custom token
// (untuk login Firebase di browser, dibutuhkan Firestore offline).
// redirectTo = halaman awal user: /admin (owner) atau /{tempatId}/dashboard
export async function loginAction(
  input: LoginInput
): Promise<ActionResult<{ customToken: string; redirectTo: string }>> {
  if (!FIREBASE_ENABLED) {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) return fail("invalid");
    const error = mockLoginError(parsed.data.identifier);
    if (error) return fail(error);
    const role = mockRoleFromIdentifier(parsed.data.identifier);
    await createMockSession(role);
    return { ok: true, customToken: "", redirectTo: homePath(mockUser(role)) };
  }

  const result = await authenticate(input);
  if (!result.ok) return result;

  if (!result.decoded.email_verified) return fail("unverified");
  if (!isRole(result.decoded.role)) return fail("disabled");

  await createSession(result.idToken);
  const { auth: adminAuth } = await getFirebaseAdmin();
  const customToken = await adminAuth.createCustomToken(result.decoded.uid);
  const tempatId = typeof result.decoded.tempatId === "string" ? result.decoded.tempatId : null;
  return { ok: true, customToken, redirectTo: homePath({ role: result.decoded.role, tempatId }) };
}

// Minta password lagi supaya tombol ini tidak bisa dipakai untuk spam email orang lain.
export async function resendVerificationAction(input: LoginInput): Promise<ActionResult> {
  if (!FIREBASE_ENABLED) return { ok: true };

  const result = await authenticate(input);
  if (!result.ok) return result;
  if (result.decoded.email_verified) return { ok: true };

  const { auth: adminAuth } = await getFirebaseAdmin();
  const user = await adminAuth.getUser(result.decoded.uid);
  const link = await adminAuth.generateEmailVerificationLink(result.email);
  await sendMail({ to: result.email, ...verifikasiEmailTemplate(user.displayName ?? "", link) });
  return { ok: true };
}

// Selalu berhasil dari sisi user, supaya tidak membocorkan email mana yang terdaftar.
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Isi email atau username" };
  if (!FIREBASE_ENABLED) return { ok: true };

  const email = await resolveEmail(parsed.data.identifier);
  if (email) {
    try {
      const { auth: adminAuth } = await getFirebaseAdmin();
      const link = await adminAuth.generatePasswordResetLink(email);
      await sendMail({ to: email, ...resetPasswordTemplate(link) });
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found") console.error("Gagal mengirim reset password:", error);
    }
  }
  return { ok: true };
}

// Pendaftaran tempat konservasi baru (pendaftar menjadi pengelola / admin_tempat)
export async function registerAction(input: RegisterTempatInput): Promise<ActionResult> {
  const parsed = registerTempatSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  if (!FIREBASE_ENABLED) return { ok: true };

  try {
    await createRegistrationRequest(parsed.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof RegistrationError) return { ok: false, message: error.message };
    console.error("Gagal mendaftar:", error);
    return { ok: false, message: "Terjadi kesalahan, silakan coba lagi" };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

// Dipakai saat cookie server masih ada tapi login Firebase di browser hilang
// (mis. cache browser dibersihkan).
export async function getClientTokenAction(): Promise<ActionResult<{ customToken: string }>> {
  const user = await getCurrentUser();
  if (!user?.role || !FIREBASE_ENABLED) return { ok: false, message: "Sesi berakhir" };
  const { auth: adminAuth } = await getFirebaseAdmin();
  return { ok: true, customToken: await adminAuth.createCustomToken(user.uid) };
}

export async function approveRegistrationAction(formData: FormData) {
  if (!FIREBASE_ENABLED) redirect("/registrasi/persetujuan/selesai?hasil=disetujui");

  const id = String(formData.get("id") ?? "");
  const token = String(formData.get("token") ?? "");

  let emailSent: boolean;
  try {
    ({ emailSent } = await approveRegistration(id, token));
  } catch (error) {
    if (!(error instanceof RegistrationError)) console.error("Gagal menyetujui:", error);
    redirect("/registrasi/persetujuan/selesai?hasil=gagal");
  }
  redirect(`/registrasi/persetujuan/selesai?hasil=disetujui${emailSent ? "" : "&email=gagal"}`);
}

export async function rejectRegistrationAction(formData: FormData) {
  if (!FIREBASE_ENABLED) redirect("/registrasi/persetujuan/selesai?hasil=ditolak");

  const id = String(formData.get("id") ?? "");
  const token = String(formData.get("token") ?? "");

  try {
    await rejectRegistration(id, token);
  } catch (error) {
    if (!(error instanceof RegistrationError)) console.error("Gagal menolak:", error);
    redirect("/registrasi/persetujuan/selesai?hasil=gagal");
  }
  redirect("/registrasi/persetujuan/selesai?hasil=ditolak");
}
