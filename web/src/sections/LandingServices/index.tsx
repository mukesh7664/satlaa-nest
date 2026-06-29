"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import * as Icons from "lucide-react";

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface LandingServicesProps {
  sectionIndex?: number;
  data: {
    badge?: string;
    title?: string;
    subtitle?: string;
    services?: ServiceItem[];
    columns?: number;
    bgColor?: string;
    textColor?: string;
  };
}

export default function LandingServices({ data, sectionIndex }: LandingServicesProps) {
  const {
    badge = "WHAT WE OFFER",
    title = "Tailored Solutions for Your Growth",
    subtitle = "Discover the unique features and services we bring to the table.",
    services = [],
    columns = 4,
    bgColor = "#ffffff",
    textColor = "#0f172a",
  } = data || {};

  const colSpanClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns as 1 | 2 | 3 | 4] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

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
            <p className="text-base sm:text-lg opacity-85 leading-relaxed">
              <InlineEditable tag="span" value={subtitle} fieldPath="subtitle" sectionIndex={sectionIndex} />
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className={`grid ${colSpanClass} gap-8`}>
          {services.map((service, index) => {
            const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;

            return (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start text-left"
                style={{ color: "#0f172a" }}
              >
                <div className="mb-6 p-4 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  <InlineEditable tag="span" value={service.title} fieldPath={`services.${index}.title`} sectionIndex={sectionIndex} />
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  <InlineEditable tag="span" value={service.description} fieldPath={`services.${index}.description`} sectionIndex={sectionIndex} />
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
