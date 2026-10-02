"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/utils/cn-tools"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "Apa itu Si Penyu?",
    answer:
      "Si Penyu adalah aplikasi sistem informasi untuk pendataan, pengawasan, dan pelaporan konservasi penyu di Indonesia. Aplikasi ini membantu petugas konservasi mencatat data harian dari lapangan, mulai dari penyu naik, telur yang dikeram, hingga tukik yang dilepas ke alam.",
  },
  {
    question: "Bagaimana cara menggunakan aplikasi Si Penyu?",
    answer:
      "Petugas konservasi dapat menggunakan Si Penyu melalui browser di perangkat mobile atau desktop. Cukup login dengan akun yang telah diberikan, kemudian pilih menu pendataan yang sesuai dengan aktivitas yang ingin dicatat. Data akan tersimpan secara otomatis dan dapat diakses untuk membuat laporan.",
  },
  {
    question: "Fitur apa saja yang tersedia di Si Penyu?",
    answer:
      "Si Penyu menyediakan fitur pendataan penyu naik, pencatatan telur diselamatkan dan dikeram, pemantauan tukik menetas, pencatatan tukik yang mati atau dilepas, serta pembuatan laporan bulanan dan tahunan. Aplikasi juga mendukung pelacakan zona pantai dan pengelolaan data petugas.",
  },
  {
    question: "Apa saja kegiatan konservasi penyu yang dilakukan?",
    answer:
      "Kegiatan konservasi penyu meliputi pengawasan pantai untuk mendeteksi penyu yang naik bertelur, penyelamatan telur dari sarang alami, pengeraman telur dengan metode semi-alami, perawatan tukik di inkubator, dan pelepasan tukik ke laut. Setiap kegiatan dicatat secara rinci untuk pemantauan populasi.",
  },
  {
    question: "Bagaimana saya bisa berkontribusi dalam konservasi penyu?",
    answer:
      "Anda dapat berkontribusi dengan menjadivolunteer di lokasi konservasi, mendonasi untuk mendukung operasional, menyebarkan kesadaran tentang pentingnya konservasi penyu, atau melaporkan aktivitas illegal yang mengancam penyu. Hubungi tim kami untuk informasi lebih lanjut tentang program kontribusi.",
  },
  {
    question: "Apakah data konservasi dapat diakses publik?",
    answer:
      "Ya, laporan umum tentang kegiatan konservasi dan populasi penyu dapat diakses melalui halaman laporan di website kami. Data detail bersifat internal untuk petugas dan admin konservasi demi keamanan dan integritas data.",
  },
  {
    question: "Jenis penyu apa yang dilindungi di Indonesia?",
    answer:
      "Indonesia memiliki 7 dari 8 jenis penyu dunia, yaitu Penyu Hijau, Penyu Belimbing, Penyu Tempayan, Penyu Lekang, Penyu Pipih, Penyu Sisik, dan Penyu Kemp's Ridley. Setiap jenis memiliki karakteristik dan habitat yang berbeda.",
  },
  {
    question: "Bagaimana cara melaporkan penyu yang terluka atau dalam bahaya?",
    answer:
      "Jika Anda menemukan penyu yang terluka atau dalam bahaya, segera hubungi petugas konservasi terdekat atau otoritas terkait. Jangan mencoba menangani sendiri. Dokumentasikan lokasi dan kondisi penyu jika memungkinkan, dan tunggu bantuan dari tim profesional.",
  },
]

export default function FAQComponent() {
  return (
    <section
      id="faq"
      className={cn(
        "py-16 md:py-24 bg-gradient-to-b",
        "from-teal-50 via-white to-teal-50",
        "dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
        "transition-colors duration-300"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
            Pertanyaan yang{" "}
            <span className="text-teal-600 dark:text-teal-400">Sering Ditanyakan</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Temukan jawaban untuk pertanyaan umum tentang Si Penyu dan upaya konservasi penyu
            di Indonesia.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion
            type="single"
            collapsible
            className="space-y-4"
            defaultValue="item-0"
          >
            {faqData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className={cn(
                    "border rounded-xl px-4",
                    "bg-white dark:bg-slate-800",
                    "border-teal-100 dark:border-teal-900/30",
                    "hover:border-teal-300 dark:hover:border-teal-700",
                    "transition-colors duration-300"
                  )}
                >
                  <AccordionTrigger
                    className={cn(
                      "text-left py-4 text-base md:text-lg",
                      "text-slate-700 dark:text-slate-200",
                      "hover:text-teal-700 dark:hover:text-teal-300",
                      "[&[data-state=open]>svg]:rotate-180",
                      "transition-all duration-300"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full",
                          "bg-teal-100 dark:bg-teal-900/50",
                          "text-teal-600 dark:text-teal-400",
                          "flex items-center justify-center text-xs font-bold"
                        )}
                      >
                        {index + 1}
                      </span>
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent
                    className={cn(
                      "text-slate-600 dark:text-slate-400",
                      "text-sm md:text-base",
                      "pl-9 md:pl-12",
                      "leading-relaxed"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.answer}
                      </motion.p>
                    </AnimatePresence>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            masih ada pertanyaan lainnya?
          </p>
          <a
            href="/tentang-kami"
            className={cn(
              "inline-flex items-center gap-2",
              "px-6 py-3 rounded-full",
              "bg-teal-600 hover:bg-teal-700",
              "text-white font-medium",
              "transition-all duration-300",
              "hover:shadow-lg hover:scale-105"
            )}
          >
            Hubungi Kami
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}