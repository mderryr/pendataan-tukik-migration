import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Halaman Tidak Ditemukan" };

// 404 untuk alamat yang tidak ada, juga dipanggil notFound() (mis. slug tempat atau ID laporan salah)
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </span>
        <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground">
          Alamatnya mungkin salah ketik, atau datanya (tempat konservasi, laporan) sudah dihapus atau belum diterbitkan.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">Ke Beranda</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/laporan">Lihat Laporan</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
