import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTempatAdmin } from "@/services/auth/session";
import { listZona } from "@/services/tempat/sarana";
import { getTempat } from "@/services/tempat/tempat";
import ZonaManager from "./zona-manager";

export const metadata: Metadata = { title: "Zona Pantai" };

export default async function ZonaPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);

  const [tempat, zona] = await Promise.all([getTempat(tempatId), listZona(tempatId)]);
  if (!tempat) notFound();

  return <ZonaManager tempatId={tempatId} pusat={tempat.lokasi} zona={zona} />;
}
