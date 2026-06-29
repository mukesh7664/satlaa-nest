"use client";

import React from "react";

interface InlineImageEditableProps {
  src: string;
  alt?: string;
  fieldPath: string;      // Jaise 'backgroundImage' ya 'slides.0.image'
  sectionIndex?: number;  // Us section ka index jo update hona hai
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const InlineImageEditable: React.FC<InlineImageEditableProps> = ({
  src,
  alt = "",
  fieldPath,
  sectionIndex,
  className,
  style,
  fill,
  width,
  height,
  priority,
}) => {
  const isPreview = typeof window !== "undefined" && window.location.pathname === "/preview";

  if (!isPreview) {
    // Normal site live view me standard image logic
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
      />
    );
  }

  // Preview Mode: Image par click handling aur hover-styles add karenge
  return (
    <div
      data-inline-image-editable="true"
      className={`relative group cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-2 transition-all inline-block max-w-full ${className?.includes('w-full') ? 'w-full' : ''} ${className?.includes('h-full') ? 'h-full' : ''}`}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (sectionIndex !== undefined) {
          // Parent (Admin app) ko image update notification bhejenge
          window.parent.postMessage(
            {
              type: "IMAGE_EDIT_REQUEST",
              index: sectionIndex,
              fieldPath: fieldPath,
            },
            "*"
          );
        }
      }}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
      />

      {/* Visual Overlay to show it is editable */}
      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[60]">
        <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow font-semibold whitespace-nowrap">
          Click to Change Image
        </span>
      </div>
    </div>
  );
};
