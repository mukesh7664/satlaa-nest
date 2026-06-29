"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion } from "motion/react";

interface AutoServicesPartFinderProps {
  sectionIndex?: number;
  data: {
    title?: string;
    description?: string;
    note?: string;
  };
}

export default function AutoServicesPartFinder({ data, sectionIndex }: AutoServicesPartFinderProps) {
  const {
    title = "",
    description = "",
    note = ""
  } = data || {};

  if (!title) return null;

  const steps = [
    { label: "Select make", number: "01" },
    { label: "Select make First", number: "02" },
    { label: "Select Year", number: "03" },
    { label: "Select Engine", number: "04" },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <h2 className="text-3xl font-inter font-bold text-[#1a1a1a] mb-6"><InlineEditable tag="span" value={title || ""} fieldPath="title" sectionIndex={sectionIndex} /></h2>
        <p className="text-[#8e8e8e] font-inter text-sm max-w-3xl mx-auto mb-10 leading-relaxed">
          <InlineEditable tag="span" value={description || ""} fieldPath="description" sectionIndex={sectionIndex} />
        </p>

        <div className="bg-[#f3f4f6] p-8 rounded-[15px] shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {steps.map((step, i) => (
              <div key={i} className="relative group">
                <div className="flex items-center justify-between w-full h-12 bg-white border border-gray-200 rounded-md px-4 cursor-pointer hover:border-[#0067b2] transition-colors">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-[#8e8e8e] flex items-center justify-center">
                      {step.number}
                    </span>
                    <span className="text-xs font-inter font-bold text-[#8e8e8e] truncate">{step.label}</span>
                  </div>
                  <ChevronDown size={14} className="text-[#8e8e8e]" />
                </div>
              </div>
            ))}
            
            <button className="h-12 bg-[#0067b2] hover:bg-[#005694] text-white font-inter font-bold text-sm rounded-md transition-colors shadow-md">
              Find Auto Parts
            </button>
          </div>
        </div>

        <p className="mt-8 text-[11px] font-inter text-[#8e8e8e] font-medium italic">
          {note}
        </p>
      </div>
    </section>
  );
}
