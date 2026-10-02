"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Home,
  Info,
  LogIn,
  Menu as MenuIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@/components/ui/button";
import Icon from "@/app/logo-sipenyu.png";
import { cn } from "@/utils/cn-tools";

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/pendataan", label: "Pendataan", icon: ClipboardList },
  { href: "/laporan", label: "Laporan Kegiatan", icon: FileText },
  { href: "/tentang-kami", label: "Tentang Kami", icon: Info },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(menuAnchor);
  const closeMenu = () => setMenuAnchor(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll(); // sync state when page is loaded already scrolled
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/70 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/60"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — circle background only while navbar is transparent */}
        <Link
          href="/"
          aria-label="Si Penyu - Beranda"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full transition-all duration-300",
            scrolled
              ? "bg-transparent p-0 ring-0"
              : "bg-background/80 p-1.5 shadow-md ring-1 ring-primary/20"
          )}
        >
          <Image
            src={Icon}
            alt="Si Penyu"
            priority
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          />
        </Link>

        {/* Desktop & tablet landscape menu */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive(link.href)
                  ? "text-primary"
                  : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden md:inline-flex">
            <Link href="/login">Masuk</Link>
          </Button>

          {/* Mobile & tablet portrait menu (Material UI dropdown) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-controls={open ? "mobile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open}
            onClick={(e) => setMenuAnchor(open ? null : e.currentTarget)}
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
          <Menu
            id="mobile-menu"
            anchorEl={menuAnchor}
            open={open}
            onClose={closeMenu}
            disableScrollLock
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  mt: 1,
                  minWidth: 240,
                  borderRadius: 3,
                  bgcolor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              },
            }}
            sx={{ display: { md: "none" } }}
          >
            {navLinks.map(({ href, label, icon: LinkIcon }) => {
              const active = isActive(href);
              return (
                <MenuItem
                  key={href}
                  component={Link}
                  href={href}
                  selected={active}
                  onClick={closeMenu}
                  sx={{
                    mx: 1,
                    my: 0.25,
                    py: 1.25,
                    borderRadius: 2,
                    color: active ? "hsl(var(--primary))" : "inherit",
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: "hsl(var(--primary) / 0.12)",
                    },
                    "&:hover": { bgcolor: "hsl(var(--accent))" },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit" }}>
                    <LinkIcon className="h-5 w-5" />
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: { fontSize: 15, fontWeight: active ? 600 : 500 },
                    }}
                  />
                </MenuItem>
              );
            })}
            <Divider sx={{ my: 1, borderColor: "hsl(var(--border))" }} />
            <MenuItem
              component={Link}
              href="/login"
              onClick={closeMenu}
              sx={{
                mx: 1,
                mb: 0.5,
                py: 1.25,
                borderRadius: 2,
                justifyContent: "center",
                fontWeight: 600,
                bgcolor: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                "&:hover": { bgcolor: "hsl(var(--primary) / 0.9)" },
              }}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Masuk
            </MenuItem>
          </Menu>
        </div>
      </div>
    </header>
  );
}
