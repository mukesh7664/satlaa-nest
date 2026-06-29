"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BrandSlider from "./BrandSlider";

export default function Hero() {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');
                .hero-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>

            <section className="relative overflow-hidden bg-white min-h-[70vh] md:min-h-[85vh] flex items-center justify-center pt-24 md:pt-32 pb-4 md:pb-20">
                {/* Soft Vibrant Background Gradient */}
                <div className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        background: "radial-gradient(circle at 10% 20%, rgba(255, 182, 193, 0.4) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(173, 216, 230, 0.4) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(221, 160, 221, 0.2) 0%, transparent 80%)"
                    }} />

                {/* Floating Layout Previews (Decorative) */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Left Tilted Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -100, rotate: -25 }}
                        whileInView={{ opacity: 1, x: 0, rotate: -12 }}
                        viewport={{ once: true }}
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                            duration: 1,
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute left-[-2%] top-[20%] w-[480px] h-auto hidden xl:block z-0 pointer-events-none"
                    >
                        <Image src="/assets/01.png" alt="Layout Preview 1" width={800} height={1200} className="w-full h-auto drop-shadow-2xl" />
                    </motion.div>

                    {/* Right Tilted Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, rotate: 25 }}
                        whileInView={{ opacity: 1, x: 0, rotate: 12 }}
                        viewport={{ once: true }}
                        animate={{ y: [0, 20, 0] }}
                        transition={{
                            duration: 1,
                            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute right-[-2%] top-[25%] w-[480px] h-auto hidden xl:block z-0 pointer-events-none"
                    >
                        <Image src="/assets/hero2.png" alt="Layout Preview 2" width={800} height={1200} className="w-full h-auto drop-shadow-2xl" />
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center hero-outfit">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center gap-1 mb-6"
                    >
                        <h3 className="text-gray-400 font-medium text-sm md:text-base tracking-wide">
                            Advanced E-Commerce SaaS Platform
                        </h3>
                    </motion.div>

                    <div className="relative mb-2">
                        {/* Massive Decorative Background Text (Striped SVG) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.05] select-none overflow-visible -top-1/2">
                            <svg className="w-[120%] h-auto md:w-[150%] max-w-none" viewBox="0 0 1200 400">
                                <defs>
                                    <style>{`
                                        .striped-text {
                                            font-family: 'Outfit', sans-serif;
                                            font-weight: 900;
                                            text-transform: uppercase;
                                            letter-spacing: -0.05em;
                                        }
                                    `}</style>
                                </defs>
                                {/* Multi-layer strokes to simulate the striped design */}
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="striped-text" fontSize="320" fill="none" stroke="black" strokeWidth="0.5">EPxWEB</text>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="striped-text" fontSize="300" fill="none" stroke="black" strokeWidth="0.5">EPxWEB</text>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="striped-text" fontSize="280" fill="none" stroke="black" strokeWidth="0.5">EPxWEB</text>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="striped-text" fontSize="260" fill="none" stroke="black" strokeWidth="0.5">EPxWEB</text>
                            </svg>
                        </div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="relative z-10 text-4xl sm:text-5xl md:text-[6rem] lg:text-[8rem] font-semibold text-gray-900 tracking-tighter leading-[1.1] md:leading-[0.9]"
                        >
                            Build Store and Website
                        </motion.h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-3xl mx-auto mb-8 md:mb-10 px-4 md:px-0"
                    >
                        <p className="text-lg sm:text-lg md:text-2xl text-gray-500 leading-relaxed font-medium">
                            Launch stunning websites and stores in seconds.
                            <br />
                            <span className="text-[#6c3aed]"> No technical skills required.</span>
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 md:px-0"
                    >
                        <Link
                            href={`${adminUrl}/register`}
                            className="inline-flex items-center justify-center px-8 py-3.5 md:px-10 md:py-5 rounded-full bg-[#6c3aed] text-white font-bold hover:bg-[#5a2ed1] transition-all transform hover:-translate-y-1 shadow-xl shadow-purple-100 hover:shadow-purple-200 text-center text-sm md:text-base"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center px-8 py-3.5 md:px-10 md:py-5 rounded-full border-2 border-gray-100 bg-white text-gray-900 font-bold hover:bg-gray-50 transition-all transform hover:-translate-y-1 gap-2 group shadow-sm text-sm md:text-base"
                        >
                            View Pricing
                            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Trust and Brand Slider */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-full mt-8 md:mt-24 text-center"
                    >
                        <div className="w-full">
                            <BrandSlider />
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
