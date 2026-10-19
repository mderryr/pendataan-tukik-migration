import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import FirebaseAuthSync from "@/components/auth/firebase-auth-sync.component";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FIREBASE_ENABLED } from "@/env/firebase.flag";
import { can, isTempatAdmin, RESOURCES, ROLE_LABEL } from "@/services/auth/roles";
import { getProfil } from "@/services/akun/akun";
import { getTempatAccess } from "@/services/auth/session";
import { getAnggota } from "@/services/tempat/anggota";
import { listJabatan } from "@/services/tempat/jabatan";
import { getTempat } from "@/services/tempat/tempat";
import NavPengguna from "./nav-pengguna";
import { TempatHeader, TempatSidebar } from "./tempat-sidebar";

// Halaman aplikasi tiap tempat (/{tempatId}/dashboard, /pendataan, /arsip, /laporan, /manajemen, /akun)
// dengan sidebar — hanya untuk anggota tempat ini (dan owner). Folder "(app)" tidak ikut ke URL.
export default async function TempatAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tempat: string }>;
}) {
  const { tempat: tempatId } = await params;
  const user = await getTempatAccess(tempatId);
  const [tempat, profil, anggota, jabatanList, cookieStore] = await Promise.all([
    getTempat(tempatId),
    getProfil(user),
    getAnggota(user.uid),
    user.role === "custom" ? listJabatan(tempatId) : Promise.resolve([]),
    cookies(),
  ]);
  if (!tempat) notFound();

  const menu = RESOURCES.filter((resource) => can(user, `${resource}:read`, tempatId));
  // Anggota "custom" ditampilkan dengan nama jabatannya, mis. "Petugas Lapangan"
  const jabatan = jabatanList.find((j) => j.id === anggota?.jabatanId);
  const peran = jabatan?.nama ?? (user.role ? ROLE_LABEL[user.role] : "");
  // Cookie ditulis komponen Sidebar supaya posisi buka/tutup diingat antar halaman
  const sidebarTerbuka = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider defaultOpen={sidebarTerbuka}>
      <FirebaseAuthSync uid={user.uid} />
      <TempatSidebar tempat={tempat} menu={menu} isAdmin={isTempatAdmin(user, tempatId)} />
      <SidebarInset>
        <TempatHeader tempatId={tempatId}>
          {!FIREBASE_ENABLED && (
            <span className="whitespace-nowrap rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Mode tampilan
              <span className="hidden lg:inline"> · data contoh, tidak disimpan</span>
            </span>
          )}
          <NavPengguna tempatId={tempatId} profil={profil} peran={peran} />
        </TempatHeader>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
