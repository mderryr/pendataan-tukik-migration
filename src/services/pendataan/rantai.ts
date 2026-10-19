// Pendataan berjalan sebagai "rantai" tahap: Ditemukan → Diinkubasi → Menetas → Dirawat → Dilepas.
// Tiap tahap disimpan di koleksinya sendiri: tempatKonservasi/{tempatId}/{koleksi}/{id}.
//
// - Dokumen tahap (penyuNaik, telurDikerami, telurMenetas, inkubasiPenyu) memakai ID yang sama
//   dengan ID rantainya, jadi satu rantai paling banyak punya satu dokumen per tahap.
// - Tukik mati (penyuMati) & pelepasan bisa dicatat berkali-kali selama tukik dirawat,
//   ID-nya sendiri dengan field rantaiId.
// - Rantai boleh dimulai dari tahap mana saja (input "sendiri-sendiri"), lalu dilanjutkan
//   tahap demi tahap. Rantai yang selesai otomatis masuk arsip (arsip = true).
//
// File ini murni (tanpa Firebase) supaya dipakai bersama oleh client, server, dan laporan.

export const TAHAP = ["ditemukan", "diinkubasi", "menetas", "dirawat"] as const;
export type Tahap = (typeof TAHAP)[number];

export const JENIS_CATATAN = ["ditemukan", "diinkubasi", "menetas", "dirawat", "mati", "dilepas"] as const;
export type JenisCatatan = (typeof JENIS_CATATAN)[number];

export const CATATAN_INFO: Record<
  JenisCatatan,
  { koleksi: string; label: string; labelJumlah: string; tahap: boolean }
> = {
  ditemukan: { koleksi: "penyuNaik", label: "Ditemukan", labelJumlah: "Telur diselamatkan", tahap: true },
  diinkubasi: { koleksi: "telurDikerami", label: "Diinkubasi", labelJumlah: "Telur diinkubasi", tahap: true },
  menetas: { koleksi: "telurMenetas", label: "Menetas", labelJumlah: "Tukik menetas", tahap: true },
  dirawat: { koleksi: "inkubasiPenyu", label: "Dirawat", labelJumlah: "Tukik dirawat", tahap: true },
  mati: { koleksi: "penyuMati", label: "Tukik Mati", labelJumlah: "Tukik mati", tahap: false },
  dilepas: { koleksi: "pelepasan", label: "Dilepas", labelJumlah: "Tukik dilepas", tahap: false },
};

// Harus selaras dengan isDataCollection() di firestore.rules
export const KOLEKSI_PENDATAAN = JENIS_CATATAN.map((jenis) => CATATAN_INFO[jenis].koleksi);

export interface Catatan {
  id: string;
  jenis: JenisCatatan;
  rantaiId: string;
  tanggal: string; // YYYY-MM-DD
  jenisPenyuId: string | null;
  jumlah: number; // arti tergantung jenis, lihat CATATAN_INFO.labelJumlah
  keterangan: string;
  penanggungJawabUid: string;
  penanggungJawabNama: string;
  arsip: boolean;
  arsipTahun: number | null; // tahun mulai rantai, untuk menyaring arsip
  // Khusus jenis tertentu
  bertelur: boolean; // ditemukan: false = penyu naik tidak bertelur
  jumlahTidakMenetas: number; // menetas
  zonaId: string | null; // ditemukan, dilepas
  inkubatorId: string | null; // dirawat
}

export interface Rantai {
  id: string;
  arsip: boolean;
  ditemukan: Catatan | null;
  diinkubasi: Catatan | null;
  menetas: Catatan | null;
  dirawat: Catatan | null;
  mati: Catatan[];
  dilepas: Catatan[];
}

// Field yang disimpan di Firestore untuk tiap jenis (selain createdAt/updatedAt)
export function catatanToData(c: Catatan) {
  const data: Record<string, unknown> = {
    rantaiId: c.rantaiId,
    tanggal: c.tanggal,
    jenisPenyuId: c.jenisPenyuId,
    jumlah: c.jumlah,
    keterangan: c.keterangan,
    penanggungJawabUid: c.penanggungJawabUid,
    penanggungJawabNama: c.penanggungJawabNama,
    arsip: c.arsip,
    arsipTahun: c.arsipTahun,
  };
  if (c.jenis === "ditemukan") Object.assign(data, { bertelur: c.bertelur, zonaId: c.zonaId });
  if (c.jenis === "menetas") data.jumlahTidakMenetas = c.jumlahTidakMenetas;
  if (c.jenis === "dirawat") data.inkubatorId = c.inkubatorId;
  if (c.jenis === "dilepas") data.zonaId = c.zonaId;
  return data;
}

