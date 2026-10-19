import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { FieldValue, Timestamp, type Firestore, type Transaction } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { requireEnvVar } from "@/utils/env-reading.utils";
import { sendMail } from "@/services/mail/mailer";
import {
  permintaanRegistrasiTemplate,
  registrasiDitolakTemplate,
  verifikasiEmailTemplate,
} from "@/services/mail/templates";
import type { TempatProfil } from "@/services/tempat/types";
import { COLLECTIONS, REGISTRATION_TTL_MS } from "./constants";
import { MOCK_REGISTRATION } from "./mock";
import type { RegisterTempatInput } from "./schema";

// Pendaftaran TEMPAT konservasi baru:
// 1. Pengelola mengisi data tempat + akunnya → akun Firebase dibuat dalam keadaan disabled,
//    username dipesan, dan link persetujuan (token rahasia) dikirim ke OWNER_EMAIL.
// 2. Owner membuka link → setujui / tolak.
// 3. Disetujui → dokumen tempatKonservasi/{slug} dibuat, pengelola menjadi admin_tempat,
//    email verifikasi dikirim. Anggota lain ditambahkan admin_tempat dari dashboard.

export interface RegistrationView {
  uid: string;
  pengelola: { nama: string; username: string; email: string };
  tempat: TempatProfil & { slug: string };
}

interface RegistrationRequest extends RegistrationView {
  status: "pending" | "approved" | "rejected";
  tokenHash?: string;
  expiresAt: Timestamp;
}

export class RegistrationError extends Error {}

const requests = (db: Firestore) => db.collection(COLLECTIONS.registrationRequests);
const usernames = (db: Firestore) => db.collection(COLLECTIONS.usernames);
const tempatCol = (db: Firestore) => db.collection(COLLECTIONS.tempatKonservasi);

const appUrl = () => requireEnvVar("APP_URL").replace(/\/$/, "");

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenMatches(token: string, tokenHash: string | undefined) {
  if (!tokenHash) return false;
  return timingSafeEqual(Buffer.from(hashToken(token)), Buffer.from(tokenHash));
}

const isExpired = (data: RegistrationRequest) => data.expiresAt.toMillis() <= Date.now();

function isUsable(data: RegistrationRequest | undefined, token: string): data is RegistrationRequest {
  return !!data && data.status === "pending" && !isExpired(data) && tokenMatches(token, data.tokenHash);
}

async function deleteRegistration(uid: string, username: string) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();
  await Promise.allSettled([
    adminAuth.deleteUser(uid),
    usernames(db).doc(username).delete(),
    requests(db).doc(uid).delete(),
  ]);
}

// Permintaan yang tidak disetujui dalam 48 jam dilepas, supaya email/username/slug bisa dipakai lagi.
async function releaseIfExpired(uid: string) {
  const { db } = await getFirebaseAdmin();
  const data = (await requests(db).doc(uid).get()).data() as RegistrationRequest | undefined;
  if (!data || data.status !== "pending" || !isExpired(data)) return;
  await deleteRegistration(uid, data.pengelola.username);
}

