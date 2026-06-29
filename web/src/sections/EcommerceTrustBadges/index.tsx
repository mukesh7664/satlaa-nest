"use client";

import React from "react";
import { InlineEditable } from "@/components/InlineEditable";
import * as Icons from "lucide-react";

interface BadgeItem {
  title: string;
  description: string;
  icon: string;
}

interface EcommerceTrustBadgesProps {
  sectionIndex?: number;
  data: {
    bgColor?: string;
    textColor?: string;
    badges?: BadgeItem[];
  };
}

export default function EcommerceTrustBadges({ data, sectionIndex }: EcommerceTrustBadgesProps) {
  const {
    bgColor: rawBgColor,
    textColor: rawTextColor,
    badges = [],
  } = data || {};

  let bgColor = rawBgColor;
  let textColor = rawTextColor;

  if (!bgColor || bgColor === "#0f172a" || bgColor.includes("0f172a")) {
    bgColor = "#ffffff";
  }
  if (!textColor || textColor === "#ffffff" || textColor === "#fff") {
    textColor = "#0f172a";
  }

  return (
    <section className="py-12 sm:py-16 border-y border-slate-100" style={{ background: bgColor, color: textColor }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y sm:divide-y-0 lg:divide-x divide-slate-150 items-center justify-center">
          {badges.map((badge, index) => {
            const IconComponent = (Icons as any)[badge.icon] || Icons.HelpCircle;

            return (
              <div
                key={index}
                className="flex items-center gap-4 text-left pt-6 sm:pt-0 lg:px-6 first:pt-0 first:lg:pl-0"
              >
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100/40 text-indigo-600">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight mb-1 text-slate-850">
                    <InlineEditable tag="span" value={badge.title} fieldPath={`badges.${index}.title`} sectionIndex={sectionIndex} />
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    <InlineEditable tag="span" value={badge.description} fieldPath={`badges.${index}.description`} sectionIndex={sectionIndex} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
