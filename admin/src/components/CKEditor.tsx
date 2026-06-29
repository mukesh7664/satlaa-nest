"use client";

import React from "react";
import dynamic from "next/dynamic";

const RichTextEditorTipTap = dynamic(
  () => import("@/components/RichTextEditorTipTap"),
  { ssr: false }
);

interface Props {
  value: string;
  onChange: (data: string) => void;
  label?: string;
}

const CKEditorComponent: React.FC<Props> = ({ value, onChange, label }) => {
  return (
    <div>
      {label && <label style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>{label}</label>}
      <RichTextEditorTipTap
        value={value}
        onChange={onChange}
        minHeight={300}
      />
    </div>
  );
};

export default CKEditorComponent;