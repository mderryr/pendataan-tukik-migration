// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

const {
  FIREBASE_TYPE,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID,
  FIREBASE_AUTH_URI,
  FIREBASE_TOKEN_URI,
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  FIREBASE_CLIENT_X509_CERT_URL,
  FIREBASE_UNIVERSE_DOMAIN,
} = process.env;

// Validasi semua variabel wajib
if (
  !FIREBASE_TYPE ||
  !FIREBASE_PROJECT_ID ||
  !FIREBASE_PRIVATE_KEY_ID ||
  !FIREBASE_PRIVATE_KEY ||
  !FIREBASE_CLIENT_EMAIL ||
  !FIREBASE_CLIENT_ID ||
  !FIREBASE_AUTH_URI ||
  !FIREBASE_TOKEN_URI ||
  !FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
  !FIREBASE_CLIENT_X509_CERT_URL ||
  !FIREBASE_UNIVERSE_DOMAIN
) {
  throw new Error("Missing required Firebase Admin environment variables");
}

// Inisialisasi sekali saja
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: FIREBASE_TYPE,
      projectId: FIREBASE_PROJECT_ID,
      privateKeyId: FIREBASE_PRIVATE_KEY_ID,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // penting!
      clientEmail: FIREBASE_CLIENT_EMAIL,
      clientId: FIREBASE_CLIENT_ID,
      authUri: FIREBASE_AUTH_URI,
      tokenUri: FIREBASE_TOKEN_URI,
      authProviderX509CertUrl: FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: FIREBASE_CLIENT_X509_CERT_URL,
      universeDomain: FIREBASE_UNIVERSE_DOMAIN,
    } as admin.ServiceAccount),
  });
}

// Export
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const adminApp = admin;

export default admin;