import "server-only";
import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { MOCK_TEMPAT } from "@/services/auth/mock";
import type { TempatProfilInput } from "@/services/auth/schema";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { TempatError } from "./errors";
import type { Tempat } from "./types";

// Dipetakan manual supaya hanya data biasa (tanpa Timestamp) yang dikirim ke komponen client.
function toTempat(doc: DocumentSnapshot): Tempat {
  const data = doc.data() ?? {};
  return {
    id: doc.id,
    nama: data.nama ?? doc.id,
    alamat: data.alamat ?? "",
    kabupaten: data.kabupaten ?? "",
    provinsi: data.provinsi ?? "",
    kontak: data.kontak ?? "",
    keterangan: data.keterangan ?? "",
    lokasi: { lat: data.lokasi?.lat ?? 0, lng: data.lokasi?.lng ?? 0 },
    foto: data.foto ?? null,
    aktif: data.aktif ?? true,
  };
}

export async function getTempat(id: string): Promise<Tempat | null> {
  if (!FIREBASE_ENABLED) return MOCK_TEMPAT.find((tempat) => tempat.id === id) ?? null;

  const { db } = await getFirebaseAdmin();
  const doc = await db.collection(COLLECTIONS.tempatKonservasi).doc(id).get();
  return doc.exists ? toTempat(doc) : null;
}

export async function listTempat(): Promise<Tempat[]> {
  if (!FIREBASE_ENABLED) return MOCK_TEMPAT;

  const { db } = await getFirebaseAdmin();
  const snap = await db.collection(COLLECTIONS.tempatKonservasi).orderBy("nama").get();
  return snap.docs.map(toTempat);
}

// Slug (= ID & alamat link) tidak bisa diubah
export async function updateTempat(id: string, input: TempatProfilInput) {
  const { db } = await getFirebaseAdmin();
  const ref = db.collection(COLLECTIONS.tempatKonservasi).doc(id);
  if (!(await ref.get()).exists) throw new TempatError("Tempat tidak ditemukan");
  await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
}
