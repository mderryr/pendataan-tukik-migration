"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionToast } from "@/hooks/useActionToast";
import { anggotaSchema, type AnggotaInput } from "@/services/auth/schema";
import {
  createAnggotaAction,
  setAnggotaAktifAction,
  setAnggotaJabatanAction,
} from "@/services/tempat/actions";
import type { Anggota, Jabatan } from "@/services/tempat/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function JabatanSelect({
  jabatan,
  value,
  onChange,
  disabled,
}: {
  jabatan: Jabatan[];
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="min-w-40">
        <SelectValue placeholder="Pilih jabatan" />
      </SelectTrigger>
      <SelectContent>
        {jabatan.map((j) => (
          <SelectItem key={j.id} value={j.id}>
            {j.nama}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TambahAnggotaDialog({ tempatId, jabatan }: { tempatId: string; jabatan: Jabatan[] }) {
  const [open, setOpen] = useState(false);
  const runAction = useActionToast();
  const form = useForm<AnggotaInput>({
    resolver: zodResolver(anggotaSchema),
    defaultValues: { nama: "", username: "", email: "", jabatanId: "" },
  });

  const onSubmit: SubmitHandler<AnggotaInput> = async (values) => {
    const ok = await runAction(
      createAnggotaAction(tempatId, values),
      `Akun ${values.nama} dibuat. Email untuk membuat password sudah dikirim.`
    );
    if (ok) {
      form.reset();
      setOpen(false);
    }
  };

  const fields = [
    { name: "nama", label: "Nama Lengkap", type: "text" },
    { name: "username", label: "Username", type: "text" },
    { name: "email", label: "Email", type: "email" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!jabatan.length}>Tambah Anggota</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Anggota</DialogTitle>
          <DialogDescription>
            Anggota akan menerima email untuk membuat password sendiri. Kalau emailnya tidak sampai, anggota bisa
            memakai &quot;Lupa password&quot; di halaman masuk.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map(({ name, label, type }) => (
              <FormField
                key={name}
                name={name}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type={type} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              name="jabatanId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <JabatanSelect jabatan={jabatan} value={field.value || undefined} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AnggotaManager({
  tempatId,
  anggota,
  jabatan,
}: {
  tempatId: string;
  anggota: Anggota[];
  jabatan: Jabatan[];
}) {
  const runAction = useActionToast();
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const withPending = async (uid: string, task: () => Promise<unknown>) => {
    setPendingUid(uid);
    try {
      await task();
    } finally {
      setPendingUid(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Anggota</h2>
          <p className="text-sm text-muted-foreground">
            Orang yang bisa masuk ke tempat ini. Akses tiap anggota mengikuti jabatannya.
          </p>
        </div>
        <TambahAnggotaDialog tempatId={tempatId} jabatan={jabatan} />
      </div>

      {!jabatan.length && (
        <Alert>
          <AlertDescription>
            Buat jabatan dulu (mis. &quot;Wakil Pengelola&quot;) sebelum menambah anggota.{" "}
            <Link href={`/${tempatId}/manajemen/jabatan`} className="underline underline-offset-4">
              Buka halaman jabatan
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {anggota.map((a) => {
              const isPengelola = a.role === "admin_tempat";
              const pending = pendingUid === a.uid;
              return (
                <TableRow key={a.uid} className={a.aktif ? undefined : "opacity-60"}>
                  <TableCell>
                    <p className="font-medium">{a.nama}</p>
                    <p className="text-xs text-muted-foreground">@{a.username}</p>
                  </TableCell>
                  <TableCell className="text-sm">{a.email}</TableCell>
                  <TableCell>
                    {isPengelola ? (
                      <Badge>Pengelola</Badge>
                    ) : (
                      <JabatanSelect
                        jabatan={jabatan}
                        value={a.jabatanId ?? undefined}
                        disabled={pending}
                        onChange={(jabatanId) =>
                          withPending(a.uid, () =>
                            runAction(setAnggotaJabatanAction(tempatId, a.uid, jabatanId), `Jabatan ${a.nama} diubah`)
                          )
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.aktif ? "secondary" : "outline"}>{a.aktif ? "Aktif" : "Nonaktif"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isPengelola && (
                      <Button
                        variant={a.aktif ? "outline" : "default"}
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          withPending(a.uid, () =>
                            runAction(
                              setAnggotaAktifAction(tempatId, a.uid, !a.aktif),
                              a.aktif ? `${a.nama} dinonaktifkan` : `${a.nama} diaktifkan lagi`
                            )
                          )
                        }
                      >
                        {a.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
