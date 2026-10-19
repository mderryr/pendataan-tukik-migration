import "server-only";
import { randomBytes } from "crypto";
import { cache } from "react";
import { FieldValue, type DocumentSnapshot, type Firestore } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { MOCK_ANGGOTA } from "@/services/auth/mock";
import { isRole } from "@/services/auth/roles";
import type { AnggotaInput } from "@/services/auth/schema";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { sendMail } from "@/services/mail/mailer";
import { akunAnggotaTemplate } from "@/services/mail/templates";
import { TempatError } from "./errors";
import { jabatanExists } from "./jabatan";
import type { Anggota } from "./types";

function toAnggota(doc: DocumentSnapshot): Anggota {
  const data = doc.data() ?? {};
  return {
    uid: doc.id,
    nama: data.nama ?? "",
    username: data.username ?? "",
    email: data.email ?? "",
    role: isRole(data.role) ? data.role : "custom",
    jabatanId: data.jabatanId ?? null,
    aktif: data.aktif ?? true,
    noHp: data.noHp ?? "",
    foto: data.foto ?? null,
  };
}

// Di-cache per request: dipakai layout, halaman, dan profil akun dalam satu render
export const getAnggota = cache(async (uid: string): Promise<Anggota | null> => {
  if (!FIREBASE_ENABLED) return MOCK_ANGGOTA.find((anggota) => anggota.uid === uid) ?? null;

  const { db } = await getFirebaseAdmin();
  const doc = await db.collection(COLLECTIONS.users).doc(uid).get();
  return doc.exists ? toAnggota(doc) : null;
});

export async function listAnggota(tempatId: string): Promise<Anggota[]> {
  if (!FIREBASE_ENABLED) return MOCK_ANGGOTA;

  const { db } = await getFirebaseAdmin();
  const snap = await db.collection(COLLECTIONS.users).where("tempatId", "==", tempatId).get();
  return snap.docs
    .map(toAnggota)
    .sort((a, b) => Number(b.role === "admin_tempat") - Number(a.role === "admin_tempat") || a.nama.localeCompare(b.nama));
}

// Anggota dibuat tanpa password yang diketahui siapa pun. Anggota membuat passwordnya
// sendiri lewat link "lupa password" yang dikirim ke emailnya, jadi orang yang bisa
// masuk pasti pemilik email itu — karena itu emailVerified langsung true.
export async function createAnggota(tempatId: string, tempatNama: string, input: AnggotaInput) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();

  if (!(await jabatanExists(tempatId, input.jabatanId))) throw new TempatError("Jabatan tidak ditemukan");

  const usernameRef = db.collection(COLLECTIONS.usernames).doc(input.username);
  if ((await usernameRef.get()).exists) throw new TempatError("Username sudah dipakai");

  let uid: string;
  try {
    ({ uid } = await adminAuth.createUser({
      email: input.email,
      emailVerified: true,
      displayName: input.nama,
      password: randomBytes(24).toString("base64url"),
    }));
  } catch (error: any) {
    if (error?.code === "auth/email-already-exists") throw new TempatError("Email sudah terdaftar");
    throw error;
  }

  try {
    await db.runTransaction(async (tx) => {
      if ((await tx.get(usernameRef)).exists) throw new TempatError("Username sudah dipakai");
      tx.create(usernameRef, { uid, email: input.email });
      tx.create(db.collection(COLLECTIONS.users).doc(uid), {
        nama: input.nama,
        username: input.username,
        email: input.email,
        role: "custom",
        tempatId,
        jabatanId: input.jabatanId,
        aktif: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
    await adminAuth.setCustomUserClaims(uid, { role: "custom", tempatId });
  } catch (error) {
    await Promise.allSettled([adminAuth.deleteUser(uid), db.collection(COLLECTIONS.users).doc(uid).delete()]);
    throw error;
  }

  // Kalau email gagal, anggota tetap bisa memakai "lupa password" di halaman masuk.
  const emailSent = await adminAuth
    .generatePasswordResetLink(input.email)
    .then((link) => sendMail({ to: input.email, ...akunAnggotaTemplate({ ...input, tempatNama, link }) }))
    .then(() => true)
    .catch((error) => {
      console.error("Gagal mengirim email akun anggota:", error);
      return false;
    });

  return { emailSent };
}

// Admin tempat hanya boleh mengubah anggota "custom" di tempatnya sendiri.
async function getManagedAnggota(db: Firestore, tempatId: string, uid: string) {
  const ref = db.collection(COLLECTIONS.users).doc(uid);
  const doc = await ref.get();
  if (!doc.exists || doc.get("tempatId") !== tempatId || doc.get("role") !== "custom") {
    throw new TempatError("Anggota tidak ditemukan");
  }
  return ref;
}

export async function setAnggotaAktif(tempatId: string, uid: string, aktif: boolean) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();
  const ref = await getManagedAnggota(db, tempatId, uid);

  await adminAuth.updateUser(uid, { disabled: !aktif });
  // Keluarkan dari semua perangkat
  if (!aktif) await adminAuth.revokeRefreshTokens(uid);
  await ref.update({ aktif });
}

export async function setAnggotaJabatan(tempatId: string, uid: string, jabatanId: string) {
  const { db } = await getFirebaseAdmin();
  const ref = await getManagedAnggota(db, tempatId, uid);

  if (!(await jabatanExists(tempatId, jabatanId))) throw new TempatError("Jabatan tidak ditemukan");
  await ref.update({ jabatanId });
}
