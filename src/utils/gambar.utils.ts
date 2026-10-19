// Mengecilkan gambar di browser sebelum diunggah (foto HP bisa > 5 MB, batas server action 1 MB).
// Sisi terpanjang dibatasi `maks` piksel, hasilnya WebP (JPEG kalau browser tidak mendukung WebP).
export async function kecilkanGambar(file: File, maks = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const skala = Math.min(1, maks / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * skala);
  canvas.height = Math.round(bitmap.height * skala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const keBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const hasil = (await keBlob("image/webp")) ?? (await keBlob("image/jpeg"));
  if (!hasil) throw new Error("Gambar gagal diproses");
  return hasil;
}
