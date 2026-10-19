// Dokumen PDF laporan, dibuat di browser dari JSON laporan (lihat laporan-unduh.component.tsx).
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  KOLOM_TABEL,
  namaPeriode,
  persenMenetas,
  RINGKASAN_KEYS,
  RINGKASAN_LABEL,
  type Laporan,
  type Ringkasan,
} from "@/services/laporan/hitung";
import { namaBulanPanjang } from "@/utils/nama-bulan.utils";

const styles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, padding: 40, paddingBottom: 60, lineHeight: 1.4 },
  header: { textAlign: "center", marginBottom: 16 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  subtitle: { fontSize: 11, marginTop: 4 },
  muted: { color: "#555" },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #000",
    paddingBottom: 8,
    marginBottom: 16,
    fontSize: 8,
  },
  section: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", border: "1px solid #ccc" },
  gridItem: { width: "50%", flexDirection: "row", justifyContent: "space-between", padding: 6, borderBottom: "1px solid #eee" },
  bold: { fontFamily: "Helvetica-Bold" },
  table: { border: "1px solid #ccc" },
  row: { flexDirection: "row", borderBottom: "1px solid #eee" },
  headRow: { flexDirection: "row", backgroundColor: "#f1f1f1", borderBottom: "1px solid #ccc" },
  cellLabel: { flex: 2, padding: 4 },
  cell: { flex: 1, padding: 4, textAlign: "right" },
  footer: { position: "absolute", bottom: 25, left: 40, right: 40, fontSize: 7, color: "#777", flexDirection: "row", justifyContent: "space-between" },
});

const tanggalTerbit = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" });

function Tabel({ judul, baris }: { judul: string; baris: { label: string; r: Ringkasan }[] }) {
  return (
    <View wrap={false}>
      <Text style={styles.section}>{judul}</Text>
      <View style={styles.table}>
        <View style={styles.headRow}>
          <Text style={styles.cellLabel} />
          {KOLOM_TABEL.map((key) => (
            <Text key={key} style={[styles.cell, styles.bold]}>
              {RINGKASAN_LABEL[key]}
            </Text>
          ))}
        </View>
        {baris.map(({ label, r }) => (
          <View key={label} style={styles.row}>
            <Text style={styles.cellLabel}>{label}</Text>
            {KOLOM_TABEL.map((key) => (
              <Text key={key} style={styles.cell}>
                {r[key]}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function LaporanPdf({ laporan }: { laporan: Laporan }) {
  const { isi, periode } = laporan;
  const persen = persenMenetas(isi.ringkasan);

  return (
    <Document title={`${laporan.judul} - ${laporan.tempatNama}`} author={laporan.tempatNama} creator="SiPenyu">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{laporan.judul}</Text>
          <Text style={styles.subtitle}>{laporan.tempatNama}</Text>
          <Text style={styles.muted}>
            {laporan.kabupaten}, {laporan.provinsi}
          </Text>
        </View>

        <View style={styles.meta}>
          <Text>Periode: {namaPeriode(periode)}</Text>
          <Text>
            Versi {laporan.versi} · {tanggalTerbit(laporan.diterbitkanPada)}
          </Text>
          <Text>Diterbitkan oleh: {laporan.diterbitkanOleh}</Text>
        </View>

        <Text style={styles.section}>Ringkasan</Text>
        <View style={styles.grid}>
          {RINGKASAN_KEYS.map((key) => (
            <View key={key} style={styles.gridItem}>
              <Text>{RINGKASAN_LABEL[key]}</Text>
              <Text style={styles.bold}>{isi.ringkasan[key]}</Text>
            </View>
          ))}
          <View style={styles.gridItem}>
            <Text>Persentase penetasan</Text>
            <Text style={styles.bold}>{persen === null ? "-" : `${persen}%`}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text>Jumlah catatan</Text>
            <Text style={styles.bold}>{isi.jumlahCatatan}</Text>
          </View>
        </View>

        {isi.perJenis.length > 0 && (
          <Tabel judul="Per Jenis Penyu" baris={isi.perJenis.map((j) => ({ label: j.nama, r: j.ringkasan }))} />
        )}
        {isi.perBulan && (
          <Tabel judul="Per Bulan" baris={isi.perBulan.map((r, i) => ({ label: namaBulanPanjang[i], r }))} />
        )}

        <View style={styles.footer} fixed>
          <Text>Dibuat otomatis oleh SiPenyu dari data pendataan · ID {laporan.id}</Text>
          <Text render={({ pageNumber, totalPages }) => `Hal. ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
