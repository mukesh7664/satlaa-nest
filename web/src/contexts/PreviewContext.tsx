"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface PreviewContextType {
    pageData: any;
    headerSettings: any;
    footerSettings: any;
    isPreview: boolean;
    hasSectionHeader: boolean;
    hasSectionFooter: boolean;
    setHasSectionHeader: (val: boolean) => void;
    setHasSectionFooter: (val: boolean) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const isPreview = pathname === "/preview";
    const [pageData, setPageData] = useState<any>(null);
    const [headerSettings, setHeaderSettings] = useState<any>(null);
    const [footerSettings, setFooterSettings] = useState<any>(null);
    const [hasSectionHeader, setHasSectionHeader] = useState(false);
    const [hasSectionFooter, setHasSectionFooter] = useState(false);

    useEffect(() => {
        if (!isPreview) return;

        // Notify parent window that preview is ready
        window.parent.postMessage({ type: "previewReady" }, "*");

        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;

            if (type === "previewUpdate") {
                console.log("Preview Update Received in Context:", payload);
                if (payload.sections) {
                    setPageData(payload);
                }
                if (payload.headerSettings) {
                    setHeaderSettings(payload.headerSettings);
                }
                if (payload.footerSettings) {
                    setFooterSettings(payload.footerSettings);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [isPreview]);

    // Prevent navigation in preview mode
    useEffect(() => {
        if (!isPreview) return;

        const handleGlobalClick = (event: MouseEvent) => {
            const originalTarget = event.target as HTMLElement | null;
            const isEditable = 
                originalTarget?.closest('[data-inline-image-editable="true"]') || 
                originalTarget?.closest('[contentEditable="true"]');

            let target = originalTarget;
            while (target && target !== document.body) {
                if (target.tagName === "A" || target.getAttribute("href")) {
                    event.preventDefault();
                    
                    if (!isEditable) {
                        event.stopPropagation();
                        console.log("Navigation prevented in preview mode for:", target.getAttribute("href"));
                    } else {
                        console.log("Navigation prevented but propagation allowed for inline editable element inside link:", target.getAttribute("href"));
                    }
                    break;
                }
                target = target.parentElement;
            }
        };

        document.addEventListener("click", handleGlobalClick, true);
        return () => document.removeEventListener("click", handleGlobalClick, true);
    }, [isPreview]);

    return (
        <PreviewContext.Provider value={{
            pageData,
            headerSettings,
            footerSettings,
            isPreview,
            hasSectionHeader,
            hasSectionFooter,
            setHasSectionHeader,
            setHasSectionFooter
        }}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (context === undefined) {
        throw new Error("usePreview must be used within a PreviewProvider");
    }
    return context;
};
