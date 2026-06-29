import React from "react";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { toast } from "sonner";

interface CopyUrlButtonProps {
  url: string;
}

export const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({ url }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (err) {
      console.error("Failed to copy URL:", err);
      toast.error("Failed to copy URL");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors bg-white text-sm"
      title="Copy URL"
    >
      <ContentCopyIcon fontSize="small" />
      Copy URL
    </button>
  );
};
