# Summary Fungsi Zona dengan Koordinat Hex Google

## 🗺️ Fungsi Utama di Service Zona

### `/services/zona/zona.appwrite.ts`

| Fungsi | Deskripsi | Return Type |
|--------|-----------|-------------|
| `coordinatesToHex()` | Konversi koordinat ke format hex Google | `string` |
| `hexToCoordinates()` | Konversi hex Google ke koordinat | `KoordinatDOT` |
| `getAddressFromCoordinates()` | Reverse geocoding koordinat ke alamat | `Promise<string>` |
| `getZona()` | Get semua zona dari database | `Promise<ZonaDocument[]>` |
| `createZona()` | Create zona baru dengan koordinat hex otomatis | `Promise<ZonaDocument>` |

## 🐢 Fungsi di Service Penyu Naik untuk Get Lokasi Zona

### `/services/naik/pendataan-naik.appwrite.ts`

| Fungsi | Deskripsi | Return Type |
|--------|-----------|-------------|
| `getLokasiZona()` | Get daftar zona untuk pilihan di view | `Promise<ZonaDocument[]>` |
| `getZonaById()` | Get zona spesifik berdasarkan ID | `Promise<ZonaDocument \| null>` |
| `getKoordinatZonaHex()` | Get koordinat zona dalam format hex Google | `Promise<string \| null>` |
| `convertHexToCoordinates()` | Konversi hex ke koordinat (utility) | `KoordinatDOT` |
| `convertCoordinatesToHex()` | Konversi koordinat ke hex (utility) | `string` |

## 📱 Komponen React Example

### `/components/examples/ZonaLocationPicker.example.tsx`

Komponen lengkap yang menunjukkan:
- ✅ Dropdown pilihan zona existing
- ✅ Display koordinat dalam format biasa dan hex
- ✅ Input koordinat manual
- ✅ Get lokasi saat ini menggunakan geolocation
- ✅ Form create zona baru
- ✅ Callback ke parent component untuk handling selection

## 🔄 Flow Penggunaan

### 1. **View → Service → Database**
```typescript
// 1. User pilih/input koordinat di view
const koordinat = { latitude: -8.1234, longitude: 112.5678 };

// 2. View kirim ke service untuk create zona
const zona = await createZona({
  nama: "Zona Baru",
  keterangan: "Area konservasi",
  koordinat: koordinat
});

// 3. Service otomatis convert ke hex dan simpan ke database
// Data tersimpan: { koordinat, koordinatHex, nama, keterangan, alamat }
```

### 2. **Database → Service → View**
```typescript
// 1. Get zona list dari service
const zonaList = await getLokasiZona();

// 2. User pilih zona di view
const selectedZona = zonaList[0];

// 3. Get koordinat hex jika diperlukan
const hex = await getKoordinatZonaHex(selectedZona.$id);

// 4. Konversi untuk display jika diperlukan
const coordinates = convertHexToCoordinates(hex);
```

## 🗂️ Struktur Data Zona di Appwrite

```typescript
interface ZonaDocument {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  
  // Custom fields
  idZona: string;                    // "ZN-1234"
  nama: string;                      // "Zona Pantai Timur"
  keterangan?: string;               // "Area konservasi utama"
  koordinat: KoordinatDOT;           // { latitude: -8.1234, longitude: 112.5678 }
  koordinatHex?: string;             // "FF85A3C21B2C4D3E" (format hex Google)
  alamat?: string;                   // "Pantai Sukamade, Banyuwangi"
}
```

## 🎯 Key Features

- **✅ Fokus pada Get Lokasi**: Service zona fokus untuk menyediakan data lokasi
- **✅ Hex Google Format**: Koordinat disimpan dalam format hex sesuai Google
- **✅ Integration Ready**: Fungsi get lokasi terintegrasi di service penyu naik
- **✅ View-Service Pattern**: Koordinat dipilih di view, diteruskan ke service, disimpan ke Appwrite
- **✅ Dual Format**: Menyimpan koordinat dalam format biasa dan hex untuk compatibility
- **✅ Auto Geocoding**: Otomatis mendapatkan alamat dari koordinat
- **✅ Ready-to-Use Component**: Komponen React siap pakai dengan semua fitur

## 📋 TODO/Next Steps

- [ ] Setup collection 'zona' di Appwrite dengan attributes yang sesuai
- [ ] Test semua fungsi dengan data real
- [ ] Implementasi map picker jika diperlukan (gunakan React-Leaflet)
- [ ] Update forms lain yang menggunakan zona selection