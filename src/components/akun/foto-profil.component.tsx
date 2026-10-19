import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils/cn-tools";

export const inisial = (nama: string) =>
  nama
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");

// Foto profil bulat; kalau belum ada foto, tampil inisial nama
export default function FotoProfil({
  nama,
  foto,
  className,
}: {
  nama: string;
  foto: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {foto && <AvatarImage src={foto} alt={nama} className="object-cover" />}
      <AvatarFallback className="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
        {inisial(nama)}
      </AvatarFallback>
    </Avatar>
  );
}
