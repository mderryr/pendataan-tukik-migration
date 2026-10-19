import "server-only";
import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import sharp from "sharp";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { IdentityToolkitError, signInWithPassword } from "@/services/auth/identity-toolkit";
import { createSession, type SessionUser } from "@/services/auth/session";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { sendMail } from "@/services/mail/mailer";
import { gantiEmailTemplate } from "@/services/mail/templates";
import { getAnggota } from "@/services/tempat/anggota";
import { requireEnvVar } from "@/utils/env-reading.utils";
import { FOTO_MAKS_BYTE, FOTO_TIPE, type GantiEmailInput, type GantiPasswordInput, type ProfilInput } from "./schema";

// Error yang pesannya aman ditampilkan ke user
export class AkunError extends Error {}

// Data akun milik user yang sedang login (dokumen users/{uid} + email dari Firebase Auth)
export interface Profil {
  nama: string;
  username: string;
  email: string;
  noHp: string;
  foto: string | null;
}

export async function getProfil(user: SessionUser): Promise<Profil> {
  const anggota = await getAnggota(user.uid);
  // Firebase Auth jadi acuan email; mode tampilan memakai email anggota contoh
  const email = (FIREBASE_ENABLED ? user.email : null) ?? anggota?.email ?? user.email ?? "";

  // Email diganti lewat link konfirmasi (di luar aplikasi): samakan data Firestore saat login berikutnya
  if (FIREBASE_ENABLED && anggota && user.email && anggota.email !== user.email) {
    const { db } = await getFirebaseAdmin();
    await Promise.all([
      db.collection(COLLECTIONS.users).doc(user.uid).update({ email: user.email }),
      anggota.username && db.collection(COLLECTIONS.usernames).doc(anggota.username).update({ email: user.email }),
    ]).catch((error) => console.error("Gagal menyamakan email:", error));
  }

  return {
    nama: anggota?.nama ?? email,
    username: anggota?.username ?? "",
    email,
    noHp: anggota?.noHp ?? "",
    foto: anggota?.foto ?? null,
  };
}

const userRef = async (uid: string) => (await getFirebaseAdmin()).db.collection(COLLECTIONS.users).doc(uid);

export async function updateProfil(uid: string, input: ProfilInput) {
  const { auth: adminAuth } = await getFirebaseAdmin();
  await (await userRef(uid)).set({ ...input, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await adminAuth.updateUser(uid, { displayName: input.nama });
}

// ---------- Foto profil (Firebase Storage: profil/{uid}.webp) ----------

const pathFoto = (uid: string) => `profil/${uid}.webp`;
const bucket = async () => (await getFirebaseAdmin()).storage.bucket(requireEnvVar("STORAGEBUCKER"));

export async function updateFoto(uid: string, file: File) {
  if (!FOTO_TIPE.includes(file.type)) throw new AkunError("Foto harus JPG, PNG, atau WebP");
  if (file.size > FOTO_MAKS_BYTE) throw new AkunError("Ukuran foto terlalu besar");

  let gambar: Buffer;
  try {
    gambar = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate() // ikuti orientasi EXIF dari kamera HP
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AkunError("File bukan gambar yang valid");
  }

  // Token unduhan Firebase Storage: URL tetap bisa dibuka tanpa login, dan berganti setiap upload (cache aman)
  const token = randomUUID();
  const b = await bucket();
  await b.file(pathFoto(uid)).save(gambar, {
    contentType: "image/webp",
    metadata: { cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } },
  });
  const url = `https://firebasestorage.googleapis.com/v0/b/${b.name}/o/${encodeURIComponent(pathFoto(uid))}?alt=media&token=${token}`;
  await (await userRef(uid)).set({ foto: url, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function hapusFoto(uid: string) {
  await (await bucket()).file(pathFoto(uid)).delete({ ignoreNotFound: true });
  await (await userRef(uid)).set({ foto: null, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

// ---------- Password & email ----------

async function cekPassword(email: string, password: string) {
  try {
    return await signInWithPassword(email, password);
  } catch (error) {
    if (error instanceof IdentityToolkitError) {
      if (error.code === "TOO_MANY_ATTEMPTS_TRY_LATER") {
        throw new AkunError("Terlalu banyak percobaan. Coba lagi beberapa menit lagi.");
      }
      throw new AkunError("Password sekarang salah");
    }
    throw error;
  }
}

// Perangkat lain dikeluarkan (refresh token dicabut); perangkat ini dibuatkan sesi baru.
export async function gantiPassword(user: SessionUser, input: GantiPasswordInput) {
  if (!user.email) throw new AkunError("Akun ini tidak punya email");
  await cekPassword(user.email, input.passwordLama);

  const { auth: adminAuth } = await getFirebaseAdmin();
  await adminAuth.updateUser(user.uid, { password: input.passwordBaru });
  await adminAuth.revokeRefreshTokens(user.uid);

  // Sesi baru harus dibuat setelah detik pencabutan, kalau tidak ikut dianggap dicabut
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const { idToken } = await signInWithPassword(user.email, input.passwordBaru);
  await createSession(idToken);
}

// Email baru berlaku setelah link konfirmasi yang dikirim ke email baru diklik
export async function mintaGantiEmail(user: SessionUser, nama: string, input: GantiEmailInput) {
  if (!user.email) throw new AkunError("Akun ini tidak punya email");
  if (input.emailBaru === user.email) throw new AkunError("Email baru sama dengan email sekarang");
  await cekPassword(user.email, input.password);

  const { auth: adminAuth } = await getFirebaseAdmin();
  const dipakai = await adminAuth.getUserByEmail(input.emailBaru).then(
    () => true,
    (error) => {
      if (error?.code === "auth/user-not-found") return false;
      throw error;
    }
  );
  if (dipakai) throw new AkunError("Email ini sudah dipakai akun lain");

  const link = await adminAuth.generateVerifyAndChangeEmailLink(user.email, input.emailBaru);
  await sendMail({ to: input.emailBaru, ...gantiEmailTemplate(nama, input.emailBaru, link) });
}
