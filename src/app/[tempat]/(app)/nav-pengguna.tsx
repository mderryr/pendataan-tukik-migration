"use client";

import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import FotoProfil from "@/components/akun/foto-profil.component";
import { useLogout } from "@/components/auth/logout-button.component";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Profil } from "@/services/akun/akun";
import { MENU_AKUN } from "./akun/menu-akun";

// Kartu profil di pojok kanan atas; ditekan → menu pengaturan akun & keluar.
// Di HP hanya foto, di layar lebih lebar ditambah nama & jabatan.
export default function NavPengguna({ tempatId, profil, peran }: { tempatId: string; profil: Profil; peran: string }) {
  const { onLogout, pending } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-md p-1 text-left outline-none ring-ring transition-colors hover:bg-accent focus-visible:ring-2 data-[state=open]:bg-accent sm:pr-2"
        aria-label="Akun Saya"
      >
        <FotoProfil nama={profil.nama} foto={profil.foto} className="shrink-0" />
        <div className="hidden max-w-40 leading-tight sm:grid">
          <span className="truncate text-sm font-medium">{profil.nama}</span>
          <span className="truncate text-xs text-muted-foreground">{peran}</span>
        </div>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={6} className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <FotoProfil nama={profil.nama} foto={profil.foto} className="shrink-0" />
          <div className="grid flex-1 leading-tight">
            <span className="truncate text-sm font-medium">{profil.nama}</span>
            <span className="truncate text-xs text-muted-foreground">{profil.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {MENU_AKUN.map(({ path, label, icon: Icon }) => (
            <DropdownMenuItem key={path} asChild>
              <Link href={`/${tempatId}${path}`}>
                <Icon className="mr-2 size-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} disabled={pending}>
          <LogOut className="mr-2 size-4" />
          {pending ? "Keluar..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
