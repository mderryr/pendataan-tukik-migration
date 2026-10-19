import Link from "next/link";
import { notFound } from "next/navigation";
import MapEmbed, { googleMapsUrl } from "@/components/maps/map-embed.component";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { actionLabel, can, RESOURCE_ACTIONS, RESOURCE_LABEL, RESOURCES, type Permission } from "@/services/auth/roles";
import { requireTempatAccess } from "@/services/auth/session";
import { getAnggota } from "@/services/tempat/anggota";
import { listJabatan } from "@/services/tempat/jabatan";
import { getTempat } from "@/services/tempat/tempat";

export default async function RingkasanPage({ params }: { params: Promise<{ tempat: string }> }) {
  const { tempat: tempatId } = await params;
  const user = await requireTempatAccess(tempatId);

  const [tempat, profil, jabatanList] = await Promise.all([
    getTempat(tempatId),
    getAnggota(user.uid),
    listJabatan(tempatId),
  ]);
  if (!tempat) notFound();

  const jabatan = jabatanList.find((j) => j.id === profil?.jabatanId);
  const subject = { ...user, permissions: jabatan?.permissions ?? [] };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Halo, {profil?.nama ?? user.email}</CardTitle>
            <CardDescription>
              {jabatan ? `Jabatan kamu: ${jabatan.nama}` : "Kamu punya akses penuh di tempat ini."}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Akses Kamu</CardTitle>
            <CardDescription>Menu yang bisa kamu buka dan apa saja yang boleh dilakukan di sana.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {RESOURCES.map((resource) => {
              const izin = RESOURCE_ACTIONS[resource].filter((action) =>
                can(subject, `${resource}:${action}` as Permission, tempatId)
              );
              const bisaBuka = izin.includes("read");
              return (
                <div key={resource} className={`rounded-md border p-3 ${bisaBuka ? "" : "opacity-50"}`}>
                  {bisaBuka ? (
                    <Link
                      href={`/${tempatId}/${resource}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {RESOURCE_LABEL[resource]}
                    </Link>
                  ) : (
                    <p className="font-medium">{RESOURCE_LABEL[resource]}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {izin.length ? (
                      izin.map((action) => (
                        <Badge key={action} variant="secondary">
                          {actionLabel(resource, action)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Tidak ada akses</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Info Tempat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{tempat.alamat}</p>
          <p className="text-muted-foreground">Kontak: {tempat.kontak}</p>
          {tempat.keterangan && <p className="text-muted-foreground">{tempat.keterangan}</p>}
          <MapEmbed lokasi={tempat.lokasi} className="h-48" />
          <a href={googleMapsUrl(tempat.lokasi)} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            Buka di Google Maps
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
