"use client";

import React, { useRef, useEffect, useState } from "react";

interface InlineEditableProps {
  tag?: keyof React.JSX.IntrinsicElements;
  value: string;
  fieldPath: string;
  sectionIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

export const InlineEditable: React.FC<InlineEditableProps> = ({
  tag = "span",
  value,
  fieldPath,
  sectionIndex,
  className,
  style,
  placeholder = "Enter text...",
}) => {
  const isPreview = typeof window !== "undefined" && window.location.pathname === "/preview";
  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep the innerText in sync if the prop value changes externally,
  // but DON'T override it while the user is typing (isFocused).
  useEffect(() => {
    if (elementRef.current && !isFocused) {
      if (elementRef.current.innerText !== value) {
        elementRef.current.innerText = value || "";
      }
    }
  }, [value, isFocused]);

  if (!isPreview) {
    return React.createElement(
      tag,
      { className, style },
      value || null
    );
  }

  return React.createElement(
    tag,
    {
      ref: elementRef,
      className: `${className || ""} ${value ? "" : "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"} hover:outline hover:outline-1 hover:outline-blue-500 hover:outline-offset-2 transition-all cursor-text`,
      style,
      contentEditable: true,
      suppressContentEditableWarning: true,
      "data-placeholder": placeholder,
      onFocus: () => setIsFocused(true),
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        setIsFocused(false);
        const newValue = e.target.innerText;
        
        // Only send if it actually changed to avoid spamming
        if (newValue !== value && sectionIndex !== undefined) {
          window.parent.postMessage(
            {
              type: "INLINE_UPDATE",
              index: sectionIndex,
              fieldPath: fieldPath,
              value: newValue,
            },
            "*"
          );
        }
      },
      onClick: (e: React.MouseEvent) => {
        // Stop the wrapper from swallowing the click, so we can edit
        e.stopPropagation();
        e.preventDefault(); 
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          // If it's a heading or span, usually we don't want new lines. 
          // If it's a p tag, maybe we do. We'll disable enter for simple inline edits.
          if (tag !== 'p' && tag !== 'div') {
            e.preventDefault();
            elementRef.current?.blur();
          }
        }
      }
    },
    value
  );
};
