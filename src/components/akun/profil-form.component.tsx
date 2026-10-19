"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/useActionToast";
import { updateProfilAction } from "@/services/akun/actions";
import type { Profil } from "@/services/akun/akun";
import { profilSchema, type ProfilInput } from "@/services/akun/schema";

export default function ProfilForm({ profil }: { profil: Profil }) {
  const runAction = useActionToast();
  const form = useForm<ProfilInput>({
    resolver: zodResolver(profilSchema),
    defaultValues: { nama: profil.nama, noHp: profil.noHp },
  });

  const onSubmit: SubmitHandler<ProfilInput> = async (values) => {
    if (await runAction(updateProfilAction(values), "Data diri disimpan")) form.reset(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="nama"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="noHp"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor HP/WA</FormLabel>
              <FormControl>
                <Input type="tel" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" {...field} />
              </FormControl>
              <FormDescription>Opsional. Untuk dihubungi pengelola tempat.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Username tidak bisa diubah; email diganti lewat tab Email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={profil.username || "-"} disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profil.email} disabled readOnly />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </Form>
  );
}
