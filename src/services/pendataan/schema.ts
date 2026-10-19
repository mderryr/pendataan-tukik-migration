import { z } from "zod";
import { hariIni } from "./rantai";

const jumlahField = z.coerce
  .number({ invalid_type_error: "Isi angka" })
  .int("Harus bilangan bulat")
  .min(0, "Tidak boleh negatif")
  .max(100_000, "Angka terlalu besar");

// Satu bentuk form untuk semua jenis catatan; field yang tidak dipakai jenis itu diabaikan.
export const catatanSchema = z
  .object({
    tanggal: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Isi tanggal")
      .refine((tanggal) => tanggal <= hariIni(), "Tanggal tidak boleh di masa depan"),
    jenisPenyuId: z.string().nullable(),
    jumlah: jumlahField,
    jumlahTidakMenetas: jumlahField,
    bertelur: z.boolean(),
    zonaId: z.string().nullable(),
    inkubatorId: z.string().nullable(),
    keterangan: z.string().trim().max(500, "Maksimal 500 karakter"),
  })
  .refine((v) => v.bertelur || v.jumlah === 0, {
    message: "Penyu tidak bertelur, isi 0",
    path: ["jumlah"],
  });
export type CatatanInput = z.infer<typeof catatanSchema>;
