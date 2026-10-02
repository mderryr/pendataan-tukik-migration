"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn-tools";

interface FooterLink {
  href: string;
  label: string;
}

interface SocialLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface ContactInfo {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const quickLinks: FooterLink[] = [
  { href: "/tentang-kami", label: "Tentang" },
  { href: "/laporan", label: "Laporan" },
  { href: "/#kontak", label: "Kontak" },
];

const socialLinks: SocialLink[] = [
  { href: "https://facebook.com/sipenyu", label: "Facebook", icon: Facebook },
  { href: "https://instagram.com/sipenyu", label: "Instagram", icon: Instagram },
  { href: "https://twitter.com/sipenyu", label: "Twitter", icon: Twitter },
];

const contactInfo: ContactInfo[] = [
  { icon: Mail, label: "Email", value: "sipenyu.id@gmail.com", href: "mailto:sipenyu.id@gmail.com" },
  { icon: Phone, label: "Telepon", value: "+62 813-3216-0311", href: "tel:+6281332160311" },
  { icon: MapPin, label: "Alamat", value: "Pantai Taman Kili Kili, Panggul, Trenggalek" },
];

const FooterLinkItem = ({ href, label }: FooterLink) => (
  <li>
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors hover:text-teal-400",
        "text-teal-100/70"
      )}
    >
      {label}
    </Link>
  </li>
);

const SocialLinkItem = ({ href, label, icon: Icon }: SocialLink) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-lg",
      "bg-teal-900/50 text-teal-300",
      "transition-all duration-300",
      "hover:bg-teal-500 hover:text-white",
      "hover:shadow-lg hover:shadow-teal-500/25",
      "border border-teal-800/50 hover:border-teal-400"
    )}
  >
    <Icon className="h-4 w-4" />
  </a>
);

const ContactItem = ({ icon: Icon, label, value, href }: ContactInfo) => (
  <div className="flex items-start gap-3">
    <div
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "bg-teal-900/50 text-teal-400",
        "border border-teal-800/50"
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-teal-400/70">{label}</p>
      {href ? (
        <a
          href={href}
          className={cn(
            "text-sm text-teal-100 transition-colors hover:text-teal-300 truncate block",
            "break-all"
          )}
        >
          {value}
        </a>
      ) : (
        <p className={cn("text-sm text-teal-100", "break-words")}>{value}</p>
      )}
    </div>
  </div>
);

export default function FooterComponent() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "relative w-full overflow-hidden",
        "bg-gradient-to-b from-teal-950 to-black",
        "text-white"
      )}
    >
      {/* Decorative top wave pattern */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

      {/* Background pattern overlay */}
      <div
        className={cn(
          "absolute inset-0 opacity-5",
          "[background-image:radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_1px)]",
          "[background-size:40px_40px]"
        )}
      />

      <div className="relative container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo-sipenyu.png"
                  alt="Si Penyu Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">Si Penyu</span>
            </Link>
            <p className="text-sm text-teal-100/70 leading-relaxed max-w-xs">
              Sistem informasi pendataan, pengawasan, dan pelaporan konservasi
              penyu Indonesia. Mari lestarikan penyu bersama kami.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4",
                "text-teal-300"
              )}
            >
              Navigasi
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <FooterLinkItem key={link.href} {...link} />
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4",
                "text-teal-300"
              )}
            >
              Kontak
            </h3>
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <ContactItem key={index} {...info} />
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3
              className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4",
                "text-teal-300"
              )}
            >
              Ikuti Kami
            </h3>
            <p className="text-sm text-teal-100/70 mb-4">
              Dapatkan informasi terbaru tentang konservasi penyu di media
              sosial kami.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <SocialLinkItem key={social.label} {...social} />
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "my-8 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"
          )}
        />

        {/* Bottom Section */}
        <div
          className={cn(
            "flex flex-col md:flex-row items-center justify-between gap-4",
            "text-center md:text-left"
          )}
        >
          <p
            className={cn(
              "text-sm text-teal-100/60",
              "order-2 md:order-1"
            )}
          >
            © {currentYear} Si Penyu. Semua Hak Dilindungi.
          </p>
          <div
            className={cn(
              "flex items-center gap-4 text-xs text-teal-100/50",
              "order-1 md:order-2"
            )}
          >
            <Link
              href="/privacy"
              className="hover:text-teal-400 transition-colors"
            >
              Kebijakan Privasi
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link
              href="/terms"
              className="hover:text-teal-400 transition-colors"
            >
              Syarat Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}