// Dipetakan manual supaya hanya data biasa (tanpa Timestamp) yang dikirim ke komponen client.
export function dataToCatatan(jenis: JenisCatatan, id: string, data: Record<string, any>): Catatan {
  return {
    id,
    jenis,
    rantaiId: data.rantaiId ?? id,
    tanggal: data.tanggal ?? "",
    jenisPenyuId: data.jenisPenyuId ?? null,
    jumlah: data.jumlah ?? 0,
    keterangan: data.keterangan ?? "",
    penanggungJawabUid: data.penanggungJawabUid ?? "",
    penanggungJawabNama: data.penanggungJawabNama ?? "",
    arsip: data.arsip ?? false,
    arsipTahun: data.arsipTahun ?? null,
    bertelur: data.bertelur ?? true,
    jumlahTidakMenetas: data.jumlahTidakMenetas ?? 0,
    zonaId: data.zonaId ?? null,
    inkubatorId: data.inkubatorId ?? null,
  };
}

export function rantaiKosong(id: string): Rantai {
  return { id, arsip: false, ditemukan: null, diinkubasi: null, menetas: null, dirawat: null, mati: [], dilepas: [] };
}

export function semuaCatatan(r: Rantai): Catatan[] {
  return [...TAHAP.flatMap((tahap) => r[tahap] ?? []), ...r.mati, ...r.dilepas];
}

const urutTanggal = (a: Catatan, b: Catatan) => a.tanggal.localeCompare(b.tanggal);

export function susunRantai(catatan: Catatan[]): Rantai[] {
  const map = new Map<string, Rantai>();
  for (const c of catatan) {
    const r = map.get(c.rantaiId) ?? rantaiKosong(c.rantaiId);
    if (c.jenis === "mati" || c.jenis === "dilepas") r[c.jenis].push(c);
    else r[c.jenis] = c;
    r.arsip ||= c.arsip;
    map.set(c.rantaiId, r);
  }
  const list = [...map.values()];
  list.forEach((r) => {
    r.mati.sort(urutTanggal);
    r.dilepas.sort(urutTanggal);
  });
  return list.sort((a, b) => tanggalMulai(b).localeCompare(tanggalMulai(a)));
}

export function catatanPertama(r: Rantai): Catatan | null {
  return TAHAP.map((tahap) => r[tahap]).find((c) => c !== null) ?? null;
}

export function tanggalMulai(r: Rantai) {
  return catatanPertama(r)?.tanggal ?? "";
}

export function jenisPenyuRantai(r: Rantai) {
  return catatanPertama(r)?.jenisPenyuId ?? null;
}

export function tahapTerakhir(r: Rantai): Tahap | null {
  return [...TAHAP].reverse().find((tahap) => r[tahap] !== null) ?? null;
}

const total = (list: Catatan[]) => list.reduce((sum, c) => sum + c.jumlah, 0);

export function jumlahMati(r: Rantai) {
  return total(r.mati);
}

export function jumlahDilepas(r: Rantai) {
  return total(r.dilepas);
}

// Tukik yang masih dirawat
export function sisaTukik(r: Rantai) {
  return r.dirawat ? r.dirawat.jumlah - jumlahMati(r) - jumlahDilepas(r) : 0;
}

// Tahap yang bisa diisi berikutnya; null kalau rantai sudah habis
export function tahapBerikutnya(r: Rantai): JenisCatatan | null {
  switch (tahapTerakhir(r)) {
    case "ditemukan":
      return r.ditemukan!.bertelur && r.ditemukan!.jumlah > 0 ? "diinkubasi" : null;
    case "diinkubasi":
      return r.diinkubasi!.jumlah > 0 ? "menetas" : null;
    case "menetas":
      return r.menetas!.jumlah > 0 ? "dirawat" : null;
    case "dirawat":
      return sisaTukik(r) > 0 ? "dilepas" : null;
    default:
      return "ditemukan";
  }
}

