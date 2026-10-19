import "dotenv/config";
import { FieldValue } from "firebase-admin/firestore";
import { auth, db } from "../src/env/firebase-admin.connect";

// Membuat akun owner pertama (kamu). Email diambil dari OWNER_EMAIL.
// Pemakaian: pnpm seed:owner <username> <password> "<Nama Lengkap>"
async function seedOwner() {
  const [username, password, nama] = process.argv.slice(2);
  const email = process.env.OWNER_EMAIL?.trim().toLowerCase();

  if (!email || !username || !password || !nama) {
    throw new Error('Pemakaian: pnpm seed:owner <username> <password> "<Nama Lengkap>" (OWNER_EMAIL wajib di .env)');
  }
  if (!/^[a-z0-9._]{3,30}$/.test(username)) {
    throw new Error("Username: 3–30 karakter, huruf kecil, angka, titik, atau garis bawah");
  }

  const usernameRef = db.collection("usernames").doc(username);
  if ((await usernameRef.get()).exists) throw new Error(`Username "${username}" sudah dipakai`);

  const user = await auth.createUser({ email, password, displayName: nama, emailVerified: true });
  await auth.setCustomUserClaims(user.uid, { role: "owner", tempatId: null });

  await usernameRef.set({ uid: user.uid, email });
  await db.collection("users").doc(user.uid).set({
    nama,
    username,
    email,
    role: "owner",
    tempatId: null,
    jabatanId: null,
    aktif: true,
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`Owner ${nama} (${email}) berhasil dibuat.`);
}

seedOwner().catch((err) => {
  console.error("Gagal membuat owner:", err.message ?? err);
  process.exit(1);
});
