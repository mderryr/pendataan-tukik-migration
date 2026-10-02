"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { cn } from "@/utils";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Testimonial data type
interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar?: string;
}

// Sample testimonials for Si Penyu
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Budi Santoso",
    role: "Petugas Konservasi",
    quote: "Si Penyu memudahkan pencatatan data penyu naik. Dulu saya harus bawa kertas, sekarang cukup HP saja. Sangat membantu pekerjaan lapangan!",
  },
  {
    id: 2,
    name: "Siti Aminah",
    role: "Admin KEE Pantai Kili-Kili",
    quote: "Laporan bulanan jadi lebih cepat selesai. Fitur export PDF menghemat waktu kami sekitar 70% dibandingkan cara lama.",
  },
  {
    id: 3,
    name: "Dr. Ahmad Fauzi",
    role: "Peneliti Universitas Brawijaya",
    quote: "Data yang terkumpul melalui Si Penyu sangat berguna untuk penelitian kami. Sistem pelaporan yang terstruktur memudahkan analisis.",
  },
  {
    id: 4,
    name: "Dewi Lestari",
    role: "Koordinator Volunteer",
    quote: "Sebagai volunteer, saya bisa langsung lihat data yang saya input. Transparansi ini membuat kami lebih semangat berkontribusi.",
  },
  {
    id: 5,
    name: "Hendra Wijaya",
    role: "Manager Operasional Pokmaswas",
    quote: "Dashboard admin sangat intuitif. Kami bisa pantau semua kegiatan konservasi dari satu tempat dengan mudah.",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return testimonials.length - 1;
      if (newIndex >= testimonials.length) return 0;
      return newIndex;
    });
  }, []);

  const goToSlide = (index: number) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setDirection(newDirection);
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [paginate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        paginate(-1);
      } else if (e.key === "ArrowRight") {
        paginate(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  return (
    <section className="w-full py-20 bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Apa Kata Pengguna
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cerita nyata dari tim konservasi yang telah menggunakan Si Penyu dalam kegiatan sehari-hari
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={() => paginate(-1)}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20",
              "hidden md:flex items-center justify-center",
              "w-12 h-12 rounded-full",
              "bg-white dark:bg-gray-700 shadow-lg",
              "text-teal-600 dark:text-teal-400",
              "hover:bg-teal-50 dark:hover:bg-gray-600",
              "transition-colors duration-200",
              "border border-teal-100 dark:border-teal-800"
            )}
            aria-label="Testimonial sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => paginate(1)}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20",
              "hidden md:flex items-center justify-center",
              "w-12 h-12 rounded-full",
              "bg-white dark:bg-gray-700 shadow-lg",
              "text-teal-600 dark:text-teal-400",
              "hover:bg-teal-50 dark:hover:bg-gray-600",
              "transition-colors duration-200",
              "border border-teal-100 dark:border-teal-800"
            )}
            aria-label="Testimonial berikutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden relative">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="w-full"
              >
                <div className="px-4 md:px-16">
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl">
                    <CardContent className="p-8 md:p-12">
                      {/* Quote Icon */}
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30">
                          <Quote className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                        </div>
                      </div>

                      {/* Quote Text */}
                      <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-8">
                        &ldquo;{testimonials[currentIndex].quote}&rdquo;
                      </blockquote>

                      {/* User Info */}
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 ring-2 ring-teal-200 dark:ring-teal-800">
                          <AvatarImage
                            src={testimonials[currentIndex].avatar}
                            alt={testimonials[currentIndex].name}
                          />
                          <AvatarFallback className="bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-lg font-semibold">
                            {testimonials[currentIndex].name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {testimonials[currentIndex].name}
                          </div>
                          <div className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                            {testimonials[currentIndex].role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "relative w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-teal-600 dark:text-teal-400 w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                )}
                aria-label={`Pindah ke testimonial ${index + 1}`}
              >
                <span className="sr-only">
                  {index === currentIndex
                    ? "Testimonial saat ini"
                    : `Pindah ke testimonial ${index + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;