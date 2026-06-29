"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const features = [
    {
        title: "Sell without limits.",
        heading: "Everything Unlimited.",
        description: "Sell unlimited with easy to use eCommerce website and app. Whether a single vendor or multivendor, EPxWEB is the best platform to take your business to the next level.",
        points: ["Unlimited products", "Unlimited categories", "Unlimited customers", "Unlimited vendors", "Unlimited orders"],
        image: "/assets/unlimited-feature.png",
        imageLeft: true
    },
    {
        title: "Advanced Control.",
        heading: "Inventory Management Dashboard.",
        description: "Our easy-to-use no-code dashboard is built with feature-rich solutions to manage your inventory and sales at one place.",
        points: ["Abandoned Cart recovery", "Invoice generation", "Wallet & Refunds", "Order assignment", "Inventory logs"],
        image: "/assets/inventory-feature.png",
        imageLeft: false
    },
    {
        title: "Global Commerce.",
        heading: "Trusted Payment & Logistics.",
        description: "Integration with top payment gateways and multiple logistics partners ensures a smooth experience for your customers.",
        points: ["Razorpay & Stripe Integration", "Payment Links & Reminders", "Multiple logistics partners", "Live Order Tracking", "Zero Transaction Fee"],
        image: "/assets/payments-feature.png",
        imageLeft: true
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white overflow-hidden font-geist-sans">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
                {/* Header */}
                <div className="text-center mb-20 sm:mb-28">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#007BFF] text-xs font-bold uppercase tracking-[0.2em] mb-4">
                            SaaS Capabilities
                        </div>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl font-bold tracking-tight text-[#212529] mb-6 leading-tight max-w-5xl mx-auto"
                    >
                        Everything you need in <span className="text-indigo-600">One Place</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
                    >
                        Everything you need to know to manage your online and offline business with complete no code solution.
                        With EPxWEB, create your own brand&apos;s ecommerce app, website and sync it with an ePOS.
                    </motion.p>
                </div>

                {/* Feature Rows */}
                <div className="flex flex-col gap-24 sm:gap-32">
                    {features.map((feature, i) => (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
                            {/* Image Container */}
                            <motion.div
                                initial={{ opacity: 0, x: feature.imageLeft ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className={`relative w-full min-h-[350px] lg:min-h-full ${feature.imageLeft ? 'order-2 lg:order-1' : 'order-2'}`}
                            >
                                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-50/50 flex items-center justify-center p-6 sm:p-10 lg:p-12 border border-neutral-100/50">
                                    <div className="relative w-full h-full min-h-[300px]">
                                        <Image
                                            src={feature.image}
                                            alt={feature.heading}
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: feature.imageLeft ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col justify-center gap-8 ${feature.imageLeft ? 'order-1 lg:order-2' : 'order-1'} py-4 lg:py-10`}
                            >
                                <div className="space-y-4">
                                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{feature.title}</span>
                                    <h3 className="text-[28px] sm:text-[36px] font-bold text-[#212529] leading-tight">
                                        {feature.heading}
                                    </h3>
                                    <p className="text-[17px] text-[#212529]/70 leading-relaxed max-w-lg">
                                        {feature.description}
                                    </p>
                                </div>

                                <ul className="space-y-5">
                                    {feature.points.map((point, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                                            className="flex items-center gap-4 text-[17px] text-[#212529]/80 font-medium"
                                        >
                                            <ChevronRight className="w-5 h-5 text-indigo-600 shrink-0" />
                                            <span>{point}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
