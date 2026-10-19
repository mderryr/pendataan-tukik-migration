import "server-only";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { gridDisk, latLngToCell } from "h3-js";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import type { SaranaInput } from "@/services/auth/schema";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { MOCK_INKUBATOR, MOCK_JENIS_PENYU, MOCK_ZONA } from "@/services/pendataan/mock";
import { TempatError } from "./errors";
import type { JenisPenyu, JenisSarana, Sarana, Zona } from "./types";
import { selValid, ZONA_MAKS_SEL, ZONA_RESOLUSI } from "./zona-h3";

// Zona pantai & inkubator dipilih di form pendataan. Dikelola pengelola tempat.
const saranaCol = (db: Firestore, tempatId: string, jenis: JenisSarana) =>
  db.collection(COLLECTIONS.tempatKonservasi).doc(tempatId).collection(COLLECTIONS[jenis]);

export async function listSarana(tempatId: string, jenis: JenisSarana): Promise<Sarana[]> {
  if (!FIREBASE_ENABLED) return jenis === "zona" ? MOCK_ZONA : MOCK_INKUBATOR;

  const { db } = await getFirebaseAdmin();
  const snap = await saranaCol(db, tempatId, jenis).orderBy("nama").get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    nama: doc.get("nama") ?? "",
    keterangan: doc.get("keterangan") ?? "",
    aktif: doc.get("aktif") ?? true,
  }));
}

// Mode tampilan: wilayah contoh di sekitar Pantai Kili Kili
function mockWilayah(id: string) {
  const pusat: Record<string, [number, number]> = {
    "zona-barat": [-8.303, 111.466],
    "zona-timur": [-8.3035, 111.4735],
  };
  return pusat[id] ? gridDisk(latLngToCell(...pusat[id], ZONA_RESOLUSI), 2) : [];
}

export async function listZona(tempatId: string): Promise<Zona[]> {
  if (!FIREBASE_ENABLED) return MOCK_ZONA.map((zona) => ({ ...zona, sel: mockWilayah(zona.id) }));

  const { db } = await getFirebaseAdmin();
  const snap = await saranaCol(db, tempatId, "zona").orderBy("nama").get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    nama: doc.get("nama") ?? "",
    keterangan: doc.get("keterangan") ?? "",
    aktif: doc.get("aktif") ?? true,
    sel: (doc.get("sel") as string[] | undefined) ?? [],
  }));
}

// Satu sel hanya boleh milik satu zona
export async function saveZonaWilayah(tempatId: string, zonaId: string, sel: string[]) {
  const unik = [...new Set(sel)];
  if (unik.length > ZONA_MAKS_SEL) throw new TempatError(`Maksimal ${ZONA_MAKS_SEL} sel per zona`);
  if (!unik.every(selValid)) throw new TempatError("Data wilayah tidak valid");

  const { db } = await getFirebaseAdmin();
  const col = saranaCol(db, tempatId, "zona");
  await db.runTransaction(async (tx) => {
    const semua = await tx.get(col);
    const zona = semua.docs.find((doc) => doc.id === zonaId);
    if (!zona) throw new TempatError("Zona tidak ditemukan");

    const dipakai = new Set(semua.docs.filter((doc) => doc.id !== zonaId).flatMap((doc) => doc.get("sel") ?? []));
    if (unik.some((s) => dipakai.has(s))) throw new TempatError("Sebagian wilayah sudah masuk zona lain");

    tx.update(zona.ref, { sel: unik, updatedAt: FieldValue.serverTimestamp() });
  });
}

export async function saveSarana(tempatId: string, jenis: JenisSarana, input: SaranaInput, id?: string) {
  const { db } = await getFirebaseAdmin();
  const data = { ...input, updatedAt: FieldValue.serverTimestamp() };

  if (!id) {
    await saranaCol(db, tempatId, jenis).add({ ...data, aktif: true, createdAt: FieldValue.serverTimestamp() });
    return;
  }
  const ref = saranaCol(db, tempatId, jenis).doc(id);
  if (!(await ref.get()).exists) throw new TempatError("Data tidak ditemukan");
  await ref.update(data);
}

export async function setSaranaAktif(tempatId: string, jenis: JenisSarana, id: string, aktif: boolean) {
  const { db } = await getFirebaseAdmin();
  const ref = saranaCol(db, tempatId, jenis).doc(id);
  if (!(await ref.get()).exists) throw new TempatError("Data tidak ditemukan");
  await ref.update({ aktif, updatedAt: FieldValue.serverTimestamp() });
}

// Koleksi penyu/{id} diisi owner lewat `pnpm seed:firebase`
export async function listJenisPenyu(): Promise<JenisPenyu[]> {
  if (!FIREBASE_ENABLED) return MOCK_JENIS_PENYU;

  const { db } = await getFirebaseAdmin();
  const snap = await db.collection(COLLECTIONS.penyu).orderBy("name").get();
  return snap.docs.map((doc) => ({
    id: doc.id,
    nama: doc.get("name") ?? doc.id,
    namaIlmiah: doc.get("scientificName") ?? "",
  }));
}
