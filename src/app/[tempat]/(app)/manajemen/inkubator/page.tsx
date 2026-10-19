import type { Metadata } from "next";
import { requireTempatAdmin } from "@/services/auth/session";
import { listSarana } from "@/services/tempat/sarana";
import { SaranaCard } from "../sarana";

export const metadata: Metadata = { title: "Inkubator & Bak" };

export default async function InkubatorPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);

  const inkubator = await listSarana(tempatId, "inkubator");
  return (
    <div className="max-w-3xl space-y-3">
      <SaranaCard tempatId={tempatId} jenis="inkubator" list={inkubator} />
      <p className="text-xs text-muted-foreground">
        Inkubator & bak tidak dihapus, hanya dinonaktifkan, supaya data lama yang memakainya tetap terbaca.
      </p>
    </div>
  );
}
