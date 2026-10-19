import "server-only";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { MOCK_JABATAN } from "@/services/auth/mock";
import { isPermission } from "@/services/auth/roles";
import type { JabatanInput } from "@/services/auth/schema";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { TempatError } from "./errors";
import type { Jabatan } from "./types";

// Jabatan = kumpulan izin buatan admin tempat (mis. "Wakil Pengelola").
// Anggota role "custom" mendapat izin dari jabatannya.
const jabatanCol = (db: Firestore, tempatId: string) =>
  db.collection(COLLECTIONS.tempatKonservasi).doc(tempatId).collection(COLLECTIONS.jabatan);

export async function listJabatan(tempatId: string): Promise<Jabatan[]> {
  if (!FIREBASE_ENABLED) return MOCK_JABATAN;

  const { db } = await getFirebaseAdmin();
  const snap = await jabatanCol(db, tempatId).orderBy("nama").get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    nama: doc.get("nama") as string,
    permissions: ((doc.get("permissions") as string[] | undefined) ?? []).filter(isPermission),
  }));
}

export async function getJabatanPermissions(tempatId: string, jabatanId: string | null): Promise<string[]> {
  if (!jabatanId) return [];
  if (!FIREBASE_ENABLED) return MOCK_JABATAN.find((j) => j.id === jabatanId)?.permissions ?? [];

  const { db } = await getFirebaseAdmin();
  const doc = await jabatanCol(db, tempatId).doc(jabatanId).get();
  return (doc.get("permissions") as string[] | undefined) ?? [];
}

export async function jabatanExists(tempatId: string, jabatanId: string) {
  const { db } = await getFirebaseAdmin();
  return (await jabatanCol(db, tempatId).doc(jabatanId).get()).exists;
}

export async function saveJabatan(tempatId: string, input: JabatanInput, jabatanId?: string) {
  const { db } = await getFirebaseAdmin();
  const data = { nama: input.nama, permissions: input.permissions, updatedAt: FieldValue.serverTimestamp() };

  if (!jabatanId) {
    await jabatanCol(db, tempatId).add({ ...data, createdAt: FieldValue.serverTimestamp() });
    return;
  }
  if (!(await jabatanExists(tempatId, jabatanId))) throw new TempatError("Jabatan tidak ditemukan");
  await jabatanCol(db, tempatId).doc(jabatanId).update(data);
}

export async function deleteJabatan(tempatId: string, jabatanId: string) {
  const { db } = await getFirebaseAdmin();
  const dipakai = await db
    .collection(COLLECTIONS.users)
    .where("tempatId", "==", tempatId)
    .where("jabatanId", "==", jabatanId)
    .count()
    .get();

  const jumlah = dipakai.data().count;
  if (jumlah > 0) throw new TempatError(`Masih dipakai ${jumlah} anggota. Pindahkan dulu jabatan mereka.`);
  await jabatanCol(db, tempatId).doc(jabatanId).delete();
}
