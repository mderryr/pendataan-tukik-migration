import { NextResponse } from "next/server";
import { getLaporan } from "@/services/laporan/laporan";

// JSON laporan yang sudah diterbitkan, terbuka untuk umum (mis. untuk diolah pihak lain)
export async function GET(_request: Request, ctx: RouteContext<"/api/laporan/[id]">) {
  const { id } = await ctx.params;
  const laporan = await getLaporan(id);
  if (!laporan) return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });

  return NextResponse.json(laporan, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": `inline; filename="${laporan.id}-v${laporan.versi}.json"`,
    },
  });
}
