"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";

interface Partner {
    id: string;
    image: string;
    name: string;
}

interface PartnersProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    partners?: Partner[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

export default function Partners({ data, sectionIndex }: { data: PartnersProps, sectionIndex?: number }) {
    const {
        title = "",
        subtitle = "",
        partners = [],
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "135deg", // bottom right
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
        patternDirection = "45deg",
    } = data || {};

    if (!partners || partners.length === 0) return null;

    return (
        <section className="relative w-full py-20 px-4 md:px-8 overflow-hidden">
            {/* Background Gradient */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`
                }}
            />

            {/* Diagonal Line Pattern Overlay */}
            {patternEnabled && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: patternOpacity,
                        backgroundImage: `repeating-linear-gradient(${patternDirection}, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)`
                    }}
                />
            )}

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                    <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm md:text-base mt-4">
                        <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                    </p>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className="bg-neutral-900/40 border border-white/5 hover:border-pink-500/50 hover:bg-neutral-900/80 transition-all duration-300 p-6 flex flex-col items-center justify-center group aspect-square relative backdrop-blur-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                        >
                            {partner.image ? (
                                <>
                                    <div className="relative w-full h-1/2 mb-4 filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100">
                                        <InlineImageEditable
                                            src={partner.image}
                                            alt={partner.name}
                                            fill
                                            fieldPath={`partners.${partners.indexOf(partner)}.image`}
                                            sectionIndex={sectionIndex}
                                            className="object-contain"
                                        />
                                    </div>
                                    <span className="text-neutral-500 group-hover:text-white font-bold uppercase tracking-widest text-[10px] text-center transition-colors duration-300">
                                        {partner.name}
                                    </span>
                                </>
                            ) : (
                                <span className="text-neutral-600 font-bold uppercase text-sm group-hover:text-white transition-colors duration-300">
                                    {partner.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
