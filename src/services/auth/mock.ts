// Data contoh untuk mode tampilan (FIREBASE_ENABLED = false). Tidak ada yang disimpan.
//
// Login contoh (password apa saja):
//   owner           → masuk sebagai Pemilik Sistem
//   custom          → masuk sebagai anggota dengan jabatan "Petugas Lapangan"
//   belumverifikasi → menampilkan error "email belum diverifikasi"
//   nonaktif        → menampilkan error "akun belum disetujui"
//   lainnya         → masuk sebagai Pengelola Tempat (admin_tempat)
// Halaman persetujuan contoh: /registrasi/persetujuan?id=demo&token=demo
import type { Anggota, Jabatan, Tempat } from "@/services/tempat/types";
import { isRole, type Role } from "./roles";
import type { SessionUser } from "./session";

export const MOCK_SESSION_PREFIX = "mock:";

export const MOCK_TEMPAT: Tempat[] = [
  {
    id: "pantai-kili-kili",
    nama: "Konservasi Penyu Pantai Kili Kili",
    alamat: "Desa Wonocoyo, Kecamatan Panggul",
    kabupaten: "Trenggalek",
    provinsi: "Jawa Timur",
    kontak: "081234567890",
    keterangan: "Kelompok masyarakat pengawas penyu di pesisir selatan Trenggalek.",
    lokasi: { lat: -8.3027, lng: 111.4697 },
    foto: null,
    aktif: true,
  },
  {
    id: "pantai-contoh",
    nama: "Konservasi Penyu Pantai Contoh",
    alamat: "Jl. Pantai No. 1",
    kabupaten: "Malang",
    provinsi: "Jawa Timur",
    kontak: "081298765432",
    keterangan: "",
    lokasi: { lat: -8.4225, lng: 112.6728 },
    foto: null,
    aktif: true,
  },
];

export const MOCK_JABATAN: Jabatan[] = [
  {
    id: "wakil-pengelola",
    nama: "Wakil Pengelola",
    permissions: [
      "pendataan:read", "pendataan:create", "pendataan:update", "pendataan:delete",
      "arsip:read", "arsip:update",
      "laporan:read", "laporan:create",
    ],
  },
  {
    id: "petugas-lapangan",
    nama: "Petugas Lapangan",
    permissions: ["pendataan:read", "pendataan:create", "arsip:read", "laporan:read"],
  },
];

export const MOCK_PROFILE_NAMA = "Sri Wahyuni";

export const MOCK_ANGGOTA: Anggota[] = [
  { uid: "mock-admin_tempat", nama: MOCK_PROFILE_NAMA, username: "sri.wahyuni", email: "sri@contoh.com", role: "admin_tempat", jabatanId: null, aktif: true, noHp: "", foto: null },
  { uid: "mock-2", nama: "Andi Pratama", username: "andi", email: "andi@contoh.com", role: "custom", jabatanId: "wakil-pengelola", aktif: true, noHp: "", foto: null },
  { uid: "mock-custom", nama: "Siti Rahma", username: "siti.rahma", email: "siti@contoh.com", role: "custom", jabatanId: "petugas-lapangan", aktif: true, noHp: "", foto: null },
  { uid: "mock-4", nama: "Joko Susilo", username: "joko", email: "joko@contoh.com", role: "custom", jabatanId: "petugas-lapangan", aktif: false, noHp: "", foto: null },
];

export const MOCK_REGISTRATION = {
  uid: "demo",
  pengelola: { nama: "Budi Santoso", username: "budi.santoso", email: "budi@contoh.com" },
  tempat: {
    slug: "pantai-taman-kili",
    nama: "Konservasi Penyu Pantai Taman",
    alamat: "Desa Sumberrejo, Kecamatan Ngadirojo",
    kabupaten: "Pacitan",
    provinsi: "Jawa Timur",
    kontak: "085712345678",
    keterangan: "Kelompok baru yang ingin mulai mencatat data penyu secara digital.",
    lokasi: { lat: -8.2394, lng: 111.2483 },
  },
};

export function mockLoginError(identifier: string) {
  const value = identifier.trim().toLowerCase();
  if (value === "belumverifikasi") return "unverified" as const;
  if (value === "nonaktif") return "disabled" as const;
  return null;
}

export function mockRoleFromIdentifier(identifier: string): Role {
  const value = identifier.trim().toLowerCase();
  if (value === "owner") return "owner";
  if (value === "custom") return "custom";
  return "admin_tempat";
}

export function mockUser(role: Role): SessionUser {
  return {
    uid: `mock-${role}`,
    email: "contoh@sipenyu.id",
    role,
    tempatId: role === "owner" ? null : MOCK_TEMPAT[0].id,
  };
}

export function mockUserFromSession(sessionValue: string): SessionUser | null {
  const role = sessionValue.slice(MOCK_SESSION_PREFIX.length);
  if (!sessionValue.startsWith(MOCK_SESSION_PREFIX) || !isRole(role)) return null;
  return mockUser(role);
}
