"use client";

import Link from "next/link";
// import Navbar from "@/components/another/navbar-all.component";
// import Footer from "@/components/another/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn-tools";

export default function TentangKami() {
    return (
        <>
            {/* <Navbar /> */}

            {/* Hero Section */}
            <section
                className={cn(
                    "relative w-full min-h-[50vh]",
                    "flex flex-col items-center justify-center",
                    "bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900",
                    "text-white text-center px-6 py-20"
                )}
            >
                <div className="max-w-3xl space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Tentang Si Penyu
                    </h1>
                    <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
                        Sistem informasi untuk mendukung konservasi penyu di Indonesia
                        melalui pendataan, pengawasan, dan pelaporan digital.
                    </p>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
                {/* About Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-teal-900 dark:text-teal-100">
                        Apa Itu Si Penyu?
                    </h2>
                    <Card className="border-teal-100 dark:border-teal-800 shadow-lg">
                        <CardContent className="p-6 md:p-8">
                            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed text-center max-w-4xl mx-auto">
                                Si Penyu adalah sistem informasi yang dikembangkan untuk mendukung konservasi penyu di Indonesia.
                                Melalui platform ini, pengguna dapat melakukan pendataan, pengawasan, dan pelaporan aktivitas konservasi
                                secara digital. Kami percaya bahwa teknologi dapat menjadi jembatan untuk menciptakan ekosistem laut yang
                                lebih lestari bagi generasi mendatang.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Values Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-teal-900 dark:text-teal-100">
                        Nilai-Nilai Kami
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Konservasi */}
                        <Card className="border-teal-100 dark:border-teal-800 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
                                    <Heart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <CardTitle className="text-xl text-teal-900 dark:text-teal-100">
                                    Konservasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Berkomitmen melindungi dan melestarikan populasi penyu
                                    Indonesia untuk keseimbangan ekosistem laut.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Kolaborasi */}
                        <Card className="border-teal-100 dark:border-teal-800 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <CardTitle className="text-xl text-teal-900 dark:text-teal-100">
                                    Kolaborasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Membangun kemitraan strategis dengan komunitas,
                                    akademisi, dan pemangku kepentingan lainnya.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Keberlanjutan */}
                        <Card className="border-teal-100 dark:border-teal-800 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                                    <Globe className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <CardTitle className="text-xl text-teal-900 dark:text-teal-100">
                                    Keberlanjutan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Memastikan upaya konservasi dapat berlanjut secara
                                    jangka panjang untuk manfaat generasi mendatang.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Thanks Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-teal-900 dark:text-teal-100">
                        感谢合作伙伴
                    </h2>
                    <p className="text-xl font-medium text-center text-teal-800 dark:text-teal-200 mb-2">
                        Terima Kasih kepada Mitra
                    </p>
                    <Card className="border-teal-100 dark:border-teal-800 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950">
                        <CardContent className="p-6 md:p-8 text-center">
                            <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed max-w-4xl mx-auto mb-6">
                                Kami mengucapkan terima kasih sebesar-besarnya kepada pihak yang telah menjadi inisiator dan sponsor awal,
                                yaitu <span className="font-semibold text-teal-700 dark:text-teal-300">Pertamina Patra Niaga</span> dan
                                <span className="font-semibold text-teal-700 dark:text-teal-300"> Universitas Brawijaya</span>.
                                Terima kasih juga terhadap Pokmaswas Pantai Taman Kili Kili sebagai tempat uji coba sistem ini.
                                Dukungan mereka menjadi pondasi penting dalam pengembangan awal platform ini.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button variant="outline" className="border-teal-500 text-teal-700 hover:bg-teal-100 dark:border-teal-400 dark:text-teal-300 dark:hover:bg-teal-900">
                                    Baca Buku Panduan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Coming Soon Section */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center text-teal-900 dark:text-teal-100">
                        Fitur Mendatang
                    </h2>
                    <Card className="border-teal-100 dark:border-teal-800 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl text-teal-900 dark:text-teal-100">
                                Coming Soon
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        Dashboard Analitik Real-time
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Visualisasi data konservasi yang interaktif dan mendalam.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        Fitur Sponsor
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Platform untuk pihak konservasi yang ingin berkontribusi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        Perbaikan Tampilan
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Pengalaman pengguna yang lebih intuitif di semua perangkat.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>

            {/* <Footer /> */}
        </>
    );
}