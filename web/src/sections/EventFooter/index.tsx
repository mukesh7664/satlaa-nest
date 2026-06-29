"use client";
import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { FaBehance, FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";

interface MenuItem {
    id: string;
    label: string;
    url: string;
}

interface EventFooterProps {
  sectionIndex?: number;
    title?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;

    address?: string;
    email?: string;
    phone?: string;
    copyright?: string;

    menuItems?: MenuItem[];

    facebookUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
}

export default function EventFooter({ data, sectionIndex }: { data: EventFooterProps, sectionIndex?: number }) {
    const {
        title = "Art Comes First",
        description = "We shape distinctive success stories with breakthrough ideas and creative mastery, elevating you ahead of the competition.",
        ctaText = "Got A Project? Let's Talk",
        ctaUrl = "#",

        address = "24 Tue Tinh Street, Cua Nam Ward, Hanoi.\n9 Doan Van Bo, Xom Chieu Ward, Ho Chi Minh City.",
        email = "info@zeitmedia.vn",
        phone = "(+84) 84 848 8686",
        copyright = "2025 ZEIT MEDIA. ALL RIGHTS RESERVED",

        menuItems = [
            { id: "1", label: "WORKS", url: "#" },
            { id: "2", label: "SERVICES", url: "#" },
            { id: "3", label: "ABOUT US", url: "#" },
            { id: "4", label: "BLOG", url: "#" },
        ],

        facebookUrl,
        instagramUrl,
        linkedinUrl,
        twitterUrl,
    } = data;

    return (
        <footer className="w-full bg-black text-white pt-20 pb-10 px-4 md:px-12 border-t border-white/10">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-20">
                    {/* Left Column: Info & CTA */}
                    <div className="flex flex-col justify-between">
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-4"><InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} /></h2>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                                <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
                            </p>
                        </div>

                        <Link
                            href={ctaUrl}
                            className="bg-white text-black p-6 md:p-8 flex justify-between items-center group hover:bg-gray-100 transition-colors w-full"
                        >
                            <span className="text-2xl md:text-3xl font-bold">
                                <InlineEditable tag="span" value={ctaText || ""} fieldPath="ctaText" sectionIndex={sectionIndex} />
                            </span>
                            <ArrowUpRight className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right Column: Menu & Socials */}
                    <div className="flex flex-col">
                        <nav className="flex flex-col mb-12">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={item.id}
                                    href={item.url}
                                    className="flex justify-between items-center py-6 border-b border-white/10 text-gray-400 hover:text-white transition-colors group"
                                >
                                    <span className="text-sm font-medium tracking-widest uppercase">
                                        <InlineEditable tag="span" value={item.label || ""} fieldPath={`menuItems.${index}.label`} sectionIndex={sectionIndex} />
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </nav>

                        <div className="flex gap-8 mt-auto">
                            {facebookUrl && (
                                <Link href={facebookUrl} className="text-gray-400 hover:text-white transition-colors">
                                    <FaFacebookF className="w-6 h-6" />
                                </Link>
                            )}
                            {instagramUrl && (
                                <Link href={instagramUrl} className="text-gray-400 hover:text-white transition-colors">
                                    <FaInstagram className="w-6 h-6" />
                                </Link>
                            )}
                            {linkedinUrl && (
                                <Link href={linkedinUrl} className="text-gray-400 hover:text-white transition-colors">
                                    <Linkedin className="w-6 h-6" />
                                </Link>
                            )}
                            {twitterUrl && (
                                <Link href={twitterUrl} className="text-gray-400 hover:text-white transition-colors">
                                    <Twitter className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-white/10 pt-10 mt-10 text-sm text-gray-400">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div>
                            <h4 className="text-white mb-2">Address</h4>
                            <p className="whitespace-pre-line leading-relaxed">
                                <InlineEditable tag="span" value={address || ""} fieldPath="address" sectionIndex={sectionIndex} />
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white mb-2">Contact Us</h4>
                            <p>
                                <InlineEditable tag="span" value={email || ""} fieldPath="email" sectionIndex={sectionIndex} />
                            </p>
                        </div>
                        <div className="md:text-right">
                            <h4 className="text-white mb-2">Phone Number</h4>
                            <p>
                                <InlineEditable tag="span" value={phone || ""} fieldPath="phone" sectionIndex={sectionIndex} />
                            </p>
                        </div>
                    </div>

                    <div className="text-xs uppercase tracking-widest opacity-60">
                        <InlineEditable tag="span" value={copyright || ""} fieldPath="copyright" sectionIndex={sectionIndex} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
