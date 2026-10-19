"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/services/auth/actions";
import { registerTempatSchema, type RegisterTempatInput } from "@/services/auth/schema";
import { slugify } from "@/services/tempat/slug";
import AuthCard from "@/components/auth/auth-card.component";
import LocationPicker from "@/components/maps/location-picker.component";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TextFieldName = Exclude<keyof RegisterTempatInput, "lokasi" | "keterangan" | "slug">;

interface TextFieldConfig {
  name: TextFieldName;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  description?: string;
  wide?: boolean;
}

const TEMPAT_FIELDS: TextFieldConfig[] = [
  { name: "namaTempat", label: "Nama Tempat Konservasi", placeholder: "Konservasi Penyu Pantai ...", wide: true },
  { name: "alamat", label: "Alamat", placeholder: "Desa, kecamatan, jalan", wide: true },
  { name: "kabupaten", label: "Kabupaten/Kota" },
  { name: "provinsi", label: "Provinsi" },
  { name: "kontak", label: "No. HP / WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", wide: true },
];

const PENGELOLA_FIELDS: TextFieldConfig[] = [
  { name: "nama", label: "Nama Lengkap", autoComplete: "name", wide: true },
  {
    name: "username",
    label: "Username",
    autoComplete: "username",
    description: "Huruf kecil, angka, titik, atau garis bawah.",
  },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  { name: "konfirmasiPassword", label: "Ulangi Password", type: "password", autoComplete: "new-password" },
];

function SectionTitle({ nomor, children }: { nomor: number; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 border-b pb-2 font-semibold">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        {nomor}
      </span>
      {children}
    </h3>
  );
}

export default function RegisterForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugDiubah, setSlugDiubah] = useState(false);
  const [host, setHost] = useState("sipenyu.id");

  const form = useForm<RegisterTempatInput>({
    resolver: zodResolver(registerTempatSchema),
    defaultValues: {
      namaTempat: "",
      slug: "",
      alamat: "",
      kabupaten: "",
      provinsi: "",
      kontak: "",
      keterangan: "",
      nama: "",
      username: "",
      email: "",
      password: "",
      konfirmasiPassword: "",
    },
  });

  useEffect(() => setHost(window.location.host), []);

  // Alamat link mengikuti nama tempat, sampai pendaftar mengubahnya sendiri
  const namaTempat = form.watch("namaTempat");
  useEffect(() => {
    if (!slugDiubah) form.setValue("slug", slugify(namaTempat));
  }, [namaTempat, slugDiubah, form]);

  const slug = form.watch("slug");

  const onSubmit: SubmitHandler<RegisterTempatInput> = async (values) => {
    setError(null);
    try {
      const result = await registerAction(values);
      if (result.ok) setSent(true);
      else setError(result.message);
    } catch {
      setError("Tidak bisa terhubung. Periksa koneksi internet kamu.");
    }
  };

  const renderTextField = ({ name, label, type, autoComplete, placeholder, description, wide }: TextFieldConfig) => (
    <FormField
      key={name}
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem className={wide ? "sm:col-span-2" : undefined}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} autoComplete={autoComplete} placeholder={placeholder} {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  if (sent) {
    return (
      <AuthCard title="Pendaftaran Terkirim" className="max-w-md">
        <Alert>
          <AlertDescription>
            Pendaftaran <b>{form.getValues("namaTempat")}</b> sedang menunggu persetujuan pengelola Si Penyu.
            Setelah disetujui, kamu akan menerima email untuk verifikasi, lalu bisa masuk ke{" "}
            <b>
              {host}/{form.getValues("slug")}/dashboard
            </b>
            .
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link href="/">Kembali ke beranda</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Daftarkan Tempat Konservasi"
      description="Untuk kelompok konservasi yang ingin bergabung dengan Si Penyu. Pendaftaran akan diperiksa terlebih dahulu."
      className="max-w-2xl"
    >
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <SectionTitle nomor={1}>Data Tempat</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              {TEMPAT_FIELDS.slice(0, 1).map(renderTextField)}
              <FormField
                name="slug"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Alamat Link</FormLabel>
                    <FormControl>
                      <div className="flex items-center rounded-md border focus-within:ring-2 focus-within:ring-ring">
                        <span className="whitespace-nowrap border-r bg-muted px-3 py-2 text-sm text-muted-foreground">
                          {host}/
                        </span>
                        <input
                          {...field}
                          onChange={(e) => {
                            setSlugDiubah(true);
                            field.onChange(e.target.value.toLowerCase());
                          }}
                          className="w-full min-w-0 bg-transparent px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Dashboard tempat kamu nanti: {host}/{slug || "nama-tempat"}/dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {TEMPAT_FIELDS.slice(1).map(renderTextField)}
              <FormField
                name="keterangan"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Keterangan <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Ceritakan singkat tentang kelompok konservasi kamu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle nomor={2}>Lokasi</SectionTitle>
            <FormField
              name="lokasi"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titik lokasi tempat konservasi</FormLabel>
                  <LocationPicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <SectionTitle nomor={3}>Akun Pengelola</SectionTitle>
            <p className="text-sm text-muted-foreground">
              Kamu akan menjadi pengelola tempat ini dan bisa menambahkan anggota setelah disetujui.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">{PENGELOLA_FIELDS.map(renderTextField)}</div>
          </div>

          <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Mengirim..." : "Kirim Pendaftaran"}
          </Button>
        </form>
      </Form>
      <p className="mt-5 text-center text-sm">
        Sudah punya akun?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Masuk
        </Link>
      </p>
    </AuthCard>
  );
}
