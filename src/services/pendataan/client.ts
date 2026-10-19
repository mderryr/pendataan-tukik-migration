// Pendataan ditulis langsung lewat Firestore di browser (bukan server action), supaya tetap bisa
// dipakai di pantai saat sinyal hilang: tulisan masuk antrean IndexedDB dan terkirim otomatis
// ketika online lagi. Izin dijaga oleh firestore.rules.
//
// Mode tampilan (FIREBASE_ENABLED = false): memakai data contoh di memori, hilang saat dimuat ulang.
import { FirebaseError } from "firebase/app";
import { collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { getFirebaseDb } from "@/env/firebase.connect";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { COLLECTIONS } from "@/services/auth/constants";
import { MOCK_CATATAN } from "./mock";
import {
  CATATAN_INFO,
  JENIS_CATATAN,
  catatanPertama,
  catatanToData,
  dataToCatatan,
  jenisPenyuRantai,
  periksaRantai,
  rantaiKosong,
  selesai,
  semuaCatatan,
  susunRantai,
  tanggalMulai,
  type Catatan,
  type JenisCatatan,
  type Rantai,
  type Tahap,
} from "./rantai";
import type { CatatanInput } from "./schema";

// Error yang pesannya aman ditampilkan ke user
export class PendataanError extends Error {}

export interface KonteksPendataan {
  tempatId: string;
  penulis: { uid: string; nama: string };
  // Dipanggil kalau tulisan yang sempat mengantre (offline) akhirnya ditolak server
  onGagalNanti: (pesan: string) => void;
}

export interface HasilSimpan {
  antre: boolean; // belum terkirim karena offline/sinyal lemah
  diarsipkan: boolean; // rantai selesai dan pindah ke arsip
}

const koleksiRef = (tempatId: string, jenis: JenisCatatan) =>
  collection(getFirebaseDb(), COLLECTIONS.tempatKonservasi, tempatId, CATATAN_INFO[jenis].koleksi);

// ---------- Mode tampilan ----------

let mockData = MOCK_CATATAN.filter((c) => !c.arsip);
const mockListeners = new Set<() => void>();
const kunci = (c: Catatan) => `${c.jenis}/${c.id}`;

// ---------- Membaca (realtime) ----------

// Semua rantai yang belum diarsipkan. `belumTerkirim` = ID rantai yang masih menunggu sinyal.
export function subscribeRantaiAktif(
  tempatId: string,
  onData: (rantai: Rantai[], belumTerkirim: Set<string>) => void,
  onError: (pesan: string) => void
): () => void {
  if (!FIREBASE_ENABLED) {
    const emit = () => onData(susunRantai(mockData), new Set());
    mockListeners.add(emit);
    emit();
    return () => mockListeners.delete(emit);
  }

  const perJenis = new Map<JenisCatatan, { catatan: Catatan[]; tertunda: string[] }>();
  const emit = () => {
    if (perJenis.size < JENIS_CATATAN.length) return; // tunggu semua koleksi termuat
    const isi = [...perJenis.values()];
    onData(susunRantai(isi.flatMap((v) => v.catatan)), new Set(isi.flatMap((v) => v.tertunda)));
  };

  const unsubscribes = JENIS_CATATAN.map((jenis) =>
    onSnapshot(
      query(koleksiRef(tempatId, jenis), where("arsip", "==", false)),
      { includeMetadataChanges: true },
      (snap) => {
        const catatan = snap.docs.map((d) => dataToCatatan(jenis, d.id, d.data()));
        const tertunda = snap.docs.filter((d) => d.metadata.hasPendingWrites).map((d) => d.get("rantaiId") ?? d.id);
        perJenis.set(jenis, { catatan, tertunda });
        emit();
      },
      (error) => onError(pesanError(error))
    )
  );
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
}

// ---------- Menulis ----------

export function pesanError(error: unknown) {
  if (error instanceof PendataanError) return error.message;
  if (error instanceof FirebaseError && error.code === "permission-denied") {
    return "Kamu tidak punya izin untuk melakukan ini";
  }
  console.error("Gagal menyimpan pendataan:", error);
  return "Terjadi kesalahan, silakan coba lagi";
}

// Menyimpan perubahan satu rantai: sebelum → sesudah. Rantai yang selesai otomatis diarsipkan.
async function simpanRantai(
  ctx: KonteksPendataan,
  sebelum: Rantai,
  sesudah: Rantai,
  paksaArsip = false
): Promise<HasilSimpan> {
  const masalah = periksaRantai(sesudah);
  if (masalah) throw new PendataanError(masalah);

  const arsip = paksaArsip || selesai(sesudah);
  const arsipTahun = arsip ? Number(tanggalMulai(sesudah).slice(0, 4)) : null;
  const akhir = semuaCatatan(sesudah).map((c) => ({ ...c, arsip, arsipTahun }));
  const awal = new Map(semuaCatatan(sebelum).map((c) => [kunci(c), c]));

  const dihapus = [...awal.values()].filter((c) => !akhir.some((a) => kunci(a) === kunci(c)));
  const baru = akhir.filter((c) => !awal.has(kunci(c)));
  const berubah = akhir.filter((c) => {
    const lama = awal.get(kunci(c));
    return lama && JSON.stringify(catatanToData(lama)) !== JSON.stringify(catatanToData(c));
  });

  if (!FIREBASE_ENABLED) {
    const hapus = new Set([...dihapus, ...berubah].map(kunci));
    mockData = [...mockData.filter((c) => !hapus.has(kunci(c))), ...berubah, ...baru].filter((c) => !c.arsip);
    mockListeners.forEach((emit) => emit());
    return { antre: false, diarsipkan: arsip };
  }

  const batch = writeBatch(getFirebaseDb());
  dihapus.forEach((c) => batch.delete(doc(koleksiRef(ctx.tempatId, c.jenis), c.id)));
  baru.forEach((c) =>
    batch.set(doc(koleksiRef(ctx.tempatId, c.jenis), c.id), { ...catatanToData(c), createdAt: serverTimestamp() })
  );
  berubah.forEach((c) =>
    batch.update(doc(koleksiRef(ctx.tempatId, c.jenis), c.id), { ...catatanToData(c), updatedAt: serverTimestamp() })
  );

  // Tulisan langsung tampil di layar (cache lokal). Kalau server belum menjawab dalam beberapa
  // detik (offline/sinyal lemah), anggap mengantre dan laporkan belakangan kalau ditolak.
  const commit = batch.commit();
  const hasil = await Promise.race([
    commit.then(() => "tersimpan" as const),
    new Promise<"antre">((resolve) => setTimeout(() => resolve("antre"), navigator.onLine ? 4000 : 0)),
  ]).catch((error) => {
    throw new PendataanError(pesanError(error));
  });
  if (hasil === "antre") commit.catch((error) => ctx.onGagalNanti(pesanError(error)));
  return { antre: hasil === "antre", diarsipkan: arsip };
}

function dariInput(input: CatatanInput) {
  return {
    tanggal: input.tanggal,
    jumlah: input.jumlah,
    keterangan: input.keterangan,
    bertelur: input.bertelur,
    jumlahTidakMenetas: input.jumlahTidakMenetas,
    zonaId: input.zonaId,
    inkubatorId: input.inkubatorId,
  };
}

function idBaru(tempatId: string, jenis: JenisCatatan) {
  return FIREBASE_ENABLED ? doc(koleksiRef(tempatId, jenis)).id : crypto.randomUUID();
}

function pasang(r: Rantai, c: Catatan): Rantai {
  if (c.jenis === "mati" || c.jenis === "dilepas") {
    return { ...r, [c.jenis]: [...r[c.jenis].filter((x) => x.id !== c.id), c] };
  }
  return { ...r, [c.jenis]: c };
}

// rantai = null → rantai baru (input mulai dari tahap mana saja)
export async function tambahCatatan(
  ctx: KonteksPendataan,
  rantai: Rantai | null,
  jenis: JenisCatatan,
  input: CatatanInput
) {
  const sebelum = rantai ?? rantaiKosong(idBaru(ctx.tempatId, "ditemukan"));
  const catatan = dataToCatatan(jenis, CATATAN_INFO[jenis].tahap ? sebelum.id : idBaru(ctx.tempatId, jenis), {
    ...dariInput(input),
    rantaiId: sebelum.id,
    // Jenis penyu dipilih di catatan pertama, lalu disalin ke catatan berikutnya untuk laporan
    jenisPenyuId: rantai ? jenisPenyuRantai(rantai) : input.jenisPenyuId,
    penanggungJawabUid: ctx.penulis.uid,
    penanggungJawabNama: ctx.penulis.nama,
  });
  if (CATATAN_INFO[jenis].tahap && sebelum[jenis as Tahap]) {
    throw new PendataanError(`Tahap ${CATATAN_INFO[jenis].label} sudah diisi`);
  }
  return simpanRantai(ctx, sebelum, pasang(sebelum, catatan));
}

export async function ubahCatatan(ctx: KonteksPendataan, rantai: Rantai, catatan: Catatan, input: CatatanInput) {
  let sesudah = pasang(rantai, { ...catatan, ...dariInput(input) });
  // Jenis penyu diubah lewat catatan pertama dan berlaku untuk seluruh rantai
  const pertama = catatanPertama(rantai);
  if (pertama && kunci(pertama) === kunci(catatan) && catatan.jenisPenyuId !== input.jenisPenyuId) {
    sesudah = semuaCatatan(sesudah).reduce(
      (r, c) => pasang(r, { ...c, jenisPenyuId: input.jenisPenyuId }),
      sesudah
    );
  }
  return simpanRantai(ctx, rantai, sesudah);
}

export async function hapusCatatan(ctx: KonteksPendataan, rantai: Rantai, catatan: Catatan) {
  const sesudah =
    catatan.jenis === "mati" || catatan.jenis === "dilepas"
      ? { ...rantai, [catatan.jenis]: rantai[catatan.jenis].filter((c) => c.id !== catatan.id) }
      : { ...rantai, [catatan.jenis]: null };
  return simpanRantai(ctx, rantai, sesudah);
}

// Menutup rantai yang tidak bisa dilanjutkan (mis. semua telur rusak tapi belum tercatat)
export async function selesaikanRantai(ctx: KonteksPendataan, rantai: Rantai) {
  return simpanRantai(ctx, rantai, rantai, true);
}
