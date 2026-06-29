"use client";

import React from "react";
import dynamic from "next/dynamic";

const RichTextEditorTipTap = dynamic(
  () => import("@/components/RichTextEditorTipTap"),
  { ssr: false }
);

interface CKEditorWrapperProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
}

const CKEditorWrapper: React.FC<CKEditorWrapperProps> = ({ value, onChange, placeholder }) => {
  return (
    <RichTextEditorTipTap
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Start writing your content..."}
      minHeight={400}
    />
  );
};

export default CKEditorWrapper;
