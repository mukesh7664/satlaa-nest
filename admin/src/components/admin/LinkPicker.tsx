import React, { useState } from "react";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { TextField, IconButton } from "@mui/material";
import ResourcePicker from "./ResourcePicker";

interface LinkPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  allowedTypes?: ("product" | "collection" | "page")[];
  collectionLinkFormat?: "plain" | "query";
}

export default function LinkPicker({
  value,
  onChange,
  label = "Link",
  placeholder = "/products",
  helperText,
  allowedTypes = ["page", "product", "collection"],
  collectionLinkFormat = "query",
}: LinkPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{
    name: string;
    slug: string;
    type: string;
  } | null>(null);

  const handleSelect = (slug: string, type: string, extraData?: any) => {
    const resourceName =
      extraData?.title ||
      extraData?.name ||
      extraData?.productInfo?.title ||
      slug;

    setSelectedResource({
      name: resourceName,
      slug,
      type,
    });
    onChange(slug);
    setIsPickerOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedResource(null);
    onChange("");
  };

  const handleManualInput = (inputValue: string) => {
    // Clear selected resource when user manually types
    if (selectedResource) {
      setSelectedResource(null);
    }
    onChange(inputValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}

      <div className="space-y-2">
        {/* Selected Resource Display */}
        {selectedResource && (
          <div className="flex items-center justify-between p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-lg">
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--primary)]">
                {selectedResource.name}
              </div>
              <div className="text-xs text-[var(--primary)] mt-0.5">
                {selectedResource.type.charAt(0).toUpperCase() +
                  selectedResource.type.slice(1)}{" "}
                • {selectedResource.slug}
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="p-1 text-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors"
              title="Clear selection"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        )}

        {/* Input Field with Inline Search Icon */}
        <div className="relative">
          <TextField
            fullWidth
            size="small"
            value={value}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder={placeholder}
            sx={{ bgcolor: "white" }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setIsPickerOpen(true)}
                  size="small"
                  title="Search for resource"
                  edge="end"
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </div>
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        initialType={allowedTypes[0]}
        allowedTypes={allowedTypes}
        collectionLinkFormat={collectionLinkFormat}
      />
    </div>
  );
}
