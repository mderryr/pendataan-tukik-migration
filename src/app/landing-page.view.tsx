"use client";


import Hero from '@/components/landing-page/hero'
import Features from "@/components/landing-page/features";
import Sponsors from '@/components/landing-page/sponsors'
import ScrollToTop from "@/components/another/scrollToTop.component";


export default function LandingPage() {
  return (
      <main>
        <Hero />
        <Features />
        <Sponsors />
        <ScrollToTop />
      </main>
  );
}

