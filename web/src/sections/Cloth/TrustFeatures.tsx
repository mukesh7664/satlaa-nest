"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

interface Feature {
  icon: "shipping" | "secure" | "returns" | "support";
  title: string;
  description: string;
}

interface ClothTrustFeaturesProps {
  sectionIndex?: number;
  data: {
    features?: Feature[];
    bgColor?: string;
  };
}

export default function ClothTrustFeatures({ data, sectionIndex }: ClothTrustFeaturesProps) {
  const {
    features = [],
    bgColor = ""
  } = data || {};

  if (!features || features.length === 0) return null;

  const renderIcon = (iconName: string) => {
    const props = { size: 24, className: "text-[#111111] stroke-[1.25]" };
    switch (iconName) {
      case "shipping":
        return <Truck {...props} />;
      case "secure":
        return <ShieldCheck {...props} />;
      case "returns":
        return <RefreshCw {...props} />;
      case "support":
        return <Headphones {...props} />;
      default:
        return <Truck {...props} />;
    }
  };

  return (
    <section className="py-12 border-y border-gray-100" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-none">
                {renderIcon(item.icon)}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#111111]">
                  <InlineEditable tag="span" value={item.title || ""} fieldPath={`features.${idx}.title`} sectionIndex={sectionIndex} />
                </h4>
                <p className="text-[11px] text-[#8e8e8e] leading-relaxed max-w-[200px]">
                  <InlineEditable tag="span" value={item.description || ""} fieldPath={`features.${idx}.description`} sectionIndex={sectionIndex} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
