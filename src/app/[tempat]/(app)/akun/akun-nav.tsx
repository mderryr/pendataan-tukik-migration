"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn-tools";
import { MENU_AKUN } from "./menu-akun";

export default function AkunNav({ tempatId }: { tempatId: string }) {
  const pathname = usePathname();
  const base = `/${tempatId}`;

  return (
    <nav className="flex w-fit gap-1 rounded-lg bg-muted p-1">
      {MENU_AKUN.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          href={base + path}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
            pathname === base + path
              ? "bg-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
