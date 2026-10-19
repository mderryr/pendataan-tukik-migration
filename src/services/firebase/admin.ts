import "server-only";

// Firebase Admin dimuat saat dipakai saja (bukan saat file di-import), supaya
// mode tampilan bisa jalan walaupun env Firebase Admin masih kosong.
export function getFirebaseAdmin() {
  return import("@/env/firebase-admin.connect");
}
