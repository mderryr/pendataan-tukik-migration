"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordAction } from "@/services/auth/actions";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/services/auth/schema";
import AuthCard from "@/components/auth/auth-card.component";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function LupaPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit: SubmitHandler<ForgotPasswordInput> = async (values) => {
    const result = await forgotPasswordAction(values);
    if (result.ok) setSent(true);
  };

  return (
    <section className="min-h-screen flex items-center px-4 py-10">
      <AuthCard title="Lupa Password" description="Kami akan mengirim link untuk mengatur ulang password">
        {sent ? (
          <Alert>
            <AlertDescription>
              Kalau akun tersebut terdaftar, link untuk mengatur ulang password sudah dikirim ke email
              akun itu. Cek juga folder spam.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                name="identifier"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email atau Username</FormLabel>
                    <FormControl>
                      <Input autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Mengirim..." : "Kirim Link"}
              </Button>
            </form>
          </Form>
        )}
        <p className="mt-5 text-center text-sm">
          <Link href="/login" className="underline underline-offset-4">
            Kembali ke halaman masuk
          </Link>
        </p>
      </AuthCard>
    </section>
  );
}
