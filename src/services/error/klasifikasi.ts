// Menerjemahkan error teknis menjadi penjelasan yang dimengerti pengguna.
// Murni (tanpa IO) — dipakai halaman error di semua lapisan.

export type JenisError = "offline" | "versi" | "izin" | "sesi" | "kuota" | "konfigurasi" | "server" | "umum";

// Langkah pemulihan yang ditawarkan tombol utama
export type AksiError = "coba-lagi" | "muat-ulang" | "masuk";

export interface PenjelasanError {
  jenis: JenisError;
  judul: string;
  penjelasan: string;
  saran: string[];
  aksi: AksiError;
}

export type ErrorHalaman = Error & { digest?: string };

const POLA: { jenis: JenisError; pola: RegExp }[] = [
  { jenis: "versi", pola: /ChunkLoadError|Loading (CSS )?chunk|Failed to load chunk|dynamically imported module/i },
  { jenis: "offline", pola: /Failed to fetch|NetworkError|Load failed|network|unavailable|ECONNREFUSED|ETIMEDOUT/i },
  { jenis: "izin", pola: /permission-denied|insufficient permissions|PERMISSION_DENIED|tidak punya izin/i },
  { jenis: "sesi", pola: /unauthenticated|session|id-token|auth\/|token.*expired|expired.*token/i },
  { jenis: "kuota", pola: /resource-exhausted|quota|RESOURCE_EXHAUSTED|too many requests|Terlalu banyak/i },
  { jenis: "konfigurasi", pola: /FIREBASE_|projectId|apiKey|credential|service account|environment variable/i },
];

const PENJELASAN: Record<JenisError, Omit<PenjelasanError, "jenis">> = {
  offline: {
    judul: "Tidak bisa terhubung",
    penjelasan: "Perangkat sedang offline atau sinyal terlalu lemah untuk memuat halaman ini.",
    saran: [
      "Periksa koneksi internet atau pindah ke tempat dengan sinyal lebih baik.",
      "Data pendataan yang sudah diinput tetap tersimpan di perangkat dan terkirim saat online.",
    ],
    aksi: "coba-lagi",
  },
  versi: {
    judul: "Aplikasi baru saja diperbarui",
    penjelasan: "Sebagian file halaman ini sudah berganti versi sejak halaman dibuka.",
    saran: ["Muat ulang halaman untuk memakai versi terbaru."],
    aksi: "muat-ulang",
  },
  izin: {
    judul: "Akses ditolak",
    penjelasan: "Akun kamu tidak punya izin untuk membuka atau mengubah data ini.",
    saran: [
      "Minta pengelola tempat memeriksa jabatan dan izin akun kamu.",
      "Kalau jabatan baru saja diubah, coba keluar lalu masuk lagi.",
    ],
    aksi: "coba-lagi",
  },
  sesi: {
    judul: "Sesi kamu sudah berakhir",
    penjelasan: "Demi keamanan, kamu perlu masuk lagi.",
    saran: ["Masuk lagi dengan email/username dan password kamu."],
    aksi: "masuk",
  },
  kuota: {
    judul: "Server sedang sibuk",
    penjelasan: "Terlalu banyak permintaan dalam waktu singkat.",
    saran: ["Tunggu beberapa menit, lalu coba lagi."],
    aksi: "coba-lagi",
  },
  konfigurasi: {
    judul: "Pengaturan server belum lengkap",
    penjelasan: "Aplikasi belum bisa terhubung ke database karena pengaturannya belum lengkap.",
    saran: ["Laporkan ke pengelola sistem dengan menyalin detail error di bawah."],
    aksi: "coba-lagi",
  },
  server: {
    judul: "Terjadi kesalahan di server",
    penjelasan: "Server gagal memproses halaman ini. Rinciannya tercatat di server dengan kode di bawah.",
    saran: [
      "Coba lagi beberapa saat lagi.",
      "Kalau terus terjadi, kirim kode error ke pengelola sistem supaya bisa dilacak.",
    ],
    aksi: "coba-lagi",
  },
  umum: {
    judul: "Terjadi kesalahan",
    penjelasan: "Halaman ini mengalami masalah yang tidak terduga.",
    saran: ["Coba lagi. Kalau terus terjadi, salin detail error dan kirim ke pengelola sistem."],
    aksi: "coba-lagi",
  },
};

// Di production, Next.js menyembunyikan pesan error dari server komponen (hanya digest yang dikirim)
export function pesanTersembunyi(error: ErrorHalaman) {
  return Boolean(error.digest) && process.env.NODE_ENV === "production";
}

export function klasifikasiError(error: ErrorHalaman, online = true): PenjelasanError {
  if (!online) return { jenis: "offline", ...PENJELASAN.offline };

  const teks = `${error.name} ${error.message}`;
  const cocok = !pesanTersembunyi(error) && POLA.find(({ pola }) => pola.test(teks));
  const jenis: JenisError = cocok ? cocok.jenis : error.digest ? "server" : "umum";
  return { jenis, ...PENJELASAN[jenis] };
}

// Teks yang disalin pengguna untuk dilaporkan ke pengelola sistem
export function detailError(error: ErrorHalaman, info: { halaman: string; waktu: string; perangkat: string }) {
  return [
    `Pesan   : ${pesanTersembunyi(error) ? "(disembunyikan di server, cocokkan dengan kode)" : error.message || "-"}`,
    `Kode    : ${error.digest ?? "-"}`,
    `Jenis   : ${error.name || "Error"}`,
    `Halaman : ${info.halaman}`,
    `Waktu   : ${info.waktu}`,
    `Perangkat: ${info.perangkat}`,
  ].join("\n");
}
