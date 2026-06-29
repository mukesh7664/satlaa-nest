"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface ImageItem {
    url: string;
    label: string;
}

interface PreviousEditionsProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    images?: (string | ImageItem)[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
}

export default function PreviousEditions({ data, sectionIndex }: { data: PreviousEditionsProps, sectionIndex?: number }) {
    const {
        title = "PREVIOUS EDITIONS",
        subtitle = "Relive the magic of past events",
        images = [],
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "135deg", // bottom right
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
    } = data;

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "center",
        skipSnaps: false,
    });

    // Helper to normalize image data
    const normalizedImages = React.useMemo(() => images.map(img => {
        if (typeof img === 'string') {
            return { url: img, label: '' };
        }
        return img;
    }), [images]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const gradientStyle = {
        background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`,
    };

    if (!normalizedImages.length) return null;

    const currentImage = normalizedImages[selectedIndex];

    return (
        <section className="relative w-full h-[50vh] md:h-screen overflow-hidden bg-black text-white">
            {/* Main Gradient Background */}
            <div
                className="absolute inset-0 z-0 pointer-events-none bg-fixed"
                style={gradientStyle}
            />


            {/* Background Layer (Active Image) */}
            <div key={currentImage?.url} className="absolute inset-0 z-0">
                {currentImage?.url && (
                    <>
                        <Image
                            src={currentImage.url}
                            alt="Background"
                            fill
                            className="object-cover opacity-50 scale-105 transition-all duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/70" />
                    </>
                )}
            </div>

            {/* Carousel Content */}
            <div className="relative z-20 w-full h-full flex items-start justify-center">
                <div className="w-full h-[50vh] md:h-[85vh]" ref={emblaRef}>
                    <div className="flex w-full h-full touch-pan-y -ml-4">
                        {normalizedImages.map((item, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex-[0_0_85%] md:flex-[0_0_70%] min-w-0 pl-4 relative h-full transition-all duration-500",
                                    selectedIndex === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 pointer-events-none z-0"
                                )}
                            >
                                <div className="relative w-full h-full overflow-hidden shadow-sm border border-white/10">
                                    {item.url && (
                                        <InlineImageEditable
                                            src={item.url}
                                            alt={item.label || `Edition ${index + 1}`}
                                            fill
                                            fieldPath={`images.${index}.url`}
                                            sectionIndex={sectionIndex}
                                        />
                                    )}

                                    {/* Gradient Overlay within slide */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(to top, ${gradientStart}E6, transparent, transparent)`
                                        }}
                                    />

                                    {/* Content within slide */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none z-[70]">
                                        <div className="text-center space-y-4 px-4 max-w-4xl">
                                            <h2 className={cn(
                                                "text-4xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-2xl transition-all duration-700 pointer-events-auto",
                                                selectedIndex === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                            )}>
                                                <InlineEditable tag="span" value={item.label || title} fieldPath={item.label ? `images.${index}.label` : "title"} sectionIndex={sectionIndex} />
                                            </h2>
                                            <p className={cn(
                                                "text-lg md:text-2xl font-medium text-white/80 drop-shadow-lg max-w-2xl mx-auto transition-all duration-700 delay-100 pointer-events-auto",
                                                selectedIndex === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                            )}>
                                                <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Overlay - Adjusted color and z-index */}
            <div
                className="absolute bottom-0 left-0 w-full h-2/3 z-10 pointer-events-none"
                style={{
                    background: `linear-gradient(to top, ${gradientStart}, rgba(0,0,0,0.5), transparent)`
                }}
            />

            {/* Controls Layer - Aligned with the Card */}
            <div className="absolute inset-0 z-50 pointer-events-none flex items-start justify-center">
                <div className="w-[85%] md:w-[70%] h-[50vh] md:h-[85vh] relative">
                    <div className="absolute bottom-6 left-4 right-0 flex justify-between items-end px-6 md:px-10">

                        {/* Navigation - Bottom Left */}
                        <div className="pointer-events-auto flex items-center ">
                            <button
                                onClick={scrollPrev}
                                className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 cursor-pointer"
                            >
                                <FaArrowLeftLong className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 cursor-pointer"
                            >
                                <FaArrowRightLong className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        {/* Pagination / Progress - Bottom Right */}
                        <div className="pointer-events-auto flex items-center gap-2">
                            {normalizedImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollTo(idx)}
                                    className={cn(
                                        "h-1 transition-all duration-500 rounded-full",
                                        selectedIndex === idx ? "bg-white w-16 md:w-24" : "bg-white/20 w-8 md:w-12 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
