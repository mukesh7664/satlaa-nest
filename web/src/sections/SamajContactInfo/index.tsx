"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaDownload, FaUserPlus, FaHeadset, FaMobileAlt } from "react-icons/fa";

interface ContactCard {
    title: string;
    subtitle: string;
    image: string;
    buttonText?: string;
    buttonIcons?: ("phone" | "whatsapp" | "email")[];
}

interface FooterItem {
    icon: string;
    title: string;
    subtitle: string;
}

interface SamajContactInfoProps {
  sectionIndex?: number;
    data: {
        cards?: ContactCard[];
        footerItems?: FooterItem[];
    };
}

const SamajContactInfo: React.FC<SamajContactInfoProps> = ({ data, sectionIndex }) => {
    const {
        cards = [],
        footerItems = []
    } = data || {};

    if (!cards || cards.length === 0) return null;

    const renderIcon = (name: string) => {
        switch (name) {
            case "phone": return <FaPhoneAlt />;
            case "whatsapp": return <FaWhatsapp />;
            case "email": return <FaEnvelope />;
            case "download": return <FaDownload />;
            case "user-plus": return <FaUserPlus />;
            case "headset": return <FaHeadset />;
            case "mobile": return <FaMobileAlt />;
            default: return null;
        }
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 md:px-8">
                {/* 4-Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            className="relative rounded-2xl overflow-hidden bg-[#fae8cc] min-h-[300px] flex items-center p-8 md:p-12 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="w-1/2 z-10">
                                <h3 className="text-3xl md:text-5xl font-extrabold text-[#1a1a1a] leading-tight mb-4">
                                    <InlineEditable tag="span" value={card.title || ""} fieldPath={`cards.${index}.title`} sectionIndex={sectionIndex} />
                                </h3>
                                {card.subtitle && (
                                    <p className="text-lg md:text-xl font-medium text-[#444]">
                                        <InlineEditable tag="span" value={card.subtitle || ""} fieldPath={`cards.${index}.subtitle`} sectionIndex={sectionIndex} />
                                    </p>
                                )}

                                {card.buttonIcons && (
                                    <div className="flex flex-wrap gap-3 mt-8">
                                        {card.buttonIcons.map((icon, i) => (
                                            <button key={i} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-[#333] transition-colors">
                                                {renderIcon(icon)}
                                                <span className="capitalize">{icon === 'phone' ? 'Voice Call' : icon === 'whatsapp' ? 'Whatsapp' : 'Via Email'}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-0 bottom-0 top-0 w-1/2 h-full">
                                <InlineImageEditable
                                    src={card.image || "/images/placeholder.jpg"}
                                    alt={card.title}
                                    fill
                                    fieldPath={`cards.${index}.image`}
                                    sectionIndex={sectionIndex}
                                    className="object-contain object-bottom p-4"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-100 pt-12">
                    {footerItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-[#e6a119] text-xl group-hover:bg-[#e6a119] group-hover:text-white transition-all">
                                {renderIcon(item.icon)}
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1a1a1a]"><InlineEditable tag="span" value={item.title || ""} fieldPath={`footerItems.${index}.title`} sectionIndex={sectionIndex} /></h4>
                                <p className="text-sm text-gray-500"><InlineEditable tag="span" value={item.subtitle || ""} fieldPath={`footerItems.${index}.subtitle`} sectionIndex={sectionIndex} /></p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SamajContactInfo;
