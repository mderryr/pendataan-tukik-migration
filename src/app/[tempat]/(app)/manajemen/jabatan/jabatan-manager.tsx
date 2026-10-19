"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionToast } from "@/hooks/useActionToast";
import {
  ACTION_LABEL,
  actionLabel,
  ACTIONS,
  hasAction,
  RESOURCE_ACTIONS,
  RESOURCE_LABEL,
  RESOURCES,
  type Permission,
} from "@/services/auth/roles";
import { jabatanSchema, type JabatanInput } from "@/services/auth/schema";
import { deleteJabatanAction, saveJabatanAction } from "@/services/tempat/actions";
import type { Jabatan } from "@/services/tempat/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Tabel centang: baris = modul, kolom = aksi
function PermissionMatrix({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const toggle = (permissions: Permission[], checked: boolean) => {
    const rest = value.filter((p) => !permissions.includes(p as Permission));
    onChange(checked ? [...rest, ...permissions] : rest);
  };

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left font-medium">Menu</th>
            {ACTIONS.map((action) => (
              <th key={action} className="p-2 text-center font-medium">
                {ACTION_LABEL[action]}
              </th>
            ))}
            <th className="p-2 text-center font-medium">Semua</th>
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map((resource) => {
            const row = RESOURCE_ACTIONS[resource].map((action) => `${resource}:${action}` as Permission);
            const semua = row.every((p) => value.includes(p));
            return (
              <tr key={resource} className="border-b last:border-0">
                <td className="p-2">{RESOURCE_LABEL[resource]}</td>
                {ACTIONS.map((action) => {
                  const permission = `${resource}:${action}` as Permission;
                  return (
                    <td key={action} className="p-2 text-center">
                      {hasAction(resource, action) ? (
                        <Checkbox
                          aria-label={`${RESOURCE_LABEL[resource]}: ${actionLabel(resource, action)}`}
                          title={actionLabel(resource, action)}
                          checked={value.includes(permission)}
                          onCheckedChange={(checked) => toggle([permission], checked === true)}
                        />
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                  );
                })}
                <td className="p-2 text-center">
                  <Checkbox
                    aria-label={`${resource}: semua`}
                    checked={semua}
                    onCheckedChange={(checked) => toggle(row, checked === true)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function JabatanDialog({
  tempatId,
  jabatan,
  open,
  onOpenChange,
}: {
  tempatId: string;
  jabatan: Jabatan | null; // null = jabatan baru
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const runAction = useActionToast();
  const form = useForm<JabatanInput>({
    resolver: zodResolver(jabatanSchema),
    values: { nama: jabatan?.nama ?? "", permissions: jabatan?.permissions ?? [] },
  });

  const onSubmit: SubmitHandler<JabatanInput> = async (values) => {
    const ok = await runAction(
      saveJabatanAction(tempatId, values, jabatan?.id),
      jabatan ? `Jabatan ${values.nama} diperbarui` : `Jabatan ${values.nama} dibuat`
    );
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{jabatan ? "Ubah Jabatan" : "Tambah Jabatan"}</DialogTitle>
          <DialogDescription>Centang apa saja yang boleh dilakukan anggota dengan jabatan ini.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="nama"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Jabatan</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Wakil Pengelola" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="permissions"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izin</FormLabel>
                  <PermissionMatrix value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Ringkasan izin per menu, mis. "Pendataan: Lihat, Tambah"
function ringkasIzin(permissions: Permission[]) {
  return RESOURCES.flatMap((resource) => {
    const aksi = RESOURCE_ACTIONS[resource].filter((action) => permissions.includes(`${resource}:${action}` as Permission));
    return aksi.length ? [{ resource, aksi }] : [];
  });
}

export default function JabatanManager({
  tempatId,
  jabatan,
  jumlahAnggota,
}: {
  tempatId: string;
  jabatan: Jabatan[];
  jumlahAnggota: Record<string, number>;
}) {
  const runAction = useActionToast();
  const [dialog, setDialog] = useState<{ open: boolean; jabatan: Jabatan | null }>({ open: false, jabatan: null });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Jabatan</h2>
          <p className="text-sm text-muted-foreground">
            Jabatan menentukan apa saja yang boleh dilakukan anggota, mis. Wakil Pengelola atau Petugas Lapangan.
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, jabatan: null })}>Tambah Jabatan</Button>
      </div>

      {!jabatan.length && (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Belum ada jabatan.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {jabatan.map((j) => {
          const jumlah = jumlahAnggota[j.id] ?? 0;
          return (
            <Card key={j.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{j.nama}</CardTitle>
                <CardDescription>{jumlah} anggota</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 text-sm">
                {ringkasIzin(j.permissions).map(({ resource, aksi }) => (
                  <div key={resource} className="flex flex-wrap items-center gap-1">
                    <span className="mr-1 text-muted-foreground">{RESOURCE_LABEL[resource]}:</span>
                    {aksi.map((action) => (
                      <Badge key={action} variant="secondary">
                        {actionLabel(resource, action)}
                      </Badge>
                    ))}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" onClick={() => setDialog({ open: true, jabatan: j })}>
                  Ubah
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={jumlah > 0}
                      title={jumlah > 0 ? "Masih dipakai anggota" : undefined}
                    >
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus jabatan {j.nama}?</AlertDialogTitle>
                      <AlertDialogDescription>Jabatan yang dihapus tidak bisa dikembalikan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => runAction(deleteJabatanAction(tempatId, j.id), `Jabatan ${j.nama} dihapus`)}
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <JabatanDialog
        tempatId={tempatId}
        jabatan={dialog.jabatan}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
