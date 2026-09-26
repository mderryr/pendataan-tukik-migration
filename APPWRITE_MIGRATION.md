# Migrasi dari Prisma ke Appwrite

Dokumen ini menjelaskan perubahan yang telah dilakukan dari Prisma ke Appwrite untuk sistem pendataan tukik.

## 🔄 Perubahan Yang Dilakukan

### 1. **Types Update**
- ✅ Semua types di folder `types/` telah diupdate untuk menggunakan interface Appwrite Document
- ✅ Menghilangkan dependency ke Prisma
- ✅ Menambahkan struktur Document Appwrite standar (`$id`, `$collectionId`, dll.)
- ✅ Update validasi untuk mendukung string IDs (sesuai Appwrite)

### 2. **Service Files**
Service files baru dengan akhiran `.appwrite.ts` telah dibuat untuk:
- ✅ `services/naik/pendataan-naik.appwrite.ts`
- ✅ `services/dikerami/pendataan-pengeraman.appwrite.ts`
- ✅ `services/menetas/pendataan-menetas.appwrite.ts`
- ✅ `services/diinkubasi/pendataan-inkubasi.appwrite.ts`
- ✅ `services/dilepas/pendataan-dilepas.appwrite.ts`
- ✅ `services/mati/pendataan-mati.appwrite.ts`
- ✅ `services/zona/zona.appwrite.ts` (dengan fitur koordinat map)

### 3. **Service Zona dengan Koordinat Map**
Service zona telah diubah fokus untuk get lokasi dengan koordinat hex Google:
- ✅ Konversi koordinat ke format hex Google
- ✅ Utility functions untuk konversi hex ↔ koordinat
- ✅ Service di penyu naik untuk get lokasi zona
- ✅ Reverse geocoding menggunakan Nominatim (OpenStreetMap)
- ✅ Fungsi get koordinat zona dari service penyu naik

### 4. **Storage Structure Appwrite**
Struktur folder telah diimplementasi sesuai pola: `[idLokasiKonservasi]/[Type]/[idData]/[files]`
- ✅ Utility functions untuk upload dengan struktur folder
- ✅ Helper untuk mendapatkan/menghapus file berdasarkan struktur
- ✅ Metadata management untuk file

### 5. **Connection Setup**
- ✅ Update file koneksi Appwrite untuk include Database dan Storage clients
- ✅ Penambahan environment variables untuk Database ID dan Bucket ID

## 📋 Collection IDs yang Dibutuhkan

Untuk menggunakan service ini, pastikan Anda telah membuat collection di Appwrite dengan ID berikut:

```javascript
const COLLECTION_IDS = {
  PENYU_NAIK: 'penyu_naik',
  TELUR_DIKERAMI: 'telur_dikerami', 
  TELUR_MENETAS: 'telur_menetas',
  INKUBASI_PENYU: 'inkubasi_penyu',
  PELEPASAN: 'pelepasan',
  PENYU_MATI: 'penyu_mati',
  ZONA: 'zona',
  USERS: 'users',
  INKUBATOR: 'inkubator'
}
```

## 🔧 Environment Variables

Update file konfigurasi Appwrite dengan variabel berikut:

```javascript
const ProjectID = "<PROJECT_ID>"
const EndPoint = "<PROJECT_END_POINT>" 
const DatabaseID = "<DATABASE_ID>"
const BucketID = "<BUCKET_ID>"
const ApiKey = "<YOUR_API_KEY>"
```

## 🚀 Penggunaan

### Import Service
```typescript
// Import individual service
import { createPenyuNaik, getPenyuNaik } from '@/services/naik/pendataan-naik.appwrite';

// Atau import semua dari central service
import { 
  createPenyuNaik, 
  createZonaWithLocationChoice,
  uploadFileWithStructure 
} from '@/services/appwrite.service';
```

### Contoh Penggunaan Zona dengan Koordinat Hex
```typescript
// Get daftar zona untuk pilihan di view
const zonaList = await getLokasiZona();

// Get koordinat zona spesifik dalam format hex Google
const koordinatHex = await getKoordinatZonaHex("zona_id");
console.log("Koordinat Hex:", koordinatHex); // "1A2B3C4D5E6F7890"

// Konversi hex ke koordinat untuk display
const koordinat = convertHexToCoordinates(koordinatHex!);
console.log("Koordinat:", koordinat); // { latitude: -8.1234, longitude: 112.5678 }

// Membuat zona baru dengan koordinat dari view
await createZona({
  nama: "Zona Pantai Timur",
  keterangan: "Area konservasi utama", 
  koordinat: { latitude: -8.1234, longitude: 112.5678 }
  // koordinatHex akan dibuat otomatis
});
```

### Contoh Upload File dengan Struktur
```typescript
// Upload file dengan struktur folder
await uploadFilePenyuNaik({
  idData: "document_id",
  idLokasiKonservasi: "sukamade_001", 
  fileData: {
    file: selectedFile,
    fileName: "penyu_naik_photo.jpg",
    metadata: { description: "Foto penyu naik ke pantai" }
  }
});

// File akan tersimpan di: sukamade_001/Naik/document_id/penyu_naik_photo.jpg
```

### Contoh Komponen React untuk Zona Location Picker
```typescript
import { ZonaLocationPicker } from '@/components/examples/ZonaLocationPicker.example';

// Di dalam komponen form
const handleZonaSelect = (zona: ZonaDocument) => {
  console.log('Zona selected:', zona);
  console.log('Koordinat Hex:', zona.koordinatHex);
};

const handleCoordinatesSelect = (coordinates: KoordinatDOT) => {
  console.log('Coordinates selected:', coordinates);
};

<ZonaLocationPicker
  onZonaSelect={handleZonaSelect}
  onCoordinatesSelect={handleCoordinatesSelect}
/>
```

## ⚠️ Catatan Penting

1. **ID Lokasi Konservasi**: Parameter `idLokasiKonservasi` perlu diisi secara manual sesuai kebutuhan
2. **Collection Setup**: Pastikan semua collection sudah dibuat di Appwrite dengan attribute yang sesuai
3. **Permissions**: Atur permissions di level collection dan bucket sesuai kebutuhan aplikasi
4. **Map Package**: Untuk implementasi map picker, pertimbangkan menggunakan:
   - `react-leaflet` (gratis, menggunakan OpenStreetMap)
   - `@googlemaps/react-wrapper` (berbayar, tapi lebih familiar)

## 🔄 Migrasi Data

Untuk migrasi data dari Prisma ke Appwrite:
1. Export data dari database Prisma
2. Transform format sesuai structure Appwrite Document
3. Import ke Appwrite menggunakan batch operations
4. Update semua referensi ID dari number ke string

## 📞 Support

Jika ada pertanyaan tentang implementasi atau ingin menambahkan fitur map picker, silakan konfirmasi package yang ingin digunakan.