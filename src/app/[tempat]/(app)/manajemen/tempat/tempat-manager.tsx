"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LocationPicker from "@/components/maps/location-picker.component";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/useActionToast";
import { tempatProfilSchema, type TempatProfilInput } from "@/services/auth/schema";
import { updateTempatAction } from "@/services/tempat/actions";
import type { Tempat } from "@/services/tempat/types";

const TEKS_FIELD: { name: Exclude<keyof TempatProfilInput, "lokasi" | "keterangan">; label: string }[] = [
  { name: "nama", label: "Nama Tempat" },
  { name: "alamat", label: "Alamat" },
  { name: "kabupaten", label: "Kabupaten/Kota" },
  { name: "provinsi", label: "Provinsi" },
  { name: "kontak", label: "Kontak (HP/WA)" },
];

function ProfilForm({ tempat }: { tempat: Tempat }) {
  const runAction = useActionToast();
  const form = useForm<TempatProfilInput>({
    resolver: zodResolver(tempatProfilSchema),
    defaultValues: {
      nama: tempat.nama,
      alamat: tempat.alamat,
      kabupaten: tempat.kabupaten,
      provinsi: tempat.provinsi,
      kontak: tempat.kontak,
      keterangan: tempat.keterangan,
      lokasi: tempat.lokasi,
    },
  });

  const onSubmit: SubmitHandler<TempatProfilInput> = (values) =>
    runAction(updateTempatAction(tempat.id, values), "Data tempat diperbarui").then(() => undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profil Tempat</CardTitle>
        <CardDescription>
          Ditampilkan di halaman tempat dan laporan. Alamat link ({tempat.id}) tidak bisa diubah.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              {TEKS_FIELD.map(({ name, label }) => (
                <FormField
                  key={name}
                  name={name}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className={name === "nama" || name === "alamat" ? "sm:col-span-2" : undefined}>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              name="keterangan"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="lokasi"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <LocationPicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function TempatManager({ tempat }: { tempat: Tempat }) {
  return (
    <div className="max-w-3xl">
      <ProfilForm tempat={tempat} />
    </div>
  );
}
