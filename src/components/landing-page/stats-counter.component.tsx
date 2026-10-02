"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useSpring } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/utils/cn-tools";
import { LucideTurtle, LucideHome, LucideHeart, LucideAward } from "lucide-react";

interface CounterProps {
  value: number;
  duration?: number;
}

function Counter({ value, duration = 2 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const spring = useSpring(0, { duration, bounce: 0 });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latestValue: number) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latestValue).toLocaleString();
      }
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <span
      ref={ref}
      className="font-bold tabular-nums inline-block min-w-[4ch]"
    >
      0
    </span>
  );
}

interface StatsCounterItemProps {
  icon: React.ElementType;
  value: number;
  label: string;
  className?: string;
}

function StatsCounterItem({
  icon: Icon,
  value,
  label,
  className,
}: StatsCounterItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <Card
      ref={ref}
      className={cn(
        "border-teal-100 dark:border-teal-900 bg-white/80 dark:bg-teal-950/40 backdrop-blur-sm",
        "hover:shadow-lg hover:shadow-teal-100/50 dark:hover:shadow-teal-900/20 transition-all duration-300",
        "group",
        className
      )}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="p-3 rounded-full bg-teal-50 dark:bg-teal-900/50 group-hover:bg-teal-100 dark:group-hover:bg-teal-800/50 transition-colors">
          <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-4xl font-bold text-teal-700 dark:text-teal-300 min-h-[2.5rem] flex items-center">
          {isInView && <Counter value={value} duration={2} />}
        </div>
        <p className="text-sm text-center font-medium text-teal-800 dark:text-teal-200">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

const stats = [
  {
    icon: LucideTurtle,
    value: 12847,
    label: "Tukik Dilepas",
  },
  {
    icon: LucideHome,
    value: 342,
    label: "Sarang Dilindungi",
  },
  {
    icon: LucideHeart,
    value: 156,
    label: "Penyu Diselamatkan",
  },
  {
    icon: LucideAward,
    value: 28,
    label: "Tahun Konservasi",
  },
] as const;

export default function StatsCounter() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/20 dark:to-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-teal-900 dark:text-teal-100 mb-4">
            Dampak Konservasi Kami
          </h2>
          <p className="text-lg text-teal-700 dark:text-teal-300 max-w-2xl mx-auto">
            Setiap angka di bawah ini mewakili kehidupan laut yang kita lindungi
            bersama.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCounterItem
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}