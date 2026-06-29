"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaLongArrowAltRight } from "react-icons/fa";

interface Slide {
    image: string;
    title: string;
    description: string;
    link?: string;
}

interface SamajAboutHeroProps {
    data: {
        slides?: Slide[];
        autoPlayInterval?: number;
    };
    sectionIndex?: number;
}

const SamajAboutHero: React.FC<SamajAboutHeroProps> = ({ data, sectionIndex }) => {
    const slides = data?.slides || [];

    if (!slides || slides.length === 0) return null;

    const [currentSlide, setCurrentSlide] = useState(0);
    const interval = data?.autoPlayInterval || 5000;

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, interval);
        return () => clearInterval(timer);
    }, [slides.length, interval]);

    const activeSlide = slides[currentSlide];

    return (
        <section className="relative h-[600px] w-full overflow-hidden bg-black text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 z-0"
                >
                    <InlineImageEditable
                        src={activeSlide.image || "/images/placeholder.jpg"}
                        alt={activeSlide.title}
                        fill
                        fieldPath={`slides.${currentSlide}.image`}
                        sectionIndex={sectionIndex}
                        className="object-cover opacity-60"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Overlay for even better readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 to-transparent" />

            <div className="container relative z-20 mx-auto flex h-full items-center px-4 md:px-8">
                <div className="max-w-3xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="mb-4 text-4xl font-bold md:text-6xl lg:text-7xl">
                                <InlineEditable tag="span" value={activeSlide.title || ""} fieldPath={`slides.${currentSlide}.title`} sectionIndex={sectionIndex} />
                            </h1>
                            <p className="mb-8 text-lg text-slate-200 md:text-xl lg:max-w-2xl">
                                <InlineEditable tag="span" value={activeSlide.description || ""} fieldPath={`slides.${currentSlide}.description`} sectionIndex={sectionIndex} />
                            </p>
                            {activeSlide.link && (
                                <Link
                                    href={activeSlide.link}
                                    className="group flex w-fit items-center gap-3 text-lg font-semibold uppercase tracking-wider text-white transition-all hover:text-red-500"
                                >
                                    Read More
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-all group-hover:border-red-500">
                                        <FaLongArrowAltRight className="text-red-500" />
                                    </div>
                                </Link>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Numerical Navigation */}
            <div className="absolute right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-6 font-mono text-sm md:right-12">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`flex items-center gap-3 transition-all ${currentSlide === index ? "text-white" : "text-white/40"
                            }`}
                    >
                        {currentSlide === index && (
                            <motion.span
                                layoutId="nav-line"
                                className="h-px w-8 bg-red-500"
                            />
                        )}
                        <span>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default SamajAboutHero;
