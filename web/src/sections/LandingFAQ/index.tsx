"use client";

import React, { useState } from "react";
import { InlineEditable } from "@/components/InlineEditable";
import { Plus, Minus } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingFAQProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    subtitle?: string;
    bgColor?: string;
    textColor?: string;
    faqs?: FaqItem[];
  };
}

export default function LandingFAQ({ data, sectionIndex }: LandingFAQProps) {
  const {
    badge = "HAVE QUESTIONS?",
    title = "Frequently Asked Questions",
    subtitle = "Find answers to common questions about our platform and services.",
    bgColor = "#ffffff",
    textColor = "#0f172a",
    faqs = [],
  } = data || {};

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-28" style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {badge && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-50 text-blue-600 mb-4 border border-blue-100">
              <InlineEditable tag="span" value={badge} fieldPath="badge" sectionIndex={sectionIndex} />
            </span>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            <InlineEditable tag="span" value={title} fieldPath="title" sectionIndex={sectionIndex} />
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg opacity-80 leading-relaxed">
              <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          )}
        </div>

        {/* FAQs List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;

            return (
              <div
                key={index}
                className="border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                style={{ color: "#0f172a" }}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between text-left font-bold text-base sm:text-lg hover:text-blue-600 transition-colors duration-200 cursor-pointer focus:outline-none"
                >
                  <InlineEditable tag="span" value={faq.question} fieldPath={`faqs.${index}.question`} sectionIndex={sectionIndex} />
                  <div className="p-1 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-50 transition-colors">
                    {isOpen ? <Minus className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-slate-50 pt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                    <InlineEditable tag="div" value={faq.answer} fieldPath={`faqs.${index}.answer`} sectionIndex={sectionIndex} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
