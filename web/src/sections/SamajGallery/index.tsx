"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface GalleryItem {
    image?: string;
    title?: string;
    description?: string;
    date?: string;
    author?: string;
    pdfLink?: string;
}

interface SamajGalleryProps {
    sectionLabel?: string;
    sectionTitle?: string;
    items?: GalleryItem[];
}

export default function SamajGallery({ data, sectionIndex }: { data: SamajGalleryProps, sectionIndex?: number }) {
    const {
        sectionLabel = "",
        sectionTitle = "",
        items = [],
    } = data || {};

    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    useEffect(() => {
        if (!items || items.length <= 1) return;
        const timer = setInterval(nextSlide, 8000);
        return () => clearInterval(timer);
    }, [items?.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[activeIndex];

    return (
        <section className="py-20 px-4 md:px-12 bg-white overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center gap-12 min-h-[500px]">

                    {/* Left Side: Content */}
                    <div className="lg:w-1/2 w-full order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-orange-600 font-bold text-sm tracking-widest uppercase">
                                    <InlineEditable tag="span" value={sectionLabel} fieldPath="sectionLabel" sectionIndex={sectionIndex} />
                                </span>
                                <div className="h-[1px] w-24 bg-orange-600"></div>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12">
                                <InlineEditable tag="span" value={sectionTitle} fieldPath="sectionTitle" sectionIndex={sectionIndex} />
                            </h2>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-xl md:text-3xl font-bold text-orange-600 leading-tight">
                                        <InlineEditable tag="span" value={currentItem.title || ""} fieldPath={`items.${activeIndex}.title`} sectionIndex={sectionIndex} />
                                    </h3>

                                    <div className="space-y-4">
                                        <p className="text-gray-600 text-lg leading-relaxed line-clamp-4">
                                            <InlineEditable tag="span" value={currentItem.description || ""} fieldPath={`items.${activeIndex}.description`} sectionIndex={sectionIndex} />
                                        </p>

                                        {currentItem.pdfLink && (
                                            <a
                                                href={currentItem.pdfLink}
                                                className="inline-block text-gray-900 font-bold underline hover:text-orange-600 transition-colors"
                                            >
                                                Download PDF
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-4">
                                        <span>By <InlineEditable tag="span" value={currentItem.author || ""} fieldPath={`items.${activeIndex}.author`} sectionIndex={sectionIndex} /></span>
                                        <span className="text-gray-300">//</span>
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <InlineEditable tag="span" value={currentItem.date || ""} fieldPath={`items.${activeIndex}.date`} sectionIndex={sectionIndex} />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Right Side: Image Slider */}
                    <div className="lg:w-1/2 w-full order-1 lg:order-2 relative aspect-[16/10] md:aspect-[16/11] overflow-hidden group">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.7 }}
                                className="absolute inset-0"
                            >
                                <InlineImageEditable
                                    src={currentItem.image || "/images/placeholder-gallery.jpg"}
                                    alt={currentItem.title || "Gallery Image"}
                                    fill
                                    fieldPath={`items.${activeIndex}.image`}
                                    sectionIndex={sectionIndex}
                                    className="object-cover"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <div className="absolute inset-y-0 left-0 flex items-center p-4">
                            <button
                                onClick={prevSlide}
                                className="w-10 h-10 bg-black/50 hover:bg-orange-600 text-white rounded-md flex items-center justify-center transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                            >
                                <FaChevronLeft />
                            </button>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center p-4">
                            <button
                                onClick={nextSlide}
                                className="w-10 h-10 bg-black/50 hover:bg-orange-600 text-white rounded-md flex items-center justify-center transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
