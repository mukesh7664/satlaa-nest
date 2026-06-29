"use client";

import { InlineEditable } from "@/components/InlineEditable";
import { InlineImageEditable } from "@/components/InlineImageEditable";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Member {
    name: string;
    designation: string;
    image: string;
}

interface SamajCommitteeProps {
  sectionIndex?: number;
    title?: string;
    subtitle?: string;
    members?: Member[];
}

export default function SamajCommittee({ data, sectionIndex }: { data: SamajCommitteeProps, sectionIndex?: number }) {
    const {
        title = "",
        subtitle = "",
        members = [],
    } = data || {};

    if (!members || members.length === 0) return null;

    return (
        <section className="py-20 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                {(title || subtitle) && (
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        {title && (
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 relative inline-block mb-4">
                                <InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} />
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#E65C19]"></div>
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-gray-600 text-lg mt-6">
                                <InlineEditable tag="span" value={subtitle || ""} fieldPath="subtitle" sectionIndex={sectionIndex} />
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                    {members.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg mb-4 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                                <InlineImageEditable
                                    src={member.image || "/images/placeholder.png"}
                                    alt={member.name}
                                    fill
                                    fieldPath={`members.${index}.image`}
                                    sectionIndex={sectionIndex}
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#E65C19] transition-colors leading-tight mb-1">
                                <InlineEditable tag="span" value={member.name || ""} fieldPath={`members.${index}.name`} sectionIndex={sectionIndex} />
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">
                                <InlineEditable tag="span" value={member.designation || ""} fieldPath={`members.${index}.designation`} sectionIndex={sectionIndex} />
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
