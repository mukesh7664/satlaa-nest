"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

export default function CTASection() {
    // Animation variants for the "White Wave" circles
    const waveVariants = {
        hidden: (scale: number) => ({
            scale: scale,
            opacity: 0,
        }),
        visible: (targetScale: number) => ({
            scale: targetScale,
            opacity: 1,
            transition: {
                duration: 2,
                ease: [0.1, 0.4, 0.2, 1],
            }
        })
    };

    return (
        <section className="relative w-full overflow-hidden bg-[#6c3aed] py-24 md:py-40 flex items-center justify-center">
            {/* ── Fixed Background Gradient Layer ── */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "radial-gradient(circle at top, #6c3aed 0%, #8b5cf6 50%, #a78bfa 100%)",
                }}
            />

            {/* ── Animated White Wave Circles ── */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Layer 1: Extra Large */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 2.5, ease: [0.1, 0.4, 0.2, 1] }}
                    style={{
                        position: "absolute",
                        width: "3000px",
                        height: "3000px",
                        bottom: "-1500px",
                        left: "-1500px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at center, transparent 65%, rgba(255, 255, 255, 0.3) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                />
                {/* Layer 2: Large */}
                <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 2.2, ease: [0.1, 0.4, 0.2, 1], delay: 0.1 }}
                    style={{
                        position: "absolute",
                        width: "2200px",
                        height: "2200px",
                        bottom: "-1100px",
                        left: "-1100px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at center, transparent 65%, rgba(255, 255, 255, 0.4) 100%)",
                    }}
                />
                {/* Layer 3: Medium */}
                <motion.div
                    initial={{ scale: 0.3, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 2, ease: [0.1, 0.4, 0.2, 1], delay: 0.2 }}
                    style={{
                        position: "absolute",
                        width: "1400px",
                        height: "1400px",
                        bottom: "-700px",
                        left: "-700px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at center, transparent 65%, rgba(255, 255, 255, 0.5) 100%)",
                    }}
                />
                {/* Layer 4: Small */}
                <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false, amount: 0.1 }}
                    transition={{ duration: 1.8, ease: [0.1, 0.4, 0.2, 1], delay: 0.3 }}
                    style={{
                        position: "absolute",
                        width: "800px",
                        height: "800px",
                        bottom: "-400px",
                        left: "-400px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle at center, transparent 65%, rgba(255, 255, 255, 0.6) 100%)",
                    }}
                />
            </div>

            {/* ── Content Card ── */}
            <div className="relative z-20 w-full max-w-[1200px] px-6">
                <motion.div
                    initial={{ opacity: 0, scaleY: 0.4 }}
                    whileInView={{ opacity: 1, scaleY: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                        duration: 1,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.5
                    }}
                    className="w-full max-w-[1000px] mx-auto bg-[#FFF9EB] rounded-[18px] md:rounded-[28px] py-20 md:py-32 px-10 flex flex-col items-center text-center shadow-[0_32px_100px_rgba(0,0,0,0.15)] origin-center"
                >
                    <h2 className="text-[44px] md:text-[78px] font-bold text-[#17181A] leading-[0.95] tracking-tight mb-12">
                        So, what are <br className="hidden md:block" /> we building?
                    </h2>

                    <Link href={`${adminUrl}/register`}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-[#17181A] text-white py-3.5 pl-8 pr-3.5 rounded-full flex items-center gap-6 group transition-all cursor-pointer"
                        >
                            <span className="text-xl font-semibold">Get started</span>
                            <div className="w-14 h-14 bg-[#E6FBB1] rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ">
                                <ArrowRight className="w-7 h-7 text-[#17181A]" />
                            </div>
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
