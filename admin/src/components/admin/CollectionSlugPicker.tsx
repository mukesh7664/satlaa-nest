import React, { useState } from "react";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import ResourcePicker from "./ResourcePicker";
import { Collection } from "@/services/collections.api";
import { Product } from "@/services/products.api";
import { Page } from "@/services/pages.api";

interface CollectionSlugPickerProps {
  value: string | string[]; // Single slug or array of slugs
  onChange: (value: string | string[]) => void;
  label?: string;
  helperText?: string;
  multiple?: boolean; // Allow multiple collection selection
  placeholder?: string;
}

export default function CollectionSlugPicker({
  value,
  onChange,
  label = "Collection",
  helperText,
  multiple = false,
  placeholder = "No collection selected",
}: CollectionSlugPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<
    Array<{ slug: string; name: string }>
  >([]);

  // Normalize value to array for easier handling
  const valueArray = Array.isArray(value) ? value : value ? [value] : [];
  const hasValue = valueArray.length > 0;

  const handleSelect = (
    slug: string,
    _type: string,
    extraData?: Product | Collection | Page
  ) => {
    const collectionName = (extraData as Collection)?.name || slug;

    if (multiple) {
      // Add to array if not already present
      const newSlugs = [...valueArray];
      if (!newSlugs.includes(slug)) {
        newSlugs.push(slug);
        onChange(newSlugs);

        // Update selected collections for display
        setSelectedCollections((prev) => [
          ...prev,
          { slug, name: collectionName },
        ]);
      }
    } else {
      // Single selection
      onChange(slug);
      setSelectedCollections([{ slug, name: collectionName }]);
    }

    setIsPickerOpen(false);
  };

  const handleRemove = (slugToRemove: string) => {
    if (multiple) {
      const newSlugs = valueArray.filter((s) => s !== slugToRemove);
      onChange(newSlugs);
      setSelectedCollections((prev) =>
        prev.filter((c) => c.slug !== slugToRemove)
      );
    } else {
      onChange("");
      setSelectedCollections([]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}

      <div className="space-y-2">
        {/* Selected Collections Display - Simplified */}
        {hasValue && (
          <div className="space-y-2">
            {valueArray.map((slug) => {
              const collection = selectedCollections.find(
                (c) => c.slug === slug
              );
              const displayName = collection?.name || slug;

              return (
                <div key={slug} className="space-y-2">
                  {/* Collection Display - No Icon, No Arrow */}
                  <div className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                    {displayName}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsPickerOpen(true)}
                      type="button"
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                      Replace
                    </button>
                    <button
                      onClick={() => handleRemove(slug)}
                      type="button"
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-white border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Button (shown when empty or when multiple is true) */}
        {(!hasValue || multiple) && (
          <button
            onClick={() => setIsPickerOpen(true)}
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-[var(--primary)] text-slate-600 hover:text-[var(--primary)] rounded-lg transition-all group"
          >
            {hasValue ? (
              <>
                <AddIcon
                  fontSize="small"
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">
                  Add Another Collection
                </span>
              </>
            ) : (
              <>
                <AddIcon
                  fontSize="small"
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Add Collection</span>
              </>
            )}
          </button>
        )}
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        initialType="collection"
        allowedTypes={["collection"]}
        collectionLinkFormat="plain"
      />
    </div>
  );
}
