import "./globals.css";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ProviderApp from "./providers-tanstack";
import { SpeedInsights } from "@vercel/speed-insights/next";
// import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import moment from "moment";

const inter = Poppins({
  weight: "200",
  subsets: ["latin"],
});

// export const runtime = 'edge'

export const metadata: Metadata = {
  title: {
    default: "Si Penyu - Konservasi Penyu Indonesia",
    template: "%s | Si Penyu"
  },
  description: "Si Penyu adalah sistem informasi pendataan, pengawasan, dan pelaporan konservasi penyu Indonesia. Dukung upaya pelestarian penyu hijau, penyu belimbing, dan lainnya. konservasi real-time dari lapangan.",
  keywords: [
    "konservasi penyu",
    "penyu indonesia",
    "pendataan penyu",
    "tukik",
    "pelestarian laut",
    "pantai kili kili",
    "trenggalek",
    "pertamina patra niaga",
    "universitas brawijaya",
    "conservation",
    "sea turtle",
    "turtle monitoring"
  ],
  authors: [{ name: "Si Penyu Team", url: "https://sipenyu.id" }],
  creator: "Si Penyu",
  publisher: "Si Penyu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://sipenyu.id"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://sipenyu.id",
    title: "Si Penyu - Konservasi Penyu Indonesia",
    description: "Sistem informasi pendataan, pengawasan, dan pelaporan konservasi penyu Indonesia. Dukung upaya pelestarian penyu.",
    siteName: "Si Penyu",
    images: [
      {
        url: "/logo-sipenyu.png",
        width: 512,
        height: 512,
        alt: "Si Penyu Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Si Penyu - Konservasi Penyu Indonesia",
    description: "Sistem informasi pendataan, pengawasan, dan pelaporan konservasi penyu Indonesia.",
    images: ["/logo-sipenyu.png"],
    creator: "@sipenyu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-sipenyu.png",
    shortcut: "/logo-sipenyu.png",
    apple: "/logo-sipenyu.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  moment.locale();

  return (
    <html data-theme="cupcake" lang="en" suppressHydrationWarning >
      <head>
      </head>

      <body className=" no-underline ">
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        > */}
        <ProviderApp>
          {/* Navbar & footer ada di layout masing-masing: (public)/layout.tsx dan [tempat]/layout.tsx */}
          {children}
          <Toaster />
          <SpeedInsights />
          <Analytics />
        </ProviderApp>
        {/* </ThemeProvider> */}
      </body>
      {/* <Script src='https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js' 
      integrity='sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm' 
      crossOrigin='anonymous'/>

     <Script async src="https://unpkg.com/@material-tailwind/html@latest/scripts/ripple.js" />
     <Script src="https://unpkg.com/@themesberg/flowbite@1.1.1/dist/flowbite.bundle.js" />
     <Script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js" /> */}
    </html>
  );
}
