"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ClipboardList,
  Egg,
  FileText,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Resource } from "@/services/auth/roles";
import { MENU_AKUN } from "./akun/menu-akun";

interface NavItem {
  path: string; // relatif terhadap /{tempatId}
  label: string;
  icon: LucideIcon;
}

const MENU_KONSERVASI: (NavItem & { resource?: Resource })[] = [
  { path: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
  { path: "/pendataan", label: "Pendataan", icon: ClipboardList, resource: "pendataan" },
  { path: "/arsip", label: "Arsip Data", icon: Archive, resource: "arsip" },
  { path: "/laporan", label: "Laporan", icon: FileText, resource: "laporan" },
];

// Anggota, jabatan, data tempat, zona & inkubator hanya untuk pengelola tempat
const MENU_MANAJEMEN: NavItem[] = [
  { path: "/manajemen/anggota", label: "Anggota", icon: Users },
  { path: "/manajemen/jabatan", label: "Jabatan", icon: ShieldCheck },
  { path: "/manajemen/tempat", label: "Tempat", icon: MapPin },
  { path: "/manajemen/zona", label: "Zona Pantai", icon: Waves },
  { path: "/manajemen/inkubator", label: "Inkubator & Bak", icon: Egg },
];

function useNavAktif(tempatId: string) {
  const pathname = usePathname();
  const base = `/${tempatId}`;
  return (path: string) => pathname === base + path || pathname.startsWith(`${base + path}/`);
}

function NavGroup({ label, items, tempatId }: { label: string; items: NavItem[]; tempatId: string }) {
  const aktif = useNavAktif(tempatId);
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ path, label, icon: Icon }) => (
            <SidebarMenuItem key={path}>
              <SidebarMenuButton asChild isActive={aktif(path)} tooltip={label}>
                {/* Di HP sidebar berupa Sheet: tutup setelah memilih menu */}
                <Link href={`/${tempatId}${path}`} onClick={() => isMobile && setOpenMobile(false)}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function TempatSidebar({
  tempat,
  menu,
  isAdmin,
}: {
  tempat: { id: string; nama: string; kabupaten: string };
  menu: Resource[]; // menu yang boleh dilihat (izin "read" dari jabatan)
  isAdmin: boolean;
}) {
  const konservasi = MENU_KONSERVASI.filter((item) => !item.resource || menu.includes(item.resource));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={tempat.nama}>
              <Link href={`/${tempat.id}/dashboard`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-sipenyu.png" alt="" width={32} height={32} className="size-8 shrink-0 rounded-md" />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{tempat.nama}</span>
                  <span className="truncate text-xs text-muted-foreground">{tempat.kabupaten}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Konservasi" items={konservasi} tempatId={tempat.id} />
        {isAdmin && <NavGroup label="Manajemen" items={MENU_MANAJEMEN} tempatId={tempat.id} />}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

// Bar atas konten: tombol buka/tutup sidebar + judul halaman; `children` di sisi kanan (mis. kartu profil)
export function TempatHeader({ tempatId, children }: { tempatId: string; children?: React.ReactNode }) {
  const aktif = useNavAktif(tempatId);
  const halaman = [...MENU_KONSERVASI, ...MENU_MANAJEMEN, ...MENU_AKUN].filter((item) => aktif(item.path)).at(-1);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <div className="mx-1 h-4 w-px bg-border" />
      <h1 className="truncate text-sm font-medium">{halaman?.label ?? "Dashboard"}</h1>
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </header>
  );
}
