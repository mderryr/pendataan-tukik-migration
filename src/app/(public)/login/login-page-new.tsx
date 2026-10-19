"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/env/firebase.connect";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { loginAction, resendVerificationAction } from "@/services/auth/actions";
import { loginSchema, type LoginInput } from "@/services/auth/schema";
import AuthCard from "@/components/auth/auth-card.component";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useStatusUtils from "@/utils/status-toast.utils";

// next = halaman yang tadi dibuka sebelum diarahkan ke login (kalau ada)
export default function LoginForm({ next }: { next: string | null }) {
  const router = useRouter();
  const { onCustomMessage } = useStatusUtils();
  const [error, setError] = useState<{ message: string; unverified: boolean } | null>(null);
  const [resending, setResending] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginInput> = async (values) => {
    setError(null);
    try {
      const result = await loginAction(values);
      if (!result.ok) {
        setError({ message: result.message, unverified: result.code === "unverified" });
        return;
      }
      // Login juga di Firebase browser supaya Firestore bisa dipakai (termasuk saat offline)
      if (FIREBASE_ENABLED) await signInWithCustomToken(getFirebaseAuth(), result.customToken);
      onCustomMessage({ Message: "Berhasil masuk, selamat datang", tittle: "Berhasil", variant: "default" });
      router.replace(next ?? result.redirectTo);
      router.refresh();
    } catch {
      setError({ message: "Tidak bisa terhubung. Periksa koneksi internet kamu.", unverified: false });
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      const result = await resendVerificationAction(form.getValues());
      onCustomMessage(
        result.ok
          ? { Message: "Email verifikasi sudah dikirim ulang", tittle: "Terkirim", variant: "default" }
          : { Message: result.message, tittle: "Gagal", variant: "destructive" }
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard title="Masuk" description="Masukkan email atau username dan password kamu">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message}
                {error.unverified && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 block"
                    disabled={resending}
                    onClick={onResend}
                  >
                    {resending ? "Mengirim..." : "Kirim ulang email verifikasi"}
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          <FormField
            name="identifier"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email atau Username</FormLabel>
                <FormControl>
                  <Input placeholder="nama@email.com atau username" autoComplete="username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link href="/lupa-password" className="text-sm underline-offset-4 hover:underline">
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Form>
      <div className="mt-5 space-y-1 text-center text-sm">
        <p>
          Kelompok konservasi baru?{" "}
          <Link href="/daftar" className="underline underline-offset-4">
            Daftarkan tempat
          </Link>
        </p>
        <p className="text-muted-foreground">Anggota tim? Minta pengelola tempatmu membuatkan akun.</p>
      </div>
    </AuthCard>
  );
}
