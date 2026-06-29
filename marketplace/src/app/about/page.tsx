'use client';

import React from 'react';
import { Globe, Shield, Zap, Users, ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Header */}
            <header className="relative py-24 overflow-hidden bg-indigo-600 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-indigo-600 to-purple-700"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition-colors mb-12 font-bold text-sm">
                        <ArrowLeft size={16} /> BACK TO MARKETPLACE
                    </Link>
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-bold font-outfit mb-8"
                    >
                        Empowering <span className="text-indigo-200 italic underline decoration-wavy underline-offset-8">Independent</span> Commerce
                    </motion.h1>
                    <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                        We've built a global ecosystem where creators and brands can thrive together. Our mission is to democratize the marketplace.
                    </p>
                </div>
            </header>

            {/* Values */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8">
                                <Shield size={36} />
                            </div>
                            <h3 className="text-2xl font-bold font-outfit mb-4 text-slate-900">Trust & Safety</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Every store on our platform is verified and held to high standards of quality and customer service.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-50 rounded-[2rem] flex items-center justify-center text-purple-600 mx-auto mb-8">
                                <Zap size={36} />
                            </div>
                            <h3 className="text-2xl font-bold font-outfit mb-4 text-slate-900">Lightning Fast</h3>
                            <p className="text-slate-500 leading-relaxed">
                                Experience a seamless shopping journey with ultra-fast page loads and optimized checkout processes.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-8">
                                <Users size={36} />
                            </div>
                            <h3 className="text-2xl font-bold font-outfit mb-4 text-slate-900">Community Driven</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We grow when our sellers grow. Our platform is designed to foster relationships between brands and fans.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="relative">
                            <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                            <h2 className="text-4xl md:text-5xl font-bold font-outfit leading-tight mb-8">
                                A New Standard for Digital Discovery
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                The future of eCommerce isn't just about transactions; it's about discovery. We're building a world where the best products aren't hidden behind complex algorithms.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    "Direct-to-consumer relationships",
                                    "Transparent platform fees",
                                    "Powerful merchant tools",
                                    "Curated discovery experience"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 text-indigo-300 font-bold">
                                        <div className="w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                            <Heart size={14} fill="currentColor" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative aspect-square">
                            <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] rotate-3 opacity-20"></div>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center">
                                <Globe size={160} className="text-indigo-500 opacity-50 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-white text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-4xl font-bold font-outfit mb-6 text-slate-900">Ready to start your journey?</h2>
                    <p className="text-slate-500 text-lg mb-12">
                        Whether you're looking to buy unique products or start your own store, we're here to help you succeed.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/products" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                            Start Shopping
                        </Link>
                        <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                            Create a Store
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
