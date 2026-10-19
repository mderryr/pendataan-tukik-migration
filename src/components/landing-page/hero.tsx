"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section
            id="main"
            className="relative w-full -mt-20 pt-16 pb-24 md:pb-32 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 px-4"
        >
            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center"
                >
                    {/* Badge */}
                    <div className="mb-6 mt-20 inline-flex items-center gap-2 rounded-full bg-teal-900/50 px-4 py-1.5 text-sm text-teal-200 backdrop-blur-sm border border-teal-700/50">
                        <Heart className="h-4 w-4" />
                        <span>Konservasi Penyu Indonesia</span>
                    </div>

                    {/* Headline */}
                    <h1 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                        Lindungi Penyu,{" "}
                        <span className="text-teal-300">Lestarikan Laut</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="mb-8 max-w-2xl text-lg leading-relaxed text-teal-100 md:text-xl">
                        Si Penyu adalah sistem digital untuk pendataan, pengawasan, dan pelaporan
                        konservasi penyu — langsung dari tangan para pejuang lingkungan.
                    </p>

                    {/* CTA Button */}
                    <Link href="/tentang-kami">
                        <Button
                            size="lg"
                            className="gap-2 bg-teal-600 text-white hover:bg-teal-500"
                        >
                            Pelajari Lebih Lanjut
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}