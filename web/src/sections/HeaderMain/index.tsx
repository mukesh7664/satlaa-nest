"use client";

import React from "react";
import { Header } from "@/components/Navigation/Header";

export default function HeaderMain({ data, sectionIndex }: { data?: any, sectionIndex?: number }) {
    if (data?.isEnabled === false) return null;

    return (
        <div className="section-header-main relative z-[100]">
            <Header data={data} sectionIndex={sectionIndex} />
        </div>
    );
}
