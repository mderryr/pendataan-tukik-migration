// import Navbar from "@/components/another/navbar-all.component";
// import Footer from "@/components/another/footer";
import { Suspense } from "react";
import Loading from "./loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dummy data
const reports = [
  {
    id: 1,
    title: "Laporan Status dan Kecenderungan Keanekaragaman Hayati",
    creator: "Pertamina Patra NiagaPT Pertamina Patra Niaga Fuel Terminal Madiun",
    date: "8 Agustus 2025",
    link : "https://drive.google.com/file/d/1Fl_yDZh77226uZ6SEKlq_QIeygvwyyvf/view?usp=sharing"
  },
];

export default function ReportPage() {
  return (
    <Suspense fallback={<Loading />}>
      {/* <Navbar /> */}
      
      <main className="container mx-auto py-12 px-4">
        {/* Judul + Deskripsi */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Daftar Laporan
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Berikut adalah daftar laporan terbaru yang telah dibuat. Klik tombol di bawah untuk melihat detail lengkap.
          </p>
        </div>

        {/* Grid Card — Lurus seperti berita */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="line-clamp-2">{report.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1">
                <CardDescription className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Pembuat:</span> {report.creator}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Tanggal:</span> {report.date}
                  </p>
                </CardDescription>
              </CardContent>

              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full" asChild>
                  <a href={report.link}>Lihat Detail</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* <Footer /> */}
    </Suspense>
  );
}