"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/useActionToast";
import { gantiEmailAction } from "@/services/akun/actions";
import { gantiEmailSchema, type GantiEmailInput } from "@/services/akun/schema";

export default function EmailForm({ emailSekarang }: { emailSekarang: string }) {
  const runAction = useActionToast();
  const [terkirim, setTerkirim] = useState<string | null>(null); // email baru yang menunggu konfirmasi
  const form = useForm<GantiEmailInput>({
    resolver: zodResolver(gantiEmailSchema),
    defaultValues: { emailBaru: "", password: "" },
  });

  const onSubmit: SubmitHandler<GantiEmailInput> = async (values) => {
    if (await runAction(gantiEmailAction(values), "Link konfirmasi dikirim")) {
      setTerkirim(values.emailBaru);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <p className="text-sm">
          Email sekarang: <span className="font-medium">{emailSekarang}</span>
        </p>

        {terkirim && (
          <Alert>
            <MailCheck className="size-4" />
            <AlertDescription>
              Link konfirmasi dikirim ke <b>{terkirim}</b> (cek juga folder spam). Email baru berlaku setelah link
              diklik. Setelah itu, masuk lagi dengan email baru.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          name="emailBaru"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Baru</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="nama@gmail.com" {...field} />
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
              <FormLabel>Password Sekarang</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mengirim..." : "Kirim Link Konfirmasi"}
        </Button>
      </form>
    </Form>
  );
}