export async function createRegistrationRequest(input: RegisterTempatInput) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();

  if ((await tempatCol(db).doc(input.slug).get()).exists) {
    throw new RegistrationError("Alamat link sudah dipakai tempat lain");
  }
  const sameSlug = await requests(db).where("tempat.slug", "==", input.slug).where("status", "==", "pending").get();
  for (const doc of sameSlug.docs) {
    const data = doc.data() as RegistrationRequest;
    if (!isExpired(data)) throw new RegistrationError("Alamat link sedang dipakai pendaftaran lain");
    await deleteRegistration(data.uid, data.pengelola.username);
  }

  const takenUsername = await usernames(db).doc(input.username).get();
  if (takenUsername.exists) await releaseIfExpired(takenUsername.get("uid"));

  const existingUser = await adminAuth.getUserByEmail(input.email).catch(() => null);
  if (existingUser) await releaseIfExpired(existingUser.uid);

  let uid: string;
  try {
    ({ uid } = await adminAuth.createUser({
      email: input.email,
      password: input.password,
      displayName: input.nama,
      disabled: true,
    }));
  } catch (error: any) {
    if (error?.code === "auth/email-already-exists") throw new RegistrationError("Email sudah terdaftar");
    throw error;
  }

  const view: RegistrationView = {
    uid,
    pengelola: { nama: input.nama, username: input.username, email: input.email },
    tempat: {
      slug: input.slug,
      nama: input.namaTempat,
      alamat: input.alamat,
      kabupaten: input.kabupaten,
      provinsi: input.provinsi,
      kontak: input.kontak,
      keterangan: input.keterangan,
      lokasi: input.lokasi,
    },
  };
  const token = randomBytes(32).toString("base64url");
  const usernameRef = usernames(db).doc(input.username);

  try {
    await db.runTransaction(async (tx) => {
      if ((await tx.get(usernameRef)).exists) throw new RegistrationError("Username sudah dipakai");
      tx.create(usernameRef, { uid, email: input.email });
      tx.create(requests(db).doc(uid), {
        ...view,
        status: "pending",
        tokenHash: hashToken(token),
        expiresAt: Timestamp.fromMillis(Date.now() + REGISTRATION_TTL_MS),
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    await adminAuth.deleteUser(uid).catch(() => {});
    throw error;
  }

  try {
    const link = `${appUrl()}/registrasi/persetujuan?id=${uid}&token=${token}`;
    await sendMail({ to: requireEnvVar("OWNER_EMAIL"), ...permintaanRegistrasiTemplate({ ...view, link }) });
  } catch (error) {
    // Tanpa email ke owner, permintaan ini tidak akan pernah diproses.
    await deleteRegistration(uid, input.username);
    console.error("Gagal mengirim email persetujuan:", error);
    throw new RegistrationError("Gagal mengirim pendaftaran, silakan coba lagi nanti");
  }
}

export async function getPendingRegistration(id: string, token: string): Promise<RegistrationView | null> {
  if (!FIREBASE_ENABLED) return id === "demo" && token === "demo" ? MOCK_REGISTRATION : null;

  const { db } = await getFirebaseAdmin();
  const data = (await requests(db).doc(id).get()).data() as RegistrationRequest | undefined;
  return isUsable(data, token) ? { uid: data.uid, pengelola: data.pengelola, tempat: data.tempat } : null;
}

// Status diubah di dalam transaksi supaya satu link tidak bisa diproses dua kali.
// beforeWrite dipanggil setelah semua pengecekan, untuk menambah tulisan lain di transaksi yang sama.
async function consumeRequest(
  id: string,
  token: string,
  status: "approved" | "rejected",
  beforeWrite?: (tx: Transaction, data: RegistrationRequest) => Promise<void>
) {
  const { db } = await getFirebaseAdmin();
  return db.runTransaction(async (tx) => {
    const ref = requests(db).doc(id);
    const data = (await tx.get(ref)).data() as RegistrationRequest | undefined;
    if (!isUsable(data, token)) throw new RegistrationError("Link tidak valid atau sudah kedaluwarsa");
    await beforeWrite?.(tx, data);
    tx.update(ref, { status, tokenHash: FieldValue.delete(), processedAt: FieldValue.serverTimestamp() });
    return data;
  });
}

export async function approveRegistration(id: string, token: string) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();

  const data = await consumeRequest(id, token, "approved", async (tx, request) => {
    const { slug, ...profil } = request.tempat;
    const tempatRef = tempatCol(db).doc(slug);
    if ((await tx.get(tempatRef)).exists) throw new RegistrationError("Alamat link sudah dipakai tempat lain");
    tx.create(tempatRef, {
      ...profil,
      foto: null,
      aktif: true,
      pengelolaUid: request.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
  });

  const { uid, pengelola, tempat } = data;
  await adminAuth.updateUser(uid, { disabled: false });
  await adminAuth.setCustomUserClaims(uid, { role: "admin_tempat", tempatId: tempat.slug });
  await db.collection(COLLECTIONS.users).doc(uid).set({
    ...pengelola,
    role: "admin_tempat",
    tempatId: tempat.slug,
    jabatanId: null,
    aktif: true,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Kalau gagal, pengelola tetap bisa meminta kirim ulang dari halaman masuk.
  const emailSent = await adminAuth
    .generateEmailVerificationLink(pengelola.email)
    .then((link) => sendMail({ to: pengelola.email, ...verifikasiEmailTemplate(pengelola.nama, link) }))
    .then(() => true)
    .catch((error) => {
      console.error("Gagal mengirim email verifikasi:", error);
      return false;
    });

  return { emailSent };
}

export async function rejectRegistration(id: string, token: string) {
  const { auth: adminAuth, db } = await getFirebaseAdmin();
  const { uid, pengelola, tempat } = await consumeRequest(id, token, "rejected");

  await Promise.allSettled([adminAuth.deleteUser(uid), usernames(db).doc(pengelola.username).delete()]);
  await sendMail({ to: pengelola.email, ...registrasiDitolakTemplate(pengelola.nama, tempat.nama) }).catch((error) =>
    console.error("Gagal mengirim email penolakan:", error)
  );
}
