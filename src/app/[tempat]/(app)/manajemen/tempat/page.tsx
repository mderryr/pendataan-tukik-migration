import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTempatAdmin } from "@/services/auth/session";
import { getTempat } from "@/services/tempat/tempat";
import TempatManager from "./tempat-manager";

export const metadata: Metadata = { title: "Data Tempat" };

export default async function TempatPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);

  const tempat = await getTempat(tempatId);
  if (!tempat) notFound();

  return <TempatManager tempat={tempat} />;
}
