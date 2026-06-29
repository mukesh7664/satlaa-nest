"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import Script from "next/script";

interface FooterSpotlightProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

declare global {
  interface Window {
    UnicornStudio: {
      init: () => void;
      isInitialized: boolean;
    };
  }
}

export function FooterSpotlight({
  children,
  className,
  ...props
}: FooterSpotlightProps) {
  useEffect(() => {
    // Component mount check can be useful for other initializations
  }, []);

  const handleScriptLoad = () => {
    if (window.UnicornStudio) {
      window.UnicornStudio.init();
    }
  };

  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-[#0b1c3e] border-t border-white/10",
        className
      )}
      {...props}
    >
      <Script
        src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.35/dist/unicornStudio.umd.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />

      {/* Unicorn Studio Embed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          id="unicorn-embed-footer"
          data-us-project="pq3uBe2SoKjGYbl3bESb"
          data-us-lazyload="true"
          style={{ width: "100%", height: "100%" }}
        ></div>
        {/* Color Correction Overlay */}
        <div
          className="absolute inset-0 bg-[#0b1c3e] mix-blend-color z-[1]"
          style={{ backdropFilter: "hue-rotate(15deg)" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </footer>
  );
}
