import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  KOLOM_TABEL,
  persenMenetas,
  RINGKASAN_KEYS,
  RINGKASAN_LABEL,
  type IsiLaporan,
  type Ringkasan,
} from "@/services/laporan/hitung";
import { namaBulanPanjang } from "@/utils/nama-bulan.utils";

function TabelRincian({ judul, baris }: { judul: string; baris: { label: string; r: Ringkasan }[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{judul}</h3>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              {KOLOM_TABEL.map((key) => (
                <TableHead key={key} className="text-right">
                  {RINGKASAN_LABEL[key]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {baris.map(({ label, r }) => (
              <TableRow key={label}>
                <TableCell className="whitespace-nowrap">{label}</TableCell>
                {KOLOM_TABEL.map((key) => (
                  <TableCell key={key} className="text-right tabular-nums">
                    {r[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function LaporanRingkasan({ isi }: { isi: IsiLaporan }) {
  const persen = persenMenetas(isi.ringkasan);

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {RINGKASAN_KEYS.map((key) => (
          <div key={key} className="rounded-md border p-3">
            <dt className="text-xs text-muted-foreground">{RINGKASAN_LABEL[key]}</dt>
            <dd className="text-xl font-semibold tabular-nums">{isi.ringkasan[key]}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm text-muted-foreground">
        Persentase penetasan: <span className="font-medium text-foreground">{persen === null ? "–" : `${persen}%`}</span>
        {" · "}
        Dihitung dari {isi.jumlahCatatan} catatan pendataan.
      </p>

      {isi.perJenis.length > 0 && (
        <TabelRincian judul="Per jenis penyu" baris={isi.perJenis.map((j) => ({ label: j.nama, r: j.ringkasan }))} />
      )}
      {isi.perBulan && (
        <TabelRincian
          judul="Per bulan"
          baris={isi.perBulan.map((r, i) => ({ label: namaBulanPanjang[i], r }))}
        />
      )}
    </div>
  );
}
