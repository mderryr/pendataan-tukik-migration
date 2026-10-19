import "server-only";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { MOCK_TEMPAT } from "@/services/auth/mock";
import { getFirebaseAdmin } from "@/services/firebase/admin";
import { catatanPeriode } from "@/services/pendataan/arsip";
import { MOCK_CATATAN, MOCK_JENIS_PENYU } from "@/services/pendataan/mock";
import { listJenisPenyu } from "@/services/tempat/sarana";
import type { Tempat } from "@/services/tempat/types";
import {
  buatIsiLaporan,
  FORMAT_LAPORAN,
  judulLaporan,
  laporanId,
  rentangPeriode,
  type IsiLaporan,
  type Laporan,
  type Periode,
  urutPeriode,
} from "./hitung";

function mockLaporan(periode: Periode, versi: number): Laporan {
  const tempat = MOCK_TEMPAT[0];
  const { dari, sampai } = rentangPeriode(periode);
  const catatan = MOCK_CATATAN.filter((c) => c.tanggal >= dari && c.tanggal < sampai);
  return {
    id: laporanId(tempat.id, periode),
    format: FORMAT_LAPORAN,
    tempatId: tempat.id,
    tempatNama: tempat.nama,
    kabupaten: tempat.kabupaten,
    provinsi: tempat.provinsi,
    periode,
    judul: judulLaporan(periode),
    isi: buatIsiLaporan(catatan, periode, MOCK_JENIS_PENYU),
    versi,
    diterbitkanPada: "2026-10-02T09:00:00.000Z",
    diterbitkanOleh: "Sri Wahyuni",
  };
}

const MOCK_LAPORAN = () => [
  mockLaporan({ jenis: "bulanan", tahun: 2026, bulan: 9 }, 2),
  mockLaporan({ jenis: "bulanan", tahun: 2026, bulan: 8 }, 1),
  mockLaporan({ jenis: "tahunan", tahun: 2025 }, 1),
];

function toLaporan(doc: DocumentSnapshot): Laporan {
  const { diterbitkanPada, ...data } = doc.data() as Laporan & { diterbitkanPada: unknown };
  return { ...data, id: doc.id, diterbitkanPada: String(diterbitkanPada) };
}

// Dihitung langsung dari data mentah (berjalan & arsip), belum disimpan
export async function hitungLaporan(tempatId: string, periode: Periode): Promise<IsiLaporan> {
  const { dari, sampai } = rentangPeriode(periode);
  const [catatan, jenisPenyu] = await Promise.all([catatanPeriode(tempatId, dari, sampai), listJenisPenyu()]);
  return buatIsiLaporan(catatan, periode, jenisPenyu);
}

export async function getLaporan(id: string): Promise<Laporan | null> {
  if (!FIREBASE_ENABLED) return MOCK_LAPORAN().find((laporan) => laporan.id === id) ?? null;

  const { db } = await getFirebaseAdmin();
  const doc = await db.collection(COLLECTIONS.laporan).doc(id).get();
  return doc.exists ? toLaporan(doc) : null;
}

export async function listLaporanTempat(tempatId: string): Promise<Laporan[]> {
  if (!FIREBASE_ENABLED) return MOCK_LAPORAN().filter((laporan) => laporan.tempatId === tempatId);

  const { db } = await getFirebaseAdmin();
  const snap = await db.collection(COLLECTIONS.laporan).where("tempatId", "==", tempatId).get();
  return snap.docs.map(toLaporan).sort(urutPeriode);
}

// Halaman publik /laporan
export async function listLaporanTerbaru(limit = 60): Promise<Laporan[]> {
  if (!FIREBASE_ENABLED) return MOCK_LAPORAN();

  const { db } = await getFirebaseAdmin();
  const snap = await db.collection(COLLECTIONS.laporan).orderBy("diterbitkanPada", "desc").limit(limit).get();
  return snap.docs.map(toLaporan);
}

// Menerbitkan (ulang) laporan periode ini. Laporan lama ditimpa dan versinya naik,
// jadi data yang tertinggal bisa disusulkan kapan saja.
export async function terbitkanLaporan(tempat: Tempat, periode: Periode, penerbit: string): Promise<Laporan> {
  const isi = await hitungLaporan(tempat.id, periode);
  const { db } = await getFirebaseAdmin();
  const ref = db.collection(COLLECTIONS.laporan).doc(laporanId(tempat.id, periode));

  return db.runTransaction(async (tx) => {
    const lama = await tx.get(ref);
    const laporan: Omit<Laporan, "id"> = {
      format: FORMAT_LAPORAN,
      tempatId: tempat.id,
      tempatNama: tempat.nama,
      kabupaten: tempat.kabupaten,
      provinsi: tempat.provinsi,
      periode,
      judul: judulLaporan(periode),
      isi,
      versi: ((lama.get("versi") as number | undefined) ?? 0) + 1,
      diterbitkanPada: new Date().toISOString(),
      diterbitkanOleh: penerbit,
    };
    tx.set(ref, laporan);
    return { ...laporan, id: ref.id };
  });
}
