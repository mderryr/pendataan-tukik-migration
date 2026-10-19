import { requireTempatAdmin } from "@/services/auth/session";

// /{tempatId}/manajemen/... — khusus pengelola tempat & owner.
// Sub-menu (Anggota, Jabatan, Tempat, Zona, Inkubator) ada di sidebar.
export default async function ManajemenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tempat: string }>;
}) {
  const { tempat: tempatId } = await params;
  await requireTempatAdmin(tempatId);
  return children;
}
