"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";

interface MenuItem {
    label: string;
    link: string;
}

interface SamajHeaderProps {
    logo?: string;
    menuItems?: MenuItem[];
    showAuthButtons?: boolean;
    loginLink?: string;
    signupLink?: string;
    loginText?: string;
    signupText?: string;
}

export default function SamajHeader({ data, sectionIndex }: { data: SamajHeaderProps, sectionIndex?: number }) {
    const {
        logo = "",
        menuItems = [],
        showAuthButtons = false,
        loginLink = "",
        signupLink = "",
        loginText = "Login",
        signupText = "Sign Up",
    } = data || {};

    if (!menuItems || menuItems.length === 0) return null;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
            }`}>
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="relative h-12 md:h-16 w-32 md:w-48 transition-transform hover:scale-105">
                    {logo ? (
                        <InlineImageEditable
                            src={logo}
                            alt="Logo"
                            fill
                            fieldPath="logo"
                            sectionIndex={sectionIndex}
                            className="object-contain object-left"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                            Logo Placeholder
                        </div>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.link}
                            className="text-[15px] font-bold text-gray-700 hover:text-orange-600 transition-colors relative group"
                        >
                            <InlineEditable tag="span" value={item.label || ""} fieldPath={`menuItems.${index}.label`} sectionIndex={sectionIndex} />
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    {showAuthButtons && (
                        <>
                            <Link
                                href={loginLink}
                                className="text-[15px] font-bold text-gray-700 hover:text-orange-600 transition-colors"
                            >
                                <InlineEditable tag="span" value={loginText} fieldPath="loginText" sectionIndex={sectionIndex} />
                            </Link>
                            <Link
                                href={signupLink}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-orange-600/20 active:scale-95"
                            >
                                <InlineEditable tag="span" value={signupText} fieldPath="signupText" sectionIndex={sectionIndex} />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden p-2 text-gray-700 hover:text-orange-600 transition-colors"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden lg:hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.link}
                                    className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4 active:text-orange-600"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <InlineEditable tag="span" value={item.label || ""} fieldPath={`menuItems.${index}.label`} sectionIndex={sectionIndex} />
                                </Link>
                            ))}
                             {showAuthButtons && (
                                <div className="flex flex-col gap-3 pt-2">
                                    <Link
                                        href={loginLink}
                                        className="w-full py-3 text-center font-bold text-gray-700 active:text-orange-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <InlineEditable tag="span" value={loginText} fieldPath="loginText" sectionIndex={sectionIndex} />
                                    </Link>
                                    <Link
                                        href={signupLink}
                                        className="w-full py-3 bg-orange-600 text-white text-center rounded-xl font-bold active:bg-orange-700"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <InlineEditable tag="span" value={signupText} fieldPath="signupText" sectionIndex={sectionIndex} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
