import type { Metadata } from "next";
import AuthCard from "@/components/auth/auth-card.component";
import MapEmbed, { googleMapsUrl } from "@/components/maps/map-embed.component";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { approveRegistrationAction, rejectRegistrationAction } from "@/services/auth/actions";
import { getPendingRegistration } from "@/services/auth/registration";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Persetujuan Tempat", robots: { index: false, follow: false } };

function DataList({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="break-words font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Dibuka dari link di email owner. Persetujuan butuh klik tombol (POST), bukan cukup membuka link,
// supaya pemindai link di email tidak menyetujui secara otomatis.
export default async function PersetujuanPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id = "", token = "" } = await searchParams;
  const request = id && token ? await getPendingRegistration(id, token) : null;

  if (!request) {
    return (
      <section className="min-h-screen flex items-center px-4 py-10">
        <AuthCard title="Link Tidak Valid">
          <Alert variant="destructive">
            <AlertDescription>
              Link persetujuan tidak valid, sudah dipakai, atau sudah kedaluwarsa (48 jam).
            </AlertDescription>
          </Alert>
        </AuthCard>
      </section>
    );
  }

  const { tempat, pengelola } = request;

  return (
    <section className="min-h-screen flex items-center px-4 pt-24 pb-10">
      <AuthCard
        title="Persetujuan Tempat Konservasi"
        description="Periksa data tempat dan pengelolanya, lalu setujui atau tolak."
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">{tempat.nama}</h3>
            <DataList
              rows={[
                ["Link", `/${tempat.slug}/dashboard`],
                ["Alamat", tempat.alamat],
                ["Wilayah", `${tempat.kabupaten}, ${tempat.provinsi}`],
                ["Kontak", tempat.kontak],
                ...(tempat.keterangan ? [["Keterangan", tempat.keterangan] as [string, string]] : []),
              ]}
            />
            <MapEmbed lokasi={tempat.lokasi} />
            <a
              href={googleMapsUrl(tempat.lokasi)}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline underline-offset-4"
            >
              Buka di Google Maps
            </a>
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Pengelola</h3>
            <DataList
              rows={[
                ["Nama", pengelola.nama],
                ["Username", pengelola.username],
                ["Email", pengelola.email],
              ]}
            />
          </div>

          <form className="flex gap-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="token" value={token} />
            <Button type="submit" formAction={approveRegistrationAction} className="flex-1">
              Setujui
            </Button>
            <Button type="submit" formAction={rejectRegistrationAction} variant="destructive" className="flex-1">
              Tolak
            </Button>
          </form>
        </div>
      </AuthCard>
    </section>
  );
}
