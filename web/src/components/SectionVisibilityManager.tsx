"use client";

import { useEffect } from "react";
import { usePreview } from "@/contexts/PreviewContext";

export const SectionVisibilityManager = ({ sections }: { sections: any[] }) => {
    const { setHasSectionHeader, setHasSectionFooter } = usePreview();

    useEffect(() => {
        if (!sections || !Array.isArray(sections)) return;

        const hasHeader = sections.some(s => {
            const type = s.section?.type || s.type;
            return (type === 'HeaderMain' || type === 'SamajHeader' || type === 'DentalHeader' || type === 'ShoesHeader');
        });

        const hasFooter = sections.some(s => {
            const type = s.section?.type || s.type;
            return (type === 'FooterMain' || type === 'ShoesFooter');
        });

        setHasSectionHeader(hasHeader);
        setHasSectionFooter(hasFooter);

        // Reset on unmount
        return () => {
            setHasSectionHeader(false);
            setHasSectionFooter(false);
        };
    }, [sections, setHasSectionHeader, setHasSectionFooter]);

    return null;
};
