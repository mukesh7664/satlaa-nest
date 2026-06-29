"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaInstagram, FaTwitter, FaLinkedin, FaGlobe } from "react-icons/fa";

interface Artist {
    id: string;
    image: string;
    name: string;
    role: string;
    company: string;
    description: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
}

interface FeaturedArtistsProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    artists?: Artist[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

export default function FeaturedArtists({ data, sectionIndex }: { data: FeaturedArtistsProps, sectionIndex?: number }) {
    const {
        title = "",
        subtitle = "",
        backgroundImage,
        artists = [],
        gradientStart = "#b91d73",
        gradientMiddle = "#3a0e3b",
        gradientEnd = "#000000",
        gradientDirection = "to bottom right",
        patternEnabled = true,
        patternOpacity = 0.2,
        patternColor = "#000000",
        patternDirection = "45deg",
    } = data || {};

    if (!artists || artists.length === 0) return null;

    const bannerRef = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: bannerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]); // Added useTransform

    return (
        <section ref={bannerRef} className="relative w-full py-20 px-4 md:px-8 overflow-hidden"> {/* Modified section tag */}
            {/* Background elements */}
            {/* Removed backgroundImage div as per the provided diff, assuming it's replaced by motion.div */}

            {/* Background Gradient */} {/* Changed comment from Main Gradient Background */}
            <motion.div // Changed from div to motion.div
                className="absolute -top-[30%] left-0 w-full h-[160%] z-0 pointer-events-none" // Expanded height to cover parallax movement
                style={{ // Changed from gradientStyle to inline style object
                    background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientMiddle}, ${gradientEnd})`,
                    y // Added y transform
                }}
            />

            {/* Diagonal Line Pattern Overlay */}
            {patternEnabled && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        opacity: patternOpacity,
                        backgroundImage: `repeating-linear-gradient(${patternDirection}, transparent, transparent 10px, ${patternColor} 10px, ${patternColor} 11px)` // Used patternDirection
                    }}
                />
            )}

            {/* Pink Neon Lines (Decorative) */}
            <div className="absolute top-0 left-1/4 w-1 h-full bg-pink-600 blur-[4px] opacity-60 hidden md:block" />
            <div className="absolute top-1/2 left-0 w-full h-1 bg-pink-600 blur-[4px] opacity-60" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                    <p className="text-pink-500 font-bold tracking-[0.2em] uppercase text-sm md:text-base">
                        <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                    </p>
                </div>

                {/* Artists Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {artists.map((artist, index) => (
                        <div key={artist.id} className="flex flex-col items-center text-center group">
                            {/* Image Container */}
                            <div className="relative w-full max-w-[280px] aspect-square mb-6 transition-all duration-500">
                                {/* Triangle Shape Container */}
                                <div className="absolute inset-0 overflow-hidden drop-shadow-2xl" style={{ clipPath: "polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)" }}>
                                    {artist.image && (
                                        <InlineImageEditable
                                            src={artist.image}
                                            alt={artist.name}
                                            fill
                                            fieldPath={`artists.${index}.image`}
                                            sectionIndex={sectionIndex}
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    )}

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,255,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-100 mix-blend-overlay" />

                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    {/* Continuous Moving Scanlines */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-[200%] z-20 pointer-events-none"
                                        style={{
                                            background: "repeating-linear-gradient(to bottom, transparent, transparent 6px, black 6px, black 14px)",
                                            opacity: 0.15,
                                            filter: "blur(2px)",
                                        }}
                                        initial={{ translateY: "0%" }}
                                        animate={{ translateY: "-50%" }}
                                        transition={{
                                            duration: 10,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                </div>
                            </div>

                             {/* Artist Info */}
                            <h3 className="text-2xl font-bold uppercase italic text-white mb-1 group-hover:text-pink-500 transition-colors">
                                <InlineEditable tag="span" value={artist.name || ""} fieldPath={`artists.${index}.name`} sectionIndex={sectionIndex} />
                            </h3>
                            <div className="inline-block border border-pink-500/50 rounded-full px-3 py-0.5 mb-2 bg-pink-900/20">
                                <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                                    <InlineEditable tag="span" value={artist.role || ""} fieldPath={`artists.${index}.role`} sectionIndex={sectionIndex} />
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wide mb-3">
                                <InlineEditable tag="span" value={artist.company || ""} fieldPath={`artists.${index}.company`} sectionIndex={sectionIndex} />
                            </p>
                            <p className="text-gray-500 text-xs mb-4 max-w-[200px] line-clamp-2">
                                <InlineEditable tag="span" value={artist.description || ""} fieldPath={`artists.${index}.description`} sectionIndex={sectionIndex} />
                            </p>

                            {/* Social Links */}
                            <div className="flex gap-4 opacity-100 transition-opacity duration-300">
                                {artist.socialLinks?.instagram && (
                                    <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                        <FaInstagram size={18} />
                                    </a>
                                )}
                                {artist.socialLinks?.twitter && (
                                    <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                        <FaTwitter size={18} />
                                    </a>
                                )}
                                {artist.socialLinks?.linkedin && (
                                    <a href={artist.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                        <FaLinkedin size={18} />
                                    </a>
                                )}
                                {artist.socialLinks?.website && (
                                    <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                        <FaGlobe size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
