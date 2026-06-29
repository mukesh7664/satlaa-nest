"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { RefreshCw, Truck, Headphones } from "lucide-react";

interface Feature {
  icon: "return" | "shipping" | "support";
  title: string;
  description: string;
}

interface ShoesFeaturesRowProps {
  sectionIndex?: number;
  data?: {
    features?: Feature[];
  };
}


export default function ShoesFeaturesRow({ data, sectionIndex }: ShoesFeaturesRowProps) {
  const features = data?.features || [];

  const renderIcon = (type: string) => {
    switch (type) {
      case "return":
        return <RefreshCw size={24} className="text-[#55eb0c]" />;
      case "shipping":
        return <Truck size={24} className="text-[#55eb0c]" />;
      case "support":
        return <Headphones size={24} className="text-[#55eb0c]" />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full bg-[#f2f5fa] py-12 border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300">
              
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shrink-0">
                {renderIcon(feature.icon)}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-black text-black tracking-[0.2em] mb-1.5 uppercase font-sans">
                  <InlineEditable tag="span" value={feature.title || ""} fieldPath={`features.${i}.title`} sectionIndex={sectionIndex} />
                </span>
                <span className="text-slate-500 text-xs font-semibold leading-relaxed">
                  <InlineEditable tag="span" value={feature.description || ""} fieldPath={`features.${i}.description`} sectionIndex={sectionIndex} />
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
