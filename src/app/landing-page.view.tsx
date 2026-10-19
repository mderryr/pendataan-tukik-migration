"use client";

import Hero from "@/components/landing-page/hero";
import Features from "@/components/landing-page/features";
import Sponsors from "@/components/landing-page/sponsors";
import ScrollToTop from "@/components/another/scrollToTop.component";

export default function LandingPage() {
    return (
        <main>
            <Hero />
            <div className=" mt-48 md:mt-20 lg:mt-32" />
            <Features />
            <div className="mt-40 md:mt-20 lg:mt-32" />
            <Sponsors />
            <ScrollToTop />
        </main>
    );
}

