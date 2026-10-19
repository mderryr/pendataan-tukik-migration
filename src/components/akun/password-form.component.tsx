"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/useActionToast";
import { gantiPasswordAction } from "@/services/akun/actions";
import { gantiPasswordSchema, type GantiPasswordInput } from "@/services/akun/schema";

const FIELD: { name: keyof GantiPasswordInput; label: string; autoComplete: string; deskripsi?: string }[] = [
  { name: "passwordLama", label: "Password Sekarang", autoComplete: "current-password" },
  { name: "passwordBaru", label: "Password Baru", autoComplete: "new-password", deskripsi: "Minimal 8 karakter." },
  { name: "konfirmasi", label: "Ulangi Password Baru", autoComplete: "new-password" },
];

export default function PasswordForm() {
  const runAction = useActionToast();
  const form = useForm<GantiPasswordInput>({
    resolver: zodResolver(gantiPasswordSchema),
    defaultValues: { passwordLama: "", passwordBaru: "", konfirmasi: "" },
  });

  const onSubmit: SubmitHandler<GantiPasswordInput> = async (values) => {
    const ok = await runAction(gantiPasswordAction(values), "Password diganti. Perangkat lain sudah dikeluarkan.");
    if (ok) form.reset();
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {FIELD.map(({ name, label, autoComplete, deskripsi }) => (
          <FormField
            key={name}
            name={name}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete={autoComplete} {...field} />
                </FormControl>
                {deskripsi && <FormDescription>{deskripsi}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Setelah password diganti, akun ini otomatis keluar dari perangkat lain. Perangkat ini tetap masuk.
        </p>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mengganti..." : "Ganti Password"}
        </Button>
      </form>
    </Form>
  );
}