// Rantai selesai = tidak ada lagi yang bisa dilanjutkan → otomatis diarsipkan
export function selesai(r: Rantai) {
  return tahapTerakhir(r) !== null && tahapBerikutnya(r) === null;
}

// Batas jumlah untuk catatan baru/yang diubah, berdasarkan tahap sebelumnya.
// `abaikanId` = catatan yang sedang diubah (jumlah lamanya tidak ikut dihitung).
export function batasJumlah(r: Rantai, jenis: JenisCatatan, abaikanId?: string): number | null {
  switch (jenis) {
    case "diinkubasi":
      return r.ditemukan?.jumlah ?? null;
    case "menetas":
      return r.diinkubasi?.jumlah ?? null;
    case "dirawat":
      return r.menetas?.jumlah ?? null;
    case "mati":
    case "dilepas": {
      if (!r.dirawat) return 0;
      const lain = [...r.mati, ...r.dilepas].filter((c) => c.id !== abaikanId);
      return r.dirawat.jumlah - total(lain);
    }
    default:
      return null;
  }
}

// Memeriksa seluruh rantai setelah ditambah/diubah/dihapus. Mengembalikan pesan kesalahan atau null.
export function periksaRantai(r: Rantai): string | null {
  const ada = TAHAP.map((tahap) => r[tahap] !== null);
  const awal = ada.indexOf(true);
  const akhir = ada.lastIndexOf(true);
  if (awal === -1) return r.mati.length || r.dilepas.length ? "Data rantai tidak lengkap" : null;
  if (ada.slice(awal, akhir + 1).includes(false)) return "Tahap tidak boleh dilewati";

  const { ditemukan, diinkubasi, menetas, dirawat } = r;
  if (ditemukan && !ditemukan.bertelur && ditemukan.jumlah > 0) return "Penyu tidak bertelur, jumlah telur harus 0";
  if (ditemukan && diinkubasi && !ditemukan.bertelur) return "Penyu tidak bertelur, tidak bisa diinkubasi";

  const urutan = TAHAP.flatMap((tahap) => r[tahap] ?? []);
  for (let i = 1; i < urutan.length; i++) {
    const [sebelum, sesudah] = [urutan[i - 1], urutan[i]];
    if (sesudah.tanggal < sebelum.tanggal) {
      return `Tanggal ${CATATAN_INFO[sesudah.jenis].label} tidak boleh sebelum ${CATATAN_INFO[sebelum.jenis].label}`;
    }
  }

  if (ditemukan && diinkubasi && diinkubasi.jumlah > ditemukan.jumlah) {
    return `Telur diinkubasi melebihi telur diselamatkan (${ditemukan.jumlah})`;
  }
  if (diinkubasi && menetas && menetas.jumlah + menetas.jumlahTidakMenetas > diinkubasi.jumlah) {
    return `Telur menetas + tidak menetas melebihi telur diinkubasi (${diinkubasi.jumlah})`;
  }
  if (menetas && dirawat && dirawat.jumlah > menetas.jumlah) {
    return `Tukik dirawat melebihi tukik menetas (${menetas.jumlah})`;
  }

  if (r.mati.length || r.dilepas.length) {
    if (!dirawat) return "Tukik mati & pelepasan hanya dicatat setelah tukik dirawat";
    if (sisaTukik(r) < 0) return `Tukik mati + dilepas melebihi tukik dirawat (${dirawat.jumlah})`;
    if ([...r.mati, ...r.dilepas].some((c) => c.tanggal < dirawat.tanggal)) {
      return "Tanggal tidak boleh sebelum tukik mulai dirawat";
    }
  }
  return null;
}

// Catatan yang boleh dihapus: tahap terakhir (kalau belum ada mati/pelepasan) atau catatan mati/pelepasan
export function bolehDihapus(r: Rantai, c: Catatan) {
  if (c.jenis === "mati" || c.jenis === "dilepas") return true;
  return c.jenis === tahapTerakhir(r) && !r.mati.length && !r.dilepas.length;
}

// Tanggal hari ini (zona waktu perangkat) dalam format YYYY-MM-DD
export function hariIni() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
