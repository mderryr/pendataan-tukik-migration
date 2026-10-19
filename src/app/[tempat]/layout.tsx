import { notFound } from "next/navigation";
import { getDevice } from "@/services/device/get-device";
import { getTempat } from "@/services/tempat/tempat";

// Layout semua halaman /{tempat}/... — memastikan tempatnya ada.
// Halaman aplikasi ada di (app) dengan sidebar; halaman umum tempat ada di (publik) dengan navbar & footer.
// Tampilan bisa dibedakan per perangkat lewat atribut data-device (dari proxy) di CSS.
export default async function TempatLayout({
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
    <div data-device={device} className="min-h-screen">
      {children}
    </div>
  );
}
