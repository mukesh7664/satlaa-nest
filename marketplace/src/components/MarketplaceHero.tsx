'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MarketplaceNavbar from './MarketplaceNavbar';

const slides = [
    {
        bgColor: "#8d3500", // Dark Brown/Orange
        image: "/hero/female.png",
    },
    {
        bgColor: "#0a4430", // Dark Green
        image: "/hero/male.png",
    }
];

const MarketplaceHero = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const currentSlide = slides[index];

    return (
        <section className="relative w-full bg-white px-6 pt-6">
            {/* Main Rounded Container - Using your preferred max-w-full and rounded-2xl */}
            <div className="max-w-full mx-auto overflow-hidden rounded-2xl shadow-2xl relative min-h-[650px] lg:h-[750px] bg-slate-900">

                {/* Background Wipe Layer - Vertical Animation */}
                <AnimatePresence initial={false}>
                    <motion.div
                        key={`bg-${index}`}
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        exit={{ opacity: 0 }}
                        transition={{
                            height: { duration: 1.2, ease: [0.645, 0.045, 0.355, 1] },
                            opacity: { duration: 0.5, delay: 1 }
                        }}
                        className="absolute top-0 left-0 w-full z-0 origin-top"
                        style={{ backgroundColor: currentSlide.bgColor }}
                    />
                </AnimatePresence>

                {/* Navbar */}
                <div className="relative z-50">
                    <MarketplaceNavbar />
                </div>

                <div className="relative z-10 w-full h-full flex items-center pt-32 pb-20 lg:pt-0 lg:pb-0 min-h-[650px] lg:h-[750px]">
                    <div className="mx-auto px-8 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Content - UPDATED FOR EPxWEB */}
                        <div className="text-white z-10 py-12">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight font-outfit"
                            >
                                Empower Your Shopping Journey with EPxWEB Marketplace.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="mt-6 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed font-medium"
                            >
                                The premium destination to discover, source, and shop independent brands from around the globe with guaranteed quality.
                            </motion.p>

                            {/* Search Bar - Permanently Restored */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="mt-10 relative max-w-2xl"
                            >

                                {/* Popular Categories */}
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Popular:</span>
                                    {["Clothing", "Watches", "Electronics", "Accessories"].map((tag, i) => (
                                        <button key={i} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all border border-white/10 cursor-pointer text-white">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Content - Single Image Fade (Slow) */}
                        <div className="relative flex justify-center items-center h-full min-h-[500px] lg:min-h-[600px]">

                            {/* Animated Background Circle - Changes color with the slide */}
                            <motion.div
                                key={`circle-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5 }}
                                className={`absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px]  rounded-full z-0 opacity-80`}
                            />

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`img-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    className="relative z-10 w-full max-w-[500px] flex justify-center"
                                >
                                    <img
                                        src={currentSlide.image}
                                        alt="Professional"
                                        className="w-full h-auto object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Floating Badges */}
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-[20%] right-0 lg:right-0 bg-white p-4 rounded-2xl shadow-2xl z-30 flex items-center gap-3"
                            >
                                <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <ShieldCheck size={22} />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Verified</div>
                                    <div className="text-sm font-black text-slate-900">Verified Brand</div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 15, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-[20%] left-0 lg:left-0 bg-white p-4 rounded-2xl shadow-2xl z-30 flex items-center gap-3"
                            >
                                <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                                    <Star size={22} fill="currentColor" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Trust Rating</div>
                                    <div className="text-sm font-black text-slate-900">4.9/5 Rating</div>
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default MarketplaceHero;
