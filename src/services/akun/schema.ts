import { z } from "zod";
import { emailField, namaField, nomorHpField } from "@/services/auth/schema";

// Data diri yang bisa diubah sendiri oleh setiap pengguna
export const profilSchema = z.object({
  nama: namaField,
  noHp: z.union([z.literal(""), nomorHpField]), // opsional
});
export type ProfilInput = z.infer<typeof profilSchema>;

export const gantiPasswordSchema = z
  .object({
    passwordLama: z.string().min(1, "Isi password sekarang"),
    passwordBaru: z.string().min(8, "Password minimal 8 karakter"),
    konfirmasi: z.string(),
  })
  .refine((v) => v.passwordBaru === v.konfirmasi, { message: "Password tidak sama", path: ["konfirmasi"] })
  .refine((v) => v.passwordBaru !== v.passwordLama, {
    message: "Password baru harus berbeda",
    path: ["passwordBaru"],
  });
export type GantiPasswordInput = z.infer<typeof gantiPasswordSchema>;

export const gantiEmailSchema = z.object({
  emailBaru: emailField,
  password: z.string().min(1, "Isi password sekarang"),
});
export type GantiEmailInput = z.infer<typeof gantiEmailSchema>;

export const FOTO_MAKS_BYTE = 900_000; // di bawah batas body server action (1 MB); foto dikecilkan di browser dulu
export const FOTO_TIPE = ["image/jpeg", "image/png", "image/webp"];
