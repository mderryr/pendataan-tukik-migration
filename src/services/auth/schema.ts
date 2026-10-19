import { z } from "zod";
import { RESERVED_SLUGS, SLUG_REGEX } from "@/services/tempat/slug";
import { isPermission } from "./roles";

// Username tidak boleh mengandung "@" supaya login bisa membedakan email vs username.
export const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

export const namaField = z.string().trim().min(3, "Nama minimal 3 huruf").max(80);
const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_REGEX, "3–30 karakter: huruf kecil, angka, titik, atau garis bawah");
export const emailField = z.string().trim().toLowerCase().email("Email tidak valid");

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Isi email atau username"),
  password: z.string().min(1, "Isi password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, "Isi email atau username"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Nomor HP/WA Indonesia; spasi & tanda hubung dibuang
export const nomorHpField = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+62|62|0)8\d{7,12}$/, "Nomor HP/WA tidak valid"));

// Profil tempat: dipakai saat pendaftaran dan saat pengelola mengubah data tempat
const namaTempatField = z.string().trim().min(3, "Nama tempat minimal 3 huruf").max(100);
const tempatProfilFields = {
  alamat: z.string().trim().min(5, "Isi alamat lengkap").max(200),
  kabupaten: z.string().trim().min(2, "Isi kabupaten/kota").max(80),
  provinsi: z.string().trim().min(2, "Isi provinsi").max(80),
  kontak: nomorHpField,
  keterangan: z.string().trim().max(500, "Maksimal 500 karakter"),
  lokasi: z.object(
    {
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    },
    { required_error: "Tandai lokasi tempat di peta", invalid_type_error: "Tandai lokasi tempat di peta" }
  ),
};

export const tempatProfilSchema = z.object({ nama: namaTempatField, ...tempatProfilFields });
export type TempatProfilInput = z.infer<typeof tempatProfilSchema>;

// Pendaftaran tempat konservasi baru + akun pengelolanya (calon admin_tempat)
export const registerTempatSchema = z
  .object({
    namaTempat: namaTempatField,
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Minimal 3 karakter")
      .max(50, "Maksimal 50 karakter")
      .regex(SLUG_REGEX, "Hanya huruf kecil, angka, dan tanda hubung (-)")
      .refine((slug) => !RESERVED_SLUGS.includes(slug), "Alamat link ini tidak bisa dipakai"),
    ...tempatProfilFields,
    nama: namaField,
    username: usernameField,
    email: emailField,
    password: z.string().min(8, "Password minimal 8 karakter"),
    konfirmasiPassword: z.string(),
  })
  .refine((v) => v.password === v.konfirmasiPassword, {
    message: "Password tidak sama",
    path: ["konfirmasiPassword"],
  });
export type RegisterTempatInput = z.infer<typeof registerTempatSchema>;

// Anggota baru dibuat admin tempat; password dibuat sendiri lewat "lupa password"
export const anggotaSchema = z.object({
  nama: namaField,
  username: usernameField,
  email: emailField,
  jabatanId: z.string().min(1, "Pilih jabatan"),
});
export type AnggotaInput = z.infer<typeof anggotaSchema>;

export const jabatanSchema = z.object({
  nama: z.string().trim().min(2, "Nama jabatan minimal 2 huruf").max(50),
  permissions: z
    .array(z.string())
    .min(1, "Pilih minimal satu izin")
    .refine((list) => list.every(isPermission), "Izin tidak dikenal"),
});
export type JabatanInput = z.infer<typeof jabatanSchema>;

// Zona pantai & inkubator di halaman Manajemen Tempat
export const saranaSchema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 huruf").max(50),
  keterangan: z.string().trim().max(200, "Maksimal 200 karakter"),
});
export type SaranaInput = z.infer<typeof saranaSchema>;
