"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { motion } from "framer-motion";
import {
    FaUserCircle, FaSearch, FaHandshake,
    FaShieldAlt, FaCalendarAlt, FaCheckCircle,
    FaHeadset, FaUsers
} from "react-icons/fa";

interface ReasonItem {
    title: string;
    description: string;
    icon: string;
}

interface WhyChooseSamajProps {
  sectionIndex?: number;
    data: {
        title?: string;
        subtitle?: string;
        reasons?: ReasonItem[];
    };
}

const WhyChooseSamaj: React.FC<WhyChooseSamajProps> = ({ data, sectionIndex }) => {
    const {
        title = "",
        subtitle = "",
        reasons = []
    } = data || {};

    if (!reasons || reasons.length === 0) return null;

    const renderIcon = (name: string) => {
        switch (name) {
            case "user": return <FaUserCircle />;
            case "search": return <FaSearch />;
            case "handshake": return <FaHandshake />;
            case "shield": return <FaShieldAlt />;
            case "calendar": return <FaCalendarAlt />;
            case "check": return <FaCheckCircle />;
            case "headset": return <FaHeadset />;
            case "users": return <FaUsers />;
            default: return <FaCheckCircle />;
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-4xl font-bold text-[#333] mb-4"><InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} /></h2>
                    <p className="text-gray-600 text-lg"><InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} /></p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {reasons.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center group"
                        >
                            <div className="text-4xl text-[#e6a119] mb-6 group-hover:scale-110 transition-transform duration-300">
                                {renderIcon(item.icon)}
                            </div>
                            <h3 className="text-xl font-bold text-[#333] mb-4"><InlineEditable tag="span" value={item.title || ""} fieldPath={`reasons.${index}.title`} sectionIndex={sectionIndex} /></h3>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                <InlineEditable tag="span" value={item.description || ""} fieldPath={`reasons.${index}.description`} sectionIndex={sectionIndex} />
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseSamaj;
