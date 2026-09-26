// "use client";

// import React, { useState, useEffect } from 'react';
// import { KoordinatDOT, ZonaDocument } from '@/types';
// import { 
//   getLokasiZona, 
//   getKoordinatZonaHex, 
//   // convertHexToCoordinates,
//   // convertCoordinatesToHex 
// } from 'Pending/services/naik/pendataan-naik.appwrite';
// import { createZona } from 'Pending/services/zona/zona.appwrite';

// interface ZonaLocationPickerProps {
//   onZonaSelect?: (zona: ZonaDocument) => void;
//   onCoordinatesSelect?: (coordinates: KoordinatDOT) => void;
// }

// export const ZonaLocationPicker: React.FC<ZonaLocationPickerProps> = ({
//   onZonaSelect,
//   onCoordinatesSelect
// }) => {
//   const [zonaList, setZonaList] = useState<ZonaDocument[]>([]);
//   const [selectedCoordinates, setSelectedCoordinates] = useState<KoordinatDOT | null>(null);
//   const [selectedZona, setSelectedZona] = useState<ZonaDocument | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>("");
  
//   // Form state untuk membuat zona baru
//   const [newZonaForm, setNewZonaForm] = useState({
//     nama: "",
//     keterangan: "",
//     koordinat: { latitude: 0, longitude: 0 } as KoordinatDOT
//   });

//   // Load zona list saat komponen mount
//   useEffect(() => {
//     loadZonaList();
//   }, []);

//   const loadZonaList = async () => {
//     try {
//       setLoading(true);
//       const zones = await getLokasiZona();
//       setZonaList(zones);
//       setError("");
//     } catch (err) {
//       setError("Gagal memuat daftar zona");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle selection dari dropdown zona
//   const handleZonaSelect = async (zonaId: string) => {
//     try {
//       const zona = zonaList.find(z => z.$id === zonaId);
//       if (zona) {
//         setSelectedZona(zona);
//         setSelectedCoordinates(zona.koordinat);
        
//         // Callback ke parent component
//         onZonaSelect?.(zona);
//         onCoordinatesSelect?.(zona.koordinat);

//         // Log koordinat dalam format hex Google
//         const hexCoordinates = await getKoordinatZonaHex(zonaId);
//         console.log("Koordinat Hex Google:", hexCoordinates);
//       }
//     } catch (err) {
//       setError("Gagal memuat koordinat zona");
//       console.error(err);
//     }
//   };

//   // Handle input koordinat manual
//   const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
//     const numValue = parseFloat(value) || 0;
//     const newCoordinates = {
//       ...selectedCoordinates!,
//       [field]: numValue
//     };
    
//     setSelectedCoordinates(newCoordinates);
//     onCoordinatesSelect?.(newCoordinates);
    
//     // Log format hex
//     const hexCoordinates = "adasaja" /*convertCoordinatesToHex(newCoordinates);*/
//     console.log("Koordinat Hex Google:", hexCoordinates);
//   };

//   // Handle pembuatan zona baru
//   const handleCreateZona = async () => {
//     if (!newZonaForm.nama || !selectedCoordinates) {
//       setError("Nama zona dan koordinat harus diisi");
//       return;
//     }

//     try {
//       setLoading(true);
//       const newZona = await createZona({
//         nama: newZonaForm.nama,
//         keterangan: newZonaForm.keterangan,
//         koordinat: selectedCoordinates
//       });

//       // Refresh zona list
//       await loadZonaList();
      
//       // Reset form
//       setNewZonaForm({
//         nama: "",
//         keterangan: "",
//         koordinat: { latitude: 0, longitude: 0 }
//       });

//       alert("Zona berhasil dibuat!");
//     } catch (err) {
//       setError("Gagal membuat zona baru");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle mendapatkan lokasi saat ini
//   const getCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       setError("Geolocation tidak didukung browser ini");
//       return;
//     }

//     setLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const coordinates: KoordinatDOT = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude
//         };
        
//         setSelectedCoordinates(coordinates);
//         onCoordinatesSelect?.(coordinates);
        
//         // Set ke form zona baru
//         setNewZonaForm(prev => ({
//           ...prev,
//           koordinat: coordinates
//         }));

//         // Log format hex
//         const hexCoordinates = "Ada Saja"/*convertCoordinatesToHex(coordinates);*/
//         console.log("Koordinat Saat Ini (Hex Google):", hexCoordinates);
        
//         setLoading(false);
//       },
//       (error) => {
//         setError(`Gagal mendapatkan lokasi: ${error.message}`);
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 300000
//       }
//     );
//   };

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h3 className="text-lg font-semibold mb-4">Pilih Lokasi Zona</h3>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Dropdown pilih zona existing */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Pilih Zona Existing
//         </label>
//         <select
//           className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//           onChange={(e) => handleZonaSelect(e.target.value)}
//           value={selectedZona?.$id || ""}
//           disabled={loading}
//         >
//           <option value="">-- Pilih Zona --</option>
//           {zonaList.map((zona) => (
//             <option key={zona.$id} value={zona.$id}>
//               {zona.nama} ({zona.alamat})
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Display koordinat yang dipilih */}
//       {selectedCoordinates && (
//         <div className="mb-6 p-4 bg-gray-50 rounded-md">
//           <h4 className="text-sm font-medium text-gray-700 mb-2">Koordinat Terpilih</h4>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-xs text-gray-600">Latitude</label>
//               <input
//                 type="number"
//                 step="any"
//                 value={selectedCoordinates.latitude}
//                 onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs text-gray-600">Longitude</label>
//               <input
//                 type="number"
//                 step="any"
//                 value={selectedCoordinates.longitude}
//                 onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded text-sm"
//               />
//             </div>
//           </div>
//           <div className="mt-2 text-xs text-gray-600">
//             Hex Google: {/*convertCoordinatesToHex(selectedCoordinates)*/}
//           </div>
//         </div>
//       )}

//       {/* Button untuk mendapatkan lokasi saat ini */}
//       <div className="mb-6">
//         <button
//           onClick={getCurrentLocation}
//           disabled={loading}
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
//         >
//           {loading ? "Mendapatkan Lokasi..." : "Gunakan Lokasi Saat Ini"}
//         </button>
//       </div>

//       {/* Form untuk membuat zona baru */}
//       <div className="border-t pt-6">
//         <h4 className="text-md font-medium text-gray-700 mb-4">Atau Buat Zona Baru</h4>
        
//         <div className="grid grid-cols-1 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nama Zona
//             </label>
//             <input
//               type="text"
//               value={newZonaForm.nama}
//               onChange={(e) => setNewZonaForm(prev => ({ ...prev, nama: e.target.value }))}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Masukkan nama zona"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Keterangan (Opsional)
//             </label>
//             <textarea
//               value={newZonaForm.keterangan}
//               onChange={(e) => setNewZonaForm(prev => ({ ...prev, keterangan: e.target.value }))}
//               className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//               rows={3}
//               placeholder="Deskripsi zona"
//             />
//           </div>
//         </div>

//         <button
//           onClick={handleCreateZona}
//           disabled={loading || !newZonaForm.nama || !selectedCoordinates}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
//         >
//           {loading ? "Membuat Zona..." : "Buat Zona Baru"}
//         </button>
//       </div>
//     </div>
//   );
// };