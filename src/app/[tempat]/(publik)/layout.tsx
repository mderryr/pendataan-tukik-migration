import { notFound } from "next/navigation";
import TempatFooter from "@/components/tempat/tempat-footer.component";
import TempatNavbar from "@/components/tempat/tempat-navbar.component";
import { getDevice } from "@/services/device/get-device";
import { getTempat } from "@/services/tempat/tempat";

// Halaman umum /{tempat}/... (di luar aplikasi tempat) — navbar & footer tempat.
// Folder "(publik)" tidak ikut ke URL.
export default async function TempatPublikLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tempat: string }>;
}) {
  const { tempat: tempatId } = await params;
  const [tempat, device] = await Promise.all([getTempat(tempatId), getDevice()]);
  if (!tempat) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <TempatNavbar tempat={tempat} device={device} />
      <main className="flex-1">{children}</main>
      <TempatFooter tempat={tempat} device={device} />
    </div>
  );
}
