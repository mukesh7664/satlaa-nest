"use client";

import React from "react";
import { Footer } from "@/components/Navigation/Footer";

export default function FooterMain({ data, sectionIndex }: { data?: any, sectionIndex?: number }) {
    if (data?.isEnabled === false) return null;

    return (
        <div className="section-footer-main relative z-[10]">
            <Footer data={data} sectionIndex={sectionIndex} />
        </div>
    );
}
