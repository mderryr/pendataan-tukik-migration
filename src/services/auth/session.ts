import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { getAnggota } from "@/services/tempat/anggota";
import { getJabatanPermissions } from "@/services/tempat/jabatan";
import { homePath, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";
import { MOCK_SESSION_PREFIX, mockUserFromSession } from "./mock";
import { can, isRole, isTempatAdmin, type Permission, type Role } from "./roles";

export interface SessionUser {
  uid: string;
  email: string | null;
  role: Role | null;
  tempatId: string | null;
}

async function setSessionCookie(value: string) {
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

// idToken harus baru (login < 5 menit lalu), syarat dari createSessionCookie.
export async function createSession(idToken: string) {
  const { auth: adminAuth } = await getFirebaseAdmin();
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
  await setSessionCookie(sessionCookie);
}

export async function createMockSession(role: Role) {
  await setSessionCookie(MOCK_SESSION_PREFIX + role);
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

// Sesi yang dicabut (mis. setelah ganti password → "keluarkan perangkat lain") langsung ditolak.
// Pengecekan ini memanggil server Firebase, jadi hasilnya di-cache per request (layout + page cukup sekali).
export const getCurrentUser = cache(async (checkRevoked = true): Promise<SessionUser | null> => {
  const sessionCookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  if (!FIREBASE_ENABLED) return mockUserFromSession(sessionCookie);

  try {
    const { auth: adminAuth } = await getFirebaseAdmin();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: isRole(decoded.role) ? decoded.role : null,
      tempatId: typeof decoded.tempatId === "string" ? decoded.tempatId : null,
    };
  } catch {
    return null;
  }
});

export async function requireUser(checkRevoked = true): Promise<SessionUser> {
  const user = await getCurrentUser(checkRevoked);
  if (!user || !user.role) redirect("/login");
  return user;
}

// Owner boleh membuka semua tempat; selain itu hanya tempatnya sendiri.
export async function requireTempatAccess(tempatId: string): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "owner" && user.tempatId !== tempatId) redirect(homePath(user));
  return user;
}

// Halaman/aksi kelola anggota & jabatan
export async function requireTempatAdmin(tempatId: string): Promise<SessionUser> {
  const user = await requireTempatAccess(tempatId);
  if (!isTempatAdmin(user, tempatId)) redirect(`/${tempatId}/dashboard`);
  return user;
}

// Izin anggota "custom" berasal dari jabatannya: users/{uid}.jabatanId → jabatan.permissions.
// Dibaca dari database (bukan cookie) supaya perubahan jabatan langsung berlaku.
export async function getTempatAccess(tempatId: string): Promise<SessionUser & { permissions: string[] }> {
  const user = await requireTempatAccess(tempatId);
  const permissions =
    user.role === "custom"
      ? await getJabatanPermissions(tempatId, (await getAnggota(user.uid))?.jabatanId ?? null)
      : [];
  return { ...user, permissions };
}

export async function requirePermission(permission: Permission, tempatId: string) {
  const user = await getTempatAccess(tempatId);
  if (!can(user, permission, tempatId)) redirect(`/${tempatId}/dashboard`);
  return user;
}
