"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface MemberCard {
    title?: string;
    description?: string;
    image?: string;
    link?: string;
    type: 'info' | 'message';
    bgColor?: string;
    buttonColor?: string;
    subtitle?: string;
    name?: string;
}

interface AyojakMembersProps {
  sectionIndex?: number;
    data: {
        cards?: MemberCard[];
    };
}

export default function AyojakMembers({ data, sectionIndex }: AyojakMembersProps) {
    const {
        cards = [],
    } = data || {};

    if (!cards || cards.length === 0) return null;

    const resolveColor = (colorStr?: string, defaultColorStr?: string) => {
        if (!colorStr) return defaultColorStr;
        if (colorStr.startsWith('bg-[') || colorStr.startsWith('text-[')) {
            return colorStr.slice(colorStr.indexOf('[') + 1, -1);
        }
        if (colorStr === 'text-white' || colorStr === 'bg-white') return '#ffffff';
        if (colorStr === 'text-black' || colorStr === 'bg-black') return '#000000';
        return colorStr;
    };

    return (
        <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {cards.map((card, index) => {
                        const bgHex = resolveColor(card.bgColor, '#E6A01C');
                        const textHex = resolveColor(card.buttonColor, '#000000');
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col h-full relative shadow-xl"
                            >
                                {/* Top background area to allow the image to overlap */}
                                <div className="h-40 bg-[#f9f5f0] relative overflow-hidden flex-shrink-0">
                                </div>

                                {/* Main content area */}
                                <div style={{ backgroundColor: bgHex }} className="flex-1 px-8 pb-10 pt-0 flex flex-col relative text-white items-center text-center -mt-[1px]">
                                    {/* Image / Logo overlapping the top boundary */}
                                    <div className="relative -mt-20 mb-8 mx-auto w-40 h-40 flex-shrink-0 flex items-center justify-center">
                                        {card.type === 'info' ? (
                                            <div className="w-full h-full rounded-full bg-white shadow-lg overflow-hidden flex items-center justify-center p-2">
                                                <div className="relative w-full h-full rounded-full overflow-hidden">
                                                    <InlineImageEditable
                                                        src={card.image || "/images/placeholder.png"}
                                                        alt={card.title || "Logo"}
                                                        fill
                                                        fieldPath={`cards.${index}.image`}
                                                        sectionIndex={sectionIndex}
                                                        className="object-contain p-2"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full shadow-lg overflow-hidden border-[6px] border-[#C4302B] bg-[#C4302B] relative">
                                                <InlineImageEditable
                                                    src={card.image || "/images/placeholder.png"}
                                                    alt={card.subtitle || "Sabhapati"}
                                                    fill
                                                    fieldPath={`cards.${index}.image`}
                                                    sectionIndex={sectionIndex}
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {card.type === 'info' ? (
                                        <>
                                            <h3 className="text-xl md:text-2xl font-bold mb-6 text-black/80">
                                                <InlineEditable tag="span" value={card.title || ""} fieldPath={`cards.${index}.title`} sectionIndex={sectionIndex} />
                                            </h3>
                                            <p className="text-white/95 text-sm md:text-base leading-relaxed mb-8 flex-1">
                                                <InlineEditable tag="span" value={card.description || ""} fieldPath={`cards.${index}.description`} sectionIndex={sectionIndex} />
                                            </p>
                                            <div className="mt-auto w-full flex items-center gap-4 group cursor-pointer" style={{ color: textHex }}>
                                                <span className="text-sm font-bold uppercase tracking-wider">Read More</span>
                                                <div style={{ backgroundColor: textHex }} className="h-[1px] flex-1 opacity-40"></div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-xl md:text-2xl text-white mb-1 font-normal">
                                                <InlineEditable tag="span" value={card.title || ""} fieldPath={`cards.${index}.title`} sectionIndex={sectionIndex} />
                                            </h3>
                                            <p className="text-[#FBC02D] font-normal text-base md:text-lg mb-8">
                                                <InlineEditable tag="span" value={card.subtitle || ""} fieldPath={`cards.${index}.subtitle`} sectionIndex={sectionIndex} />
                                            </p>
                                            <div className="text-left w-full flex-1">
                                                <p className="font-bold text-white mb-2">
                                                    <InlineEditable tag="span" value={card.name || ""} fieldPath={`cards.${index}.name`} sectionIndex={sectionIndex} />
                                                </p>
                                                <p className="text-white/95 text-sm md:text-base leading-relaxed">
                                                    <InlineEditable tag="span" value={card.description || ""} fieldPath={`cards.${index}.description`} sectionIndex={sectionIndex} />
                                                </p>
                                            </div>
                                            <div className="mt-8 w-full flex items-center gap-4 group cursor-pointer" style={{ color: textHex }}>
                                                <span className="text-sm font-bold uppercase tracking-wider">Read More</span>
                                                <div style={{ backgroundColor: textHex }} className="h-[1px] flex-1 opacity-40"></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
