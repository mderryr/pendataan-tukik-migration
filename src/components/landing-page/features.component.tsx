"use client";

import {
  ClipboardList,
  FileBarChart,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn-tools";

const features = [
  {
    icon: ClipboardList,
    title: "Pendataan",
    description:
      "Catat data penyu naik, telur dikerami, dan tukik dengan form yang mudah digunakan diHP.",
  },
  {
    icon: FileBarChart,
    title: "Pelaporan",
    description:
      "Buat laporan bulanan dan tahunan secara otomatis dengan visualisasi data yang jelas.",
  },
  {
    icon: Eye,
    title: "Pengawasan",
    description:
      "Pantau progres konservasi dari satu platform terpadu — dari lapangan sampai pelepasan.",
  },
];

export default function FeaturesComponent() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-teal-50 dark:from-black dark:to-teal-950/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-teal-900 dark:text-teal-100 sm:text-4xl">
            Fitur Unggulan
          </h2>
          <p className="mt-4 text-lg text-teal-700 dark:text-teal-300 max-w-2xl mx-auto">
            Si Penyu membantu petugas konservasi mencatat, mengawasi, dan melaporkan
            aktivitas konservasi penyu dengan lebih mudah.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={cn(
                "group relative overflow-hidden border-teal-200 dark:border-teal-800",
                "bg-white/80 dark:bg-teal-950/30 backdrop-blur-sm",
                "hover:border-teal-400 dark:hover:border-teal-500",
                "transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10",
                "hover:-translate-y-1"
              )}
            >
              <CardContent className="p-6">
                <div
                  className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center",
                    "rounded-lg bg-teal-100 dark:bg-teal-900/50",
                    "text-teal-600 dark:text-teal-400",
                    "group-hover:bg-teal-500 group-hover:text-white",
                    "transition-colors duration-300"
                  )}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-teal-900 dark:text-teal-100">
                  {feature.title}
                </h3>
                <p className="text-teal-700 dark:text-teal-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}