"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Box, TextField, Typography, CircularProgress } from "@mui/material";

// Dynamic import to avoid SSR issues with TipTap
const RichTextEditorTipTap = dynamic(
  () => import("@/components/RichTextEditorTipTap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: 300,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={24} />
      </div>
    ),
  }
);

export const RichTextEditor = ({ data, onChange }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box className="space-y-6">
      <div className="space-y-2">
        <Typography variant="subtitle2" color="text.secondary">
          Section Title (Optional)
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Enter section title"
          value={data.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Typography variant="subtitle2" color="text.secondary">
          Content
        </Typography>
        <RichTextEditorTipTap
          value={data.content || ""}
          onChange={(html: string) => handleChange("content", html)}
          placeholder="Start writing your content here..."
          minHeight={350}
        />
      </div>
    </Box>
  );
};
