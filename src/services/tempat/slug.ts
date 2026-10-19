// Slug = alamat link tempat sekaligus ID dokumen tempatKonservasi/{slug}.
// Contoh: "Pantai Kili Kili" → sipenyu.id/pantai-kili-kili/dashboard

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Halaman aplikasi tiap tempat: /{tempatId}/{halaman}/... (src/app/[tempat]/(app)) — wajib login
export const HALAMAN_APP_TEMPAT = ["dashboard", "pendataan", "arsip", "laporan", "manajemen", "akun"];

// Tidak boleh sama dengan halaman yang sudah ada di src/app, juga nama halaman aplikasi tempat
// (supaya /pendataan/{tempat} & /laporan/{id} tidak tertukar dengan /{tempat}/{halaman})
export const RESERVED_SLUGS = [
  "admin",
  "akun",
  "api",
  "arsip",
  "construction",
  "daftar",
  "dashboard",
  "error",
  "laporan",
  "login",
  "lupa-password",
  "manajemen",
  "pendataan",
  "registrasi",
  "tentang-kami",
];

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}
