import type { Permission, Role } from "@/services/auth/roles";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TempatProfil {
  nama: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  kontak: string;
  keterangan: string;
  lokasi: LatLng;
}

// Dokumen tempatKonservasi/{id}; id = slug
export interface Tempat extends TempatProfil {
  id: string;
  foto: string | null;
  aktif: boolean;
}

// Dokumen tempatKonservasi/{tempatId}/jabatan/{id}
export interface Jabatan {
  id: string;
  nama: string;
  permissions: Permission[];
}

// Dokumen users/{uid}
export interface Anggota {
  uid: string;
  nama: string;
  username: string;
  email: string;
  role: Role;
  jabatanId: string | null;
  aktif: boolean;
  noHp: string; // "" = belum diisi
  foto: string | null; // URL foto profil
}

// Sarana tempat: tempatKonservasi/{tempatId}/zona/{id} dan .../inkubator/{id}.
// Tidak dihapus, hanya dinonaktifkan, supaya data lama yang memakainya tetap terbaca.
export const SARANA = ["zona", "inkubator"] as const;
export type JenisSarana = (typeof SARANA)[number];

export interface Sarana {
  id: string;
  nama: string;
  keterangan: string;
  aktif: boolean;
}

// Zona pantai = kumpulan sel heksagon H3 (lihat zona-h3.ts)
export interface Zona extends Sarana {
  sel: string[];
}

// Dokumen penyu/{id} (dikelola owner)
export interface JenisPenyu {
  id: string;
  nama: string;
  namaIlmiah: string;
}
