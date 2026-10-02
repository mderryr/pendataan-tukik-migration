
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils";

import Pertamina from '@/asset/image/logo-pertamina.png'
import Brawijaya from '@/asset/image/Logo_Universitas_Brawijaya.png'
import Pokmaswas from '@/asset/image/logo-pokmaswas.png'

interface Sponsor {
    name: string;
    logo: typeof Pertamina;
    link: string | null;
}

const sponsors: Sponsor[] = [
    {
        name: "Pertamina Patra Niaga",
        logo: Pertamina,
        link: "https://maps.app.goo.gl/WMnsuJPv67LRtZso9",
    },
    {
        name: "Universitas Brawijaya",
        logo: Brawijaya,
        link: null,
    },
    {
        name: "KEE Pantai Taman Kili-Kili",
        logo: Pokmaswas,
        link: null,
    },
];

export default function Sponsors() {
    return (
        <section className={cn(
            "w-full py-16 bg-gray-100 dark:bg-gray-900 max-md:mt-32"
        )}>
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-semibold text-black dark:text-white mb-8">
                    Terima kasih atas dukungan dari
                </h2>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    {sponsors.map((sponsor, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative w-40 h-20 grayscale",
                                "hover:grayscale-0 transition-all duration-300",
                                "transform hover:scale-105"
                            )}
                        >
                            {sponsor.link ? (
                                <Link
                                    href={sponsor.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full h-full"
                                >
                                    <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        fill
                                        sizes="160px"
                                        className="object-contain"
                                    />
                                </Link>
                            ) : (
                                <Image
                                    src={sponsor.logo}
                                    alt={sponsor.name}
                                    fill
                                    sizes="160px"
                                    className="object-contain"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

