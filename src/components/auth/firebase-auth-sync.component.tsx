"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signInWithCustomToken, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/env/firebase.connect";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { getClientTokenAction } from "@/services/auth/actions";

// Menjaga login Firebase di browser tetap sama dengan sesi server.
// Login Firebase di browser tersimpan di IndexedDB, jadi tetap ada saat offline.
export default function FirebaseAuthSync({ uid }: { uid: string }) {
  useEffect(() => {
    if (!FIREBASE_ENABLED) return;
    const auth = getFirebaseAuth();

    return onAuthStateChanged(auth, async (current) => {
      if (current?.uid === uid) return;

      // User berbeda di browser: keluarkan dulu, listener akan terpanggil lagi dengan null.
      if (current) {
        await signOut(auth);
        return;
      }

      if (!navigator.onLine) return;
      const result = await getClientTokenAction();
      if (result.ok) await signInWithCustomToken(auth, result.customToken);
    });
  }, [uid]);

  return null;
}
