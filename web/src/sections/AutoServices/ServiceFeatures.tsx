"use client";

import { InlineEditable } from "@/components/InlineEditable";
import React from "react";
import { Award, DollarSign, Target, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Award: Award,
  DollarSign: DollarSign,
  Target: Target
};

interface AutoServicesServiceFeaturesProps {
  sectionIndex?: number;
  data: {
    features?: {
      icon: string;
      title: string;
      description: string;
    }[];
  };
}

export default function AutoServicesServiceFeatures({ data, sectionIndex }: AutoServicesServiceFeaturesProps) {
  const features = data?.features || [];

  if (!features || features.length === 0) return null;

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
          {features.map((feature, i) => {
            const IconComponent = ICON_MAP[feature.icon] || Award;
            return (
              <React.Fragment key={i}>
                <div className="flex items-center gap-6 flex-1 px-8">
                  <div className="flex-shrink-0">
                    <IconComponent className="text-[#0067b2]" size={48} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-inter font-bold text-[#1a1a1a] text-xl mb-1"><InlineEditable tag="span" value={feature.title || ""} fieldPath={`features.${i}.title`} sectionIndex={sectionIndex} /></h4>
                    <p className="text-[#8e8e8e] font-inter text-sm leading-relaxed"><InlineEditable tag="span" value={feature.description || ""} fieldPath={`features.${i}.description`} sectionIndex={sectionIndex} /></p>
                  </div>
                </div>
                {i < features.length - 1 && (
                  <div className="hidden lg:block w-[1px] h-12 bg-gray-200"></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
