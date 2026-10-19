"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { waitForPendingWrites } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/env/firebase.connect";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { logoutAction } from "@/services/auth/actions";
import { Button } from "@/components/ui/button";
import useStatusUtils from "@/utils/status-toast.utils";

// Dipakai LogoutButton dan menu "Keluar" di sidebar tempat
export function useLogout() {
  const { onCustomMessage } = useStatusUtils();
  const [pending, setPending] = useState(false);

  const onLogout = async () => {
    // Data yang diinput saat offline masih antre di browser; jangan keluar sebelum terkirim.
    if (!navigator.onLine) {
      onCustomMessage({
        Message: "Kamu sedang offline. Tunggu sampai online supaya data yang belum terkirim tidak hilang.",
        tittle: "Belum bisa keluar",
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      if (FIREBASE_ENABLED) {
        await waitForPendingWrites(getFirebaseDb());
        await signOut(getFirebaseAuth());
      }
      await logoutAction();
    } finally {
      setPending(false);
    }
  };

  return { onLogout, pending };
}

export default function LogoutButton() {
  const { onLogout, pending } = useLogout();

  return (
    <Button variant="outline" onClick={onLogout} disabled={pending}>
      {pending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
