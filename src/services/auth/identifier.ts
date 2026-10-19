import "server-only";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { COLLECTIONS } from "./constants";

// Input login bisa email atau username:
//  - mengandung "@"  → dianggap email
//  - selain itu      → cari email-nya di usernames/{username}
export async function resolveEmail(identifier: string): Promise<string | null> {
  const value = identifier.trim().toLowerCase();
  if (value.includes("@")) return value;

  const { auth: adminAuth, db: adminDb } = await getFirebaseAdmin();
  const snap = await adminDb.collection(COLLECTIONS.usernames).doc(value).get();
  if (!snap.exists) return null;

  // Email bisa berganti lewat link konfirmasi (menu Akun), jadi Firebase Auth yang jadi acuan
  const uid = snap.get("uid") as string | undefined;
  const email = uid ? await adminAuth.getUser(uid).then((user) => user.email, () => undefined) : undefined;
  return email ?? (snap.get("email") as string | undefined) ?? null;
}
