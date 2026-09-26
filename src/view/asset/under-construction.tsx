import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function UnderConstructionPage() {
  return (
<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Bagian Kiri: Teks + Tombol */}
          <div className="space-y-6 order-2 md:order-1">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-3xl md:text-4xl font-bold">
                  Under Construction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <CardDescription className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  Kami sedang melakukan <span className="font-medium">pemindahan database</span> dan 
                  <span className="font-medium"> sedikit perubahan</span> pada sistem pendataan. 
                  Mohon bersabar, halaman ini akan segera kembali normal.
                </CardDescription>

                {/* Tombol Kembali */}
                <div className="pt-2">
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/">Kembali ke Beranda</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bagian Kanan: Gambar */}
          <div className="order-1 md:order-2">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1501791187590-9ef2612ba1eb?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Under Construction"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}