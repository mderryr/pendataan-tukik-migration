import { KeyRound, Mail, UserRound, type LucideIcon } from "lucide-react";

// Pengaturan akun sendiri; dipakai dropdown kartu nama di sidebar, judul halaman, dan sub-navigasi akun.
// path relatif terhadap /{tempatId}
export const MENU_AKUN: { path: string; label: string; icon: LucideIcon }[] = [
  { path: "/akun", label: "Data Diri", icon: UserRound },
  { path: "/akun/password", label: "Password", icon: KeyRound },
  { path: "/akun/email", label: "Email", icon: Mail },
];
