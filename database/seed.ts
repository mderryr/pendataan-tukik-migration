import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import InitiationService from '../src/env/firebase-admin.connect'

InitiationService

const db = getFirestore();

// === TIPE DATA PENYU ===
type Penyu = {
  name: string;
  scientificName: string;
  createdAt: FieldValue;
};

// === SEED FUNCTION ===
async function seed() {
  console.log("Menjalankan seed data penyu ke Firestore...");

  const penyuList: Penyu[] = [
    { name: "Penyu Belimbing", scientificName: "Dermochelys coriacea", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Hijau", scientificName: "Chelonia mydas", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Tempayan", scientificName: "Caretta caretta", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Lekang", scientificName: "Lepidochelys olivacea", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Pipih", scientificName: "Natator depressus", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Sisik", scientificName: "Eretmochelys imbricata", createdAt: FieldValue.serverTimestamp() },
    { name: "Penyu Kemp’s Ridley", scientificName: "Lepidochelys kempii", createdAt: FieldValue.serverTimestamp() },
  ];

  const colRef = db.collection("penyu");

  let count = 0;
  for (const p of penyuList) {
    const docId = p.scientificName.toLowerCase().replace(/\s+/g, "-");
    await colRef.doc(docId).set(p);
    console.log(`${p.name} (${p.scientificName}) ditambahkan.`);
    count++;
  }

  console.log(`Selesai! Total ${count} spesies penyu ditambahkan ke koleksi 'penyu'.`);
}

// === JALANKAN ===
seed().catch((err) => {
  console.error("Error saat seeding:", err);
  process.exit(1);
});