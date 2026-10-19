import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { namaPeriode, type Laporan } from "@/services/laporan/hitung";
import type { Tempat } from "@/services/tempat/types";

// Kartu satu tempat konservasi di direktori /pendataan.
// `sorotan` = laporan yang angkanya ditampilkan (tahunan terbaru, atau bulanan terbaru).
export default function TempatKartu({
  tempat,
  jumlahLaporan,
  sorotan,
}: {
  tempat: Tempat;
  jumlahLaporan: number;
  sorotan: Laporan | null;
}) {
  return (
    <Card className="relative flex h-full flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">
          <Link href={`/pendataan/${tempat.id}`} className="after:absolute after:inset-0">
            {tempat.nama}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          {tempat.kabupaten}, {tempat.provinsi}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 text-sm">
        {sorotan ? (
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-muted/50 p-2">
              <dt className="text-xs text-muted-foreground">Telur diselamatkan</dt>
              <dd className="text-lg font-semibold tabular-nums">{sorotan.isi.ringkasan.telurDiselamatkan}</dd>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <dt className="text-xs text-muted-foreground">Tukik dilepas</dt>
              <dd className="text-lg font-semibold tabular-nums">{sorotan.isi.ringkasan.tukikDilepas}</dd>
            </div>
            <p className="col-span-2 text-xs text-muted-foreground">{namaPeriode(sorotan.periode)}</p>
          </dl>
        ) : (
          <p className="text-muted-foreground">{tempat.keterangan || "Belum ada laporan yang diterbitkan."}</p>
        )}
      </CardContent>
      <CardFooter>
        <Badge variant="secondary">{jumlahLaporan} laporan</Badge>
      </CardFooter>
    </Card>
  );
}
