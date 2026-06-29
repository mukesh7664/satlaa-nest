"use client";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

interface MenuItem {
    id: string;
    label: string;
    url: string;
}

interface EventHeaderProps {
  sectionIndex?: number;
    logoImage?: string;
    title?: string;
    subtitle?: string;
    menuItems?: MenuItem[];
    ctaLabel?: string;
    ctaUrl?: string;
}

export default function EventHeader({ data, sectionIndex }: { data: EventHeaderProps, sectionIndex?: number }) {
    const {
        logoImage,
        title = "HOLLYWOOD 3.0",
        subtitle = "by SID Events",
        menuItems = [
            { id: "1", label: "Home", url: "#" },
            { id: "2", label: "Artists", url: "#artists" }
        ],
        ctaLabel = "BUY TICKETS",
        ctaUrl = "#",
    } = data;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        // Check if it's a hash link (section link)
        if (url.startsWith('#')) {
            e.preventDefault();
            const sectionId = url.substring(1);
            const element = document.getElementById(sectionId);

            if (element) {
                // Smooth scroll to section with offset for fixed header
                const headerOffset = 80; // Height of fixed header
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu after a short delay to ensure scroll starts
                setTimeout(() => {
                    setIsMenuOpen(false);
                }, 100);
            }
        }
    };


    return (
        <header className={`fixed top-0 left-0 w-full z-50 border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-black/40' : 'bg-black backdrop-blur-md'
            }`}>
            <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                {/* Branding */}
                <Link href="/" className="flex items-center gap-4 group">
                    {logoImage && (
                        <div className="relative w-auto h-10 md:h-12">
                            <InlineImageEditable
                                src={logoImage}
                                alt={title}
                                width={120}
                                height={48}
                                fieldPath="logoImage"
                                sectionIndex={sectionIndex}
                                className="object-contain h-full w-auto"
                            />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none group-hover:text-yellow-400 transition-colors">
                            <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                        </span>
                        {subtitle && (
                            <span className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-widest">
                                <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                            </span>
                        )}
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-8">
                        {menuItems.map((item, index) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                onClick={(e) => handleNavClick(e, item.url)}
                                className="text-sm font-bold text-gray-300 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                <InlineEditable tag="span" value={item.label || ""} fieldPath={`menuItems.${index}.label`} sectionIndex={sectionIndex} />
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Button */}
                    <Link
                        href={ctaUrl}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-2.5 font-black uppercase tracking-wider text-sm flex items-center gap-2 transition-transform hover:scale-105"
                    >
                        <InlineEditable tag="span" value={ctaLabel || ""} fieldPath="ctaLabel" sectionIndex={sectionIndex} />
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`md:hidden  border-b border-white/10 overflow-hidden ${isScrolled ? 'bg-black/40' : 'bg-black backdrop-blur-md'
                            }`}
                    >
                        <div className="flex flex-col p-4 gap-4">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    className="text-lg font-bold text-white uppercase tracking-widest py-2 border-b border-white/5"
                                    onClick={(e) => handleNavClick(e, item.url)}
                                >
                                    <InlineEditable tag="span" value={item.label || ""} fieldPath={`menuItems.${index}.label`} sectionIndex={sectionIndex} />
                                </Link>
                            ))}
                            <Link
                                href={ctaUrl}
                                className="bg-yellow-400 text-black text-center py-3 font-black uppercase tracking-wider mt-2"
                                onClick={(e) => {
                                    handleNavClick(e, ctaUrl);
                                }}
                            >
                                <InlineEditable tag="span" value={ctaLabel || ""} fieldPath="ctaLabel" sectionIndex={sectionIndex} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
