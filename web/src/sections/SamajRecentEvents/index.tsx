"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface EventItem {
    image?: string;
    date?: string;
    title?: string;
    location?: string;
}

interface SamajRecentEventsProps {
  sectionIndex?: number;
    badgeText?: string;
    title?: string;
    events?: EventItem[];
}

export default function SamajRecentEvents({ data, sectionIndex }: { data: SamajRecentEventsProps, sectionIndex?: number }) {
    const {
        badgeText = "",
        title = "",
        events = [],
    } = data || {};

    if (!events || events.length === 0) return null;

    return (
        <section className="py-16 px-4 md:px-8">
            <div className="max-w-7xl mx-auto rounded-[2rem] bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-8 md:p-16 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

                {/* Header */}
                <div className="text-center mb-12 relative z-10">
                    <span className="inline-block bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm mb-4 shadow-sm">
                        <InlineEditable tag="span" value={badgeText} fieldPath="badgeText" sectionIndex={sectionIndex} />
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                        <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                    </h2>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                    {events.map((event, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-3xl overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <InlineImageEditable
                                    src={event.image || "/images/placeholder-event.jpg"}
                                    alt={event.title || "Event Image"}
                                    fill
                                    fieldPath={`events.${index}.image`}
                                    sectionIndex={sectionIndex}
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {/* Date Badge Overlay */}
                                <div className="absolute bottom-0 left-4 bottom-8 translate-y-1/2 bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md z-20">
                                    <InlineEditable tag="span" value={event.date || ""} fieldPath={`events.${index}.date`} sectionIndex={sectionIndex} />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 pt-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                                    <InlineEditable tag="span" value={event.title || ""} fieldPath={`events.${index}.title`} sectionIndex={sectionIndex} />
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    <InlineEditable tag="span" value={event.location || ""} fieldPath={`events.${index}.location`} sectionIndex={sectionIndex} />
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
