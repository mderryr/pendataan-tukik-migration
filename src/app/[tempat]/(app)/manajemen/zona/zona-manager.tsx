"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActionToast } from "@/hooks/useActionToast";
import { saveZonaWilayahAction, setSaranaAktifAction } from "@/services/tempat/actions";
import type { LatLng, Zona } from "@/services/tempat/types";
import { formatLuas, luasSel, warnaZona } from "@/services/tempat/zona-h3";
import { cn } from "@/utils/cn-tools";
import { SaranaDialog } from "../sarana";

// Leaflet butuh window, jadi hanya dimuat di browser
const ZonaMap = dynamic(() => import("@/components/maps/zona-map.component"), {
  ssr: false,
  loading: () => <Skeleton className="h-full min-h-[420px] w-full" />,
});

const samaIsi = (a: Set<string>, b: string[]) => a.size === b.length && b.every((s) => a.has(s));

export default function ZonaManager({ tempatId, pusat, zona }: { tempatId: string; pusat: LatLng; zona: Zona[] }) {
  const runAction = useActionToast();
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ open: boolean; zona: Zona | null }>({ open: false, zona: null });
  const [menyimpan, setMenyimpan] = useState(false);

  const zonaPeta = useMemo(
    () => zona.map((z, i) => ({ id: z.id, nama: z.nama, warna: warnaZona(i), sel: z.sel })),
    [zona]
  );
  const zonaEdit = zona.find((z) => z.id === editId) ?? null;
  const berubah = zonaEdit !== null && !samaIsi(draft, zonaEdit.sel);

  const aturWilayah = (z: Zona | null) => {
    if (berubah && !window.confirm("Perubahan wilayah belum disimpan. Buang perubahan?")) return;
    setEditId(z?.id ?? null);
    setDraft(new Set(z?.sel ?? []));
  };

  const toggle = (sel: string) =>
    setDraft((lama) => {
      const baru = new Set(lama);
      if (!baru.delete(sel)) baru.add(sel);
      return baru;
    });

  const simpan = async () => {
    if (!zonaEdit) return;
    setMenyimpan(true);
    const ok = await runAction(
      saveZonaWilayahAction(tempatId, zonaEdit.id, [...draft]),
      `Wilayah ${zonaEdit.nama} disimpan`
    );
    setMenyimpan(false);
    if (ok) setEditId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Zona Pantai</h2>
          <p className="text-sm text-muted-foreground">
            Bagian pantai tempat penyu naik dan lokasi pelepasan. Wilayah tiap zona digambar dengan heksagon di peta.
          </p>
        </div>
        <Button onClick={() => setDialog({ open: true, zona: null })}>Tambah Zona</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          {!zona.length && (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Belum ada zona.
            </p>
          )}
          {zona.map((z, i) => {
            const diatur = z.id === editId;
            const sel = diatur ? [...draft] : z.sel;
            return (
              <Card key={z.id} className={cn(diatur && "ring-2 ring-primary", !z.aktif && "opacity-60")}>
                <CardHeader className="space-y-1 p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: warnaZona(i) }} />
                    {z.nama}
                    {!z.aktif && <Badge variant="outline">Nonaktif</Badge>}
                  </CardTitle>
                  <CardDescription>
                    {sel.length ? `${formatLuas(luasSel(sel))} · ${sel.length} heksagon` : "Wilayah belum digambar"}
                    {z.keterangan && ` · ${z.keterangan}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1 p-4 pt-0">
                  <Button size="sm" variant={diatur ? "secondary" : "outline"} onClick={() => aturWilayah(diatur ? null : z)}>
                    {diatur ? "Selesai mengatur" : "Atur Wilayah"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDialog({ open: true, zona: z })}>
                    Ubah
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      runAction(
                        setSaranaAktifAction(tempatId, "zona", z.id, !z.aktif),
                        `${z.nama} ${z.aktif ? "dinonaktifkan" : "diaktifkan"}`
                      )
                    }
                  >
                    {z.aktif ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Zona tidak dihapus, hanya dinonaktifkan, supaya data lama yang memakainya tetap terbaca.
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-2">
          {zonaEdit ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
              <p>
                Mengatur wilayah <span className="font-medium">{zonaEdit.nama}</span>: klik heksagon untuk menambah atau
                melepas. {draft.size ? `${draft.size} heksagon · ${formatLuas(luasSel([...draft]))}` : ""}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => aturWilayah(null)}>
                  Batal
                </Button>
                <Button size="sm" onClick={simpan} disabled={!berubah || menyimpan}>
                  {menyimpan ? "Menyimpan..." : "Simpan Wilayah"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Pilih &quot;Atur Wilayah&quot; pada zona untuk menggambar wilayahnya.</p>
          )}
          <div className="h-[480px] overflow-hidden rounded-md border lg:h-[560px]">
            <ZonaMap pusat={pusat} zona={zonaPeta} editId={editId} draft={draft} onToggle={toggle} />
          </div>
        </div>
      </div>

      <SaranaDialog
        tempatId={tempatId}
        jenis="zona"
        sarana={dialog.zona}
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
      />
    </div>
  );
}
