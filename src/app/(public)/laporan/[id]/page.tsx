"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download, Printer, ZoomIn, ZoomOut } from "lucide-react";
import Link from "next/link";

// Setup worker (sudah ada)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

interface ReportDetail {
  id: number;
  title: string;
  creator: string;
  date: string;
  pdfUrl: string; // Embed URL dari Google Drive
}

// Dummy data — GANTI pdfUrl dengan embed link-mu
const reportDetail: ReportDetail = {
  id: 1,
  title: "Laporan Keuangan Q1 2023",
  creator: "John Doe",
  date: "2023-10-01",
  pdfUrl: "https://drive.google.com/file/d/1ABC123DEF456GHI789JKL/presview", // <-- GANTI INI!
};

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Download link (untuk tombol download)
  const downloadUrl = reportDetail.pdfUrl.replace("/preview", "/download"); // Ubah /preview jadi /download

  return (
    <div className="min-h-screen bg-background">
      {/* Header — sama seperti sebelumnya */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/reports">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{reportDetail.title}</h1>
              <p className="text-sm text-muted-foreground">
                {reportDetail.creator} • {reportDetail.date}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setScale(scale - 0.2)}>
              <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
            </Button>
            <Button variant="outline" size="sm" onClick={() => setScale(scale + 0.2)}>
              <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button size="sm" asChild>
              <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" /> Download
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="container mx-auto p-4">
        <Card className="overflow-hidden shadow-lg">
          <div className="bg-muted/50 p-4 flex justify-center">
            <div className="max-w-4xl w-full">
              <Document
                file={reportDetail.pdfUrl} // <-- Langsung pakai embed URL
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-center py-10">Memuat PDF dari Google Drive...</div>}
                error={<div className="text-center py-10 text-destructive">Gagal memuat PDF. Pastikan link publik!</div>}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  className="shadow-xl"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>
          </div>

          {/* Pagination — sama */}
          {numPages && (
            <div className="border-t bg-card p-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
              </Button>
              <span className="text-sm">
                Halaman <strong>{pageNumber}</strong> dari <strong>{numPages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber >= numPages}
              >
                Berikutnya <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}