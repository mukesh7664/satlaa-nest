"use client";
import React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="flex items-center space-x-2 mb-8 group">
                            <div className="w-12 h-12 bg-[#6c3aed] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6c3aed]/20 transition-transform group-hover:scale-110">
                                <span className="text-white font-bold text-2xl italic">E</span>
                            </div>
                            <span className="text-2xl font-bold text-[#17181A] tracking-tight">EPXWEB</span>
                        </Link>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-sm mb-8">
                            Building the next generation of retail infrastructure for modern e-commerce entrepreneurs.
                        </p>
                        <div className="flex space-x-3">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <Link
                                    key={i}
                                    href="#"
                                    className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#6c3aed] hover:text-white hover:border-[#6c3aed] transition-all duration-300 shadow-sm"
                                >
                                    <Icon className="w-5 h-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2">
                        <h4 className="text-[#17181A] font-bold mb-8 text-sm uppercase tracking-[0.2em]">Platform</h4>
                        <ul className="space-y-4">
                            {['Features', 'Pricing', 'Integrations', 'Enterprise', 'Custom Domains'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-gray-500 hover:text-[#6c3aed] transition-colors inline-block">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-[#17181A] font-bold mb-8 text-sm uppercase tracking-[0.2em]">Company</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Careers', 'Blog', 'Press', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-gray-500 hover:text-[#6c3aed] transition-colors inline-block">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4">
                        <h4 className="text-[#17181A] font-bold mb-8 text-sm uppercase tracking-[0.2em]">Stay Updated</h4>
                        <p className="text-gray-500 mb-6 font-medium">Join our newsletter to receive the latest updates and insights.</p>
                        <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative group">
                                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6c3aed] transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-gray-50 border border-transparent rounded-[12px] py-4 pl-12 pr-4 text-[#17181A] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#6c3aed]/30 focus:ring-4 focus:ring-[#6c3aed]/5 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#6c3aed] text-white font-bold py-4 px-6 rounded-[12px] hover:bg-[#6c3aed] transition-all flex items-center justify-center group shadow-xl shadow-gray-200"
                            >
                                <span>Subscribe Now</span>
                                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} EPXWEB SaaS. Crafted with passion for modern commerce.
                    </p>
                    <div className="flex items-center gap-8 text-sm font-medium">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
                            <Link key={item} href="#" className="text-gray-400 hover:text-[#6c3aed] transition-colors">{item}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
