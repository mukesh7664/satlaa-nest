"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Offer {
    id: string;
    title: string;
    description: string;
    image?: string;
}

interface WhatWeOfferProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    offers?: Offer[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

export default function WhatWeOffer({ data, sectionIndex }: { data: WhatWeOfferProps, sectionIndex?: number }) {
    const {
        title = "WHAT WE OFFER",
        subtitle = "AN UNFORGETTABLE EXPERIENCE AWAITS YOU",
        offers = [],
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "135deg", // bottom right
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
        patternDirection = "45deg", // Added default value for patternDirection
    } = data;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const gradientStyle = {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`,
    };

    return (
        <section className="relative w-full py-20 bg-black text-white overflow-hidden">
            {/* Main Gradient Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none bg-fixed"
                style={gradientStyle}
            />

            {/* Diagonal Line Pattern Overlay */}
            {patternEnabled && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: patternOpacity,
                        backgroundImage: `repeating-linear-gradient(${patternDirection}, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)` // Used patternDirection here
                    }}
                />
            )}

            {/* Background Images Layer */}
            <div className="absolute inset-0 z-0">
                {offers.map((offer, index) => (
                    offer.image && (
                        <div
                            key={offer.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${hoveredIndex === index ? "opacity-100" : "opacity-0"
                                }`}
                        >
                            <InlineImageEditable
                                src={offer.image}
                                alt={offer.title}
                                fill
                                fieldPath={`offers.${index}.image`}
                                sectionIndex={sectionIndex}
                                className="object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-black/70" />
                        </div>
                    )
                ))}
            </div>


            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                    <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm md:text-base mt-2">
                        <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                    </p>
                </div>

                {/* Offers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {offers.map((offer, index) => (
                        <div
                            key={offer.id}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="border border-white/20 p-8 hover:border-yellow-400/50 transition-colors duration-300 group bg-black/40 backdrop-blur-sm"
                        >
                            <div className="text-5xl font-black text-transparent stroke-text-yellow mb-4 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                                {String(index + 1).padStart(2, "0")}
                            </div>
                            <h3 className="text-xl font-bold uppercase mb-3 text-white group-hover:text-yellow-400 transition-colors">
                                <InlineEditable tag="span" value={offer.title || ""} fieldPath={`offers.${index}.title`} sectionIndex={sectionIndex} />
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                <InlineEditable tag="span" value={offer.description || ""} fieldPath={`offers.${index}.description`} sectionIndex={sectionIndex} />
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .stroke-text-yellow {
                    -webkit-text-stroke: 1px #facc15; /* yellow-400 */
                }
            `}</style>
        </section>
    );
}
