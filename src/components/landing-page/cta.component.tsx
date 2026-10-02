"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn-tools";
import { Mail, ArrowRight, Heart } from "lucide-react";

export default function CtaComponent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format email tidak valid");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Email submitted:", email);
    setSuccess(true);
    setEmail("");
    setIsLoading(false);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-ocean-600">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon and heading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Bergabung dalam Konservasi Penyu
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Dapatkan update terbaru tentang kegiatan konservasi penyu, kisah
            inspiratif dari lapangan, dan cara Anda bisa berkontribusi untuk
            menjaga kelangsungan hidup penyu Indonesia.
          </p>

          {/* Email signup form */}
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-lg mx-auto">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="p-4 bg-green-100 rounded-full">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-700">
                    Terima kasih!
                  </p>
                  <p className="text-green-600">
                    Email Anda telah terdaftar. Kami akan segera menghubungi
                    Anda.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  Daftar email lain
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Masukkan email Anda"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      disabled={isLoading}
                      className={cn(
                        "pl-10 h-12 text-lg",
                        error && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-8 text-lg bg-ocean-600 hover:bg-ocean-700"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Bergabung
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm text-left pl-1">
                    {error}
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Dengan bergabung, Anda menyetujui untuk menerima update
                  tentang kegiatan konservasi. Kami tidak akan membagikan email
                  Anda kepada pihak ketiga.
                </p>
              </form>
            )}
          </div>

          {/* Additional CTA text */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-ocean-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Berbagi pengetahuan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Menjadi relawan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white/60 rounded-full" />
              <span>Mendukung konservasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-ocean-700"
          />
          <path
            d="M0 120L60 110C120 100 240 85 360 75C480 65 600 60 720 60C840 60 960 65 1080 75C1200 85 1320 100 1380 107.5L1440 115V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-ocean-800"
          />
        </svg>
      </div>
    </section>
  );
}