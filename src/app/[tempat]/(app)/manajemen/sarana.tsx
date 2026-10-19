"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useActionToast } from "@/hooks/useActionToast";
import { saranaSchema, type SaranaInput } from "@/services/auth/schema";
import { saveSaranaAction, setSaranaAktifAction } from "@/services/tempat/actions";
import type { JenisSarana, Sarana } from "@/services/tempat/types";

// Zona pantai & inkubator: tidak dihapus, hanya dinonaktifkan, supaya data lama yang memakainya tetap terbaca.
export const SARANA_INFO: Record<JenisSarana, { judul: string; deskripsi: string; contoh: string }> = {
  zona: {
    judul: "Zona Pantai",
    deskripsi: "Bagian pantai tempat penyu naik dan lokasi pelepasan tukik.",
    contoh: "mis. Zona Barat",
  },
  inkubator: {
    judul: "Inkubator & Bak",
    deskripsi: "Tempat tukik dirawat sebelum dilepas.",
    contoh: "mis. Bak Pembesaran 1",
  },
};

export function SaranaDialog({
  tempatId,
  jenis,
  sarana,
  open,
  onOpenChange,
}: {
  tempatId: string;
  jenis: JenisSarana;
  sarana: Sarana | null; // null = baru
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const runAction = useActionToast();
  const form = useForm<SaranaInput>({
    resolver: zodResolver(saranaSchema),
    values: { nama: sarana?.nama ?? "", keterangan: sarana?.keterangan ?? "" },
  });

  const onSubmit: SubmitHandler<SaranaInput> = async (values) => {
    const ok = await runAction(
      saveSaranaAction(tempatId, jenis, values, sarana?.id),
      `${values.nama} ${sarana ? "diperbarui" : "ditambahkan"}`
    );
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {sarana ? "Ubah" : "Tambah"} {SARANA_INFO[jenis].judul}
          </DialogTitle>
          <DialogDescription>{SARANA_INFO[jenis].deskripsi}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="nama"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder={SARANA_INFO[jenis].contoh} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="keterangan"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
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

export function SaranaCard({ tempatId, jenis, list }: { tempatId: string; jenis: JenisSarana; list: Sarana[] }) {
  const runAction = useActionToast();
  const [dialog, setDialog] = useState<{ open: boolean; sarana: Sarana | null }>({ open: false, sarana: null });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base">{SARANA_INFO[jenis].judul}</CardTitle>
          <CardDescription>{SARANA_INFO[jenis].deskripsi}</CardDescription>
        </div>
        <Button size="sm" onClick={() => setDialog({ open: true, sarana: null })}>
          Tambah
        </Button>
      </CardHeader>
      <CardContent>
        {!list.length ? (
          <p className="text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <ul className="divide-y">
            {list.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                <div className={s.aktif ? "" : "opacity-60"}>
                  <p className="text-sm font-medium">
                    {s.nama} {!s.aktif && <Badge variant="outline">Nonaktif</Badge>}
                  </p>
                  {s.keterangan && <p className="text-xs text-muted-foreground">{s.keterangan}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setDialog({ open: true, sarana: s })}>
                    Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      runAction(
                        setSaranaAktifAction(tempatId, jenis, s.id, !s.aktif),
                        `${s.nama} ${s.aktif ? "dinonaktifkan" : "diaktifkan"}`
                      )
                    }
                  >
                    {s.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <SaranaDialog
        tempatId={tempatId}
        jenis={jenis}
        sarana={dialog.sarana}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </Card>
  );
}
