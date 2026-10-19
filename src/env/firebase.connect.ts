// Firebase client SDK: dipakai komponen client (login ke Firebase + Firestore offline).
// Diinisialisasi saat pertama dipakai, supaya mode tampilan (FIREBASE_ENABLED = false) tidak menyentuh Firebase.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

// Ditulis literal (bukan process.env[name]) supaya Next.js bisa menyisipkan
// nilainya ke bundle browser lewat `env` di next.config.mjs.
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKER,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

let db: Firestore | undefined;

// Cache IndexedDB: data tetap bisa dibaca & ditulis saat sinyal hilang,
// lalu otomatis tersinkron ke server ketika online lagi.
export function getFirebaseDb(): Firestore {
  if (db) return db;
  const app = getFirebaseApp();
  try {
    db = initializeFirestore(app, {
      localCache:
        typeof window === "undefined"
          ? memoryLocalCache()
          : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Sudah diinisialisasi sebelumnya (mis. saat hot reload)
    db = getFirestore(app);
  }
  return db;
}
