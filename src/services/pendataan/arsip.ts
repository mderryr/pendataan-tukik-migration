import "server-only";
import { FieldValue, type Firestore, type Query } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { TempatError } from "@/services/tempat/errors";
import { MOCK_CATATAN } from "./mock";
import { CATATAN_INFO, JENIS_CATATAN, dataToCatatan, susunRantai, type Catatan, type JenisCatatan } from "./rantai";

// Arsip = rantai pendataan yang sudah selesai (arsip: true). Dibaca & dikelola lewat server.
// Ke depan, data lama (database sebelumnya / impor Excel) juga masuk ke koleksi yang sama.

const koleksi = (db: Firestore, tempatId: string, jenis: JenisCatatan) =>
  db.collection(COLLECTIONS.tempatKonservasi).doc(tempatId).collection(CATATAN_INFO[jenis].koleksi);

async function ambilSemua(db: Firestore, tempatId: string, filter: (q: Query) => Query): Promise<Catatan[]> {
  const hasil = await Promise.all(
    JENIS_CATATAN.map(async (jenis) => {
      const snap = await filter(koleksi(db, tempatId, jenis)).get();
      return snap.docs.map((doc) => dataToCatatan(jenis, doc.id, doc.data()));
    })
  );
  return hasil.flat();
}

export async function listArsip(tempatId: string, tahun: number) {
  if (!FIREBASE_ENABLED) return susunRantai(MOCK_CATATAN.filter((c) => c.arsip && c.arsipTahun === tahun));

  const { db } = await getFirebaseAdmin();
  return susunRantai(await ambilSemua(db, tempatId, (q) => q.where("arsipTahun", "==", tahun)));
}

// Semua catatan (berjalan & arsip) dengan tanggal dari ≤ tanggal < sampai, untuk laporan
export async function catatanPeriode(tempatId: string, dari: string, sampai: string): Promise<Catatan[]> {
  if (!FIREBASE_ENABLED) return MOCK_CATATAN.filter((c) => c.tanggal >= dari && c.tanggal < sampai);

  const { db } = await getFirebaseAdmin();
  return ambilSemua(db, tempatId, (q) => q.where("tanggal", ">=", dari).where("tanggal", "<", sampai));
}

async function refsRantai(db: Firestore, tempatId: string, rantaiId: string) {
  const snaps = await Promise.all(
    JENIS_CATATAN.map((jenis) => koleksi(db, tempatId, jenis).where("rantaiId", "==", rantaiId).get())
  );
  const docs = snaps.flatMap((snap) => snap.docs);
  if (!docs.length || docs.some((doc) => doc.get("arsip") !== true)) {
    throw new TempatError("Data arsip tidak ditemukan");
  }
  return docs.map((doc) => doc.ref);
}

// Dikembalikan ke Pendataan supaya bisa diperbaiki/dilanjutkan
export async function bukaKembaliRantai(tempatId: string, rantaiId: string) {
  const { db } = await getFirebaseAdmin();
  const batch = db.batch();
  for (const ref of await refsRantai(db, tempatId, rantaiId)) {
    batch.update(ref, { arsip: false, arsipTahun: null, updatedAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
}

export async function hapusRantai(tempatId: string, rantaiId: string) {
  const { db } = await getFirebaseAdmin();
  const batch = db.batch();
  for (const ref of await refsRantai(db, tempatId, rantaiId)) batch.delete(ref);
  await batch.commit();
}
