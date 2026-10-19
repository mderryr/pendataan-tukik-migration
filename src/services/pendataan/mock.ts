// Data contoh pendataan untuk mode tampilan (FIREBASE_ENABLED = false). Tidak ada yang disimpan.
import type { JenisPenyu, Sarana } from "@/services/tempat/types";
import { dataToCatatan, type Catatan, type JenisCatatan } from "./rantai";

export const MOCK_JENIS_PENYU: JenisPenyu[] = [
  { id: "lepidochelys-olivacea", nama: "Penyu Lekang", namaIlmiah: "Lepidochelys olivacea" },
  { id: "chelonia-mydas", nama: "Penyu Hijau", namaIlmiah: "Chelonia mydas" },
  { id: "eretmochelys-imbricata", nama: "Penyu Sisik", namaIlmiah: "Eretmochelys imbricata" },
  { id: "dermochelys-coriacea", nama: "Penyu Belimbing", namaIlmiah: "Dermochelys coriacea" },
];

export const MOCK_ZONA: Sarana[] = [
  { id: "zona-barat", nama: "Zona Barat", keterangan: "Dari muara sampai pos jaga", aktif: true },
  { id: "zona-timur", nama: "Zona Timur", keterangan: "Dari pos jaga sampai tebing", aktif: true },
  { id: "zona-lama", nama: "Zona Tanjung", keterangan: "Sudah tidak dipatroli", aktif: false },
];

export const MOCK_INKUBATOR: Sarana[] = [
  { id: "bak-1", nama: "Bak Pembesaran 1", keterangan: "", aktif: true },
  { id: "bak-2", nama: "Bak Pembesaran 2", keterangan: "", aktif: true },
];

const LEKANG = "lepidochelys-olivacea";
const HIJAU = "chelonia-mydas";

function c(
  jenis: JenisCatatan,
  rantaiId: string,
  tanggal: string,
  jumlah: number,
  extra: Record<string, unknown> = {}
): Catatan {
  const id = jenis === "mati" || jenis === "dilepas" ? `${rantaiId}-${jenis}-${tanggal}` : rantaiId;
  return dataToCatatan(jenis, id, {
    rantaiId,
    tanggal,
    jumlah,
    jenisPenyuId: LEKANG,
    keterangan: "",
    penanggungJawabUid: "mock-2",
    penanggungJawabNama: "Andi Pratama",
    arsip: false,
    arsipTahun: null,
    ...extra,
  });
}

const arsip = (tahun: number) => ({ arsip: true, arsipTahun: tahun });

export const MOCK_CATATAN: Catatan[] = [
  // Masih berjalan
  c("ditemukan", "r-baru", "2026-10-17", 98, { zonaId: "zona-barat", keterangan: "Sarang dekat cemara" }),

  c("ditemukan", "r-inkubasi", "2026-09-02", 108, { zonaId: "zona-timur" }),
  c("diinkubasi", "r-inkubasi", "2026-09-02", 105),

  c("ditemukan", "r-menetas", "2026-08-20", 120, { jenisPenyuId: HIJAU, zonaId: "zona-barat" }),
  c("diinkubasi", "r-menetas", "2026-08-20", 118, { jenisPenyuId: HIJAU }),
  c("menetas", "r-menetas", "2026-10-12", 95, { jenisPenyuId: HIJAU, jumlahTidakMenetas: 23 }),

  c("ditemukan", "r-dirawat", "2026-08-05", 110, { zonaId: "zona-timur" }),
  c("diinkubasi", "r-dirawat", "2026-08-05", 108),
  c("menetas", "r-dirawat", "2026-09-28", 90, { jumlahTidakMenetas: 18 }),
  c("dirawat", "r-dirawat", "2026-09-28", 90, { inkubatorId: "bak-1" }),
  c("mati", "r-dirawat", "2026-10-01", 3),
  c("dilepas", "r-dirawat", "2026-10-05", 50, { zonaId: "zona-barat" }),

  // Sarang alami yang ditemukan sudah menetas (input mulai dari tahap Menetas)
  c("menetas", "r-alami", "2026-10-15", 40, {
    jumlahTidakMenetas: 5,
    penanggungJawabUid: "mock-custom",
    penanggungJawabNama: "Siti Rahma",
  }),

  // Arsip
  c("ditemukan", "a-selesai", "2026-07-10", 102, { ...arsip(2026), zonaId: "zona-barat" }),
  c("diinkubasi", "a-selesai", "2026-07-10", 100, arsip(2026)),
  c("menetas", "a-selesai", "2026-09-01", 88, { ...arsip(2026), jumlahTidakMenetas: 12 }),
  c("dirawat", "a-selesai", "2026-09-01", 88, { ...arsip(2026), inkubatorId: "bak-2" }),
  c("mati", "a-selesai", "2026-09-03", 2, arsip(2026)),
  c("dilepas", "a-selesai", "2026-09-05", 86, { ...arsip(2026), zonaId: "zona-barat" }),

  c("ditemukan", "a-tidak-bertelur", "2026-10-18", 0, { ...arsip(2026), bertelur: false, zonaId: "zona-timur" }),

  c("ditemukan", "a-2025", "2025-08-01", 95, { ...arsip(2025), jenisPenyuId: HIJAU }),
  c("diinkubasi", "a-2025", "2025-08-01", 95, { ...arsip(2025), jenisPenyuId: HIJAU }),
  c("menetas", "a-2025", "2025-09-20", 80, { ...arsip(2025), jenisPenyuId: HIJAU, jumlahTidakMenetas: 15 }),
  c("dirawat", "a-2025", "2025-09-20", 80, { ...arsip(2025), jenisPenyuId: HIJAU }),
  c("dilepas", "a-2025", "2025-09-25", 80, { ...arsip(2025), jenisPenyuId: HIJAU }),
];
