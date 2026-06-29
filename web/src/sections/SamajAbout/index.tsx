"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaGooglePlay, FaArrowRight } from "react-icons/fa";

interface SamajAboutProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    description?: string;
    logo?: string;
    image1?: string;
    image2?: string;
    phone?: string;
    googlePlayLink?: string;
    readMoreLink?: string;
}

export default function SamajAbout({ data, sectionIndex }: { data: SamajAboutProps, sectionIndex?: number }) {
    const {
        title = "",
        subtitle = "",
        description = "",
        logo = "",
        image1 = "",
        image2 = "",
        phone = "",
        googlePlayLink = "",
        readMoreLink = "",
    } = data || {};

    if (!title) return null;

    return (
        <section className="py-16 px-4 bg-white overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                {/* Header with Logo */}
                <div className="flex flex-col items-center mb-12 text-center">
                    {logo && (
                        <div className="relative w-48 h-32 mb-6">
                            <InlineImageEditable
                                src={logo}
                                alt="Samaj Logo"
                                fill
                                fieldPath="logo"
                                sectionIndex={sectionIndex}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <span className="text-gray-500 font-medium mb-2"><InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} /></span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Overlapping Images */}
                    <div className="lg:col-span-6 relative h-[400px] md:h-[500px]">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="absolute left-0 top-0 w-[65%] h-[90%] z-10 p-2 bg-orange-100 rounded-[2rem] overflow-hidden rotate-[-2deg]"
                        >
                            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                                <InlineImageEditable
                                    src={image1}
                                    alt="About Image 1"
                                    fill
                                    fieldPath="image1"
                                    sectionIndex={sectionIndex}
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="absolute right-4 bottom-0 w-[55%] h-[80%] z-20 p-2 bg-blue-50 rounded-[2rem] overflow-hidden rotate-[3deg]"
                        >
                            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
                                <InlineImageEditable
                                    src={image2}
                                    alt="About Image 2"
                                    fill
                                    fieldPath="image2"
                                    sectionIndex={sectionIndex}
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side: Description and CTA */}
                    <div className="lg:col-span-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="text-gray-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                                <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
                            </p>

                            <Link
                                href={readMoreLink}
                                className="inline-flex items-center gap-2 text-gray-900 font-bold hover:gap-4 transition-all mb-10 group"
                            >
                                Read More <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="flex flex-wrap gap-6 items-center">
                                {/* Online Support Box */}
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl flex items-center gap-4 shadow-lg min-w-[240px]">
                                    <div className="bg-white p-3 rounded-full text-orange-600 shadow-md">
                                        <FaPhoneAlt size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Online Support</p>
                                        <p className="text-lg font-black text-gray-900"><InlineEditable tag="span" value={phone || ""} fieldPath="phone" sectionIndex={sectionIndex} /></p>
                                    </div>
                                </div>

                                {/* Google Play Button */}
                                <Link
                                    href={googlePlayLink}
                                    className="bg-black text-white px-8 py-3 rounded-2xl flex items-center gap-3 shadow-lg hover:bg-gray-800 transition-colors h-[72px]"
                                >
                                    <FaGooglePlay size={24} className="text-white" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Get it on</p>
                                        <p className="text-lg font-bold leading-tight">Google Play</p>
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
