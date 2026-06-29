import React, { useState, useEffect } from "react";
import {
  Add as AddIcon,
  SwapHoriz as ReplaceIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  UnfoldMore as UnfoldMoreIcon,
} from "@mui/icons-material";
import ResourcePicker from "./admin/ResourcePicker";
import { Collection, collectionsApi } from "@/services/collections.api";
import {
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from "@mui/material";

interface ShopifyCollectionPickerProps {
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
  label?: string;
  multiple?: boolean;
  helperText?: string;
}

export default function ShopifyCollectionPicker({
  value,
  onChange,
  label = "Collection",
  multiple = false,
  helperText,
}: ShopifyCollectionPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [collectionDetailsMap, setCollectionDetailsMap] = useState<
    Record<string, Collection>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // State for menu management
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Normalize value to array
  const valueArray = Array.isArray(value) ? value : value ? [value] : [];
  const hasValue = valueArray.length > 0;

  // Fetch details for all slugs
  useEffect(() => {
    let isMounted = true;

    const fetchDetails = () => {
      const neededSlugs = valueArray.filter(
        (slug) => !collectionDetailsMap[slug] && !loadingMap[slug]
      );

      if (neededSlugs.length === 0) return;

      const fetchSlug = async (slug: string) => {
        if (loadingMap[slug]) return;

        setLoadingMap((prev) => ({ ...prev, [slug]: true }));
        try {
          // Changed to getCollectionBySlug for more accurate lookup
          const response = await collectionsApi.getCollectionBySlug(slug);
          if (response.success && response.collection) {
            if (isMounted) {
              setCollectionDetailsMap((prev) => ({
                ...prev,
                [slug]: response.collection,
              }));
            }
          } else {
            // If not found, set a placeholder to check infinite loop
            if (isMounted) {
              setCollectionDetailsMap((prev) => ({
                ...prev,
                [slug]: {
                  id: "create-new-option",
                  name: slug,
                  slug: slug,
                  type: "manual",
                  isActive: false,
                  updatedAt: "",
                  createdAt: "",
                  sortOrder: 0,
                  productCount: 0,
                } as any,
              }));
            }
          }
        } catch (error) {
          console.error(
            `Failed to fetch collection details for ${slug}:`,
            error
          );
          // Prevent infinite retries by treating error as "loaded with fallback"
          if (isMounted) {
            setCollectionDetailsMap((prev) => ({
              ...prev,
              [slug]: {
                id: "error",
                name: slug,
                slug: slug,
                type: "manual",
                isActive: false,
                updatedAt: "",
                createdAt: "",
                sortOrder: 0,
                productCount: 0,
              } as any,
            }));
          }
        } finally {
          if (isMounted) {
            setLoadingMap((prev) => ({ ...prev, [slug]: false }));
          }
        }
      };

      neededSlugs.forEach(fetchSlug);
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [valueArray, collectionDetailsMap, loadingMap]);

  const handleSelect = (slug: string, _type: string, extraData?: any) => {
    if (multiple) {
      // Add if not exists
      if (!valueArray.includes(slug)) {
        const newValue = [...valueArray, slug];
        onChange(newValue);
        if (extraData) {
          setCollectionDetailsMap((prev) => ({ ...prev, [slug]: extraData }));
        }
      }
    } else {
      // Replace
      onChange(slug);
      if (extraData) {
        setCollectionDetailsMap((prev) => ({ ...prev, [slug]: extraData }));
      }
    }

    // Close picker if single or if simply added
    // For multiple, we might want to keep it open? logic says usually close.
    setIsPickerOpen(false);
    handleCloseMenu();
  };

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    slug: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveSlug(slug);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveSlug(null);
  };

  const handleReplace = () => {
    // Open picker. For multiple, "Replace" means replace the specific item?
    // User requested "Replace" action.
    // If multiple, replace logic: Remove old slug, add new slug (handled by generic onSelect? no.)
    // Let's assume for multiple, "Replace" replaces the specific item at that index?
    // Actually, ResourcePicker doesn't easily support "replacing specific index" callback directly without knowing context.
    // Simpler approach for multiple: "Replace" just opens picker, and we handle the swap?
    // Or maybe just strictly separate:
    // Single: Replace (swaps value)
    // Multiple: No "Replace" on individual items in the menu, usually just "Remove".
    // BUT the task says "keep replace and delete option".
    // I'll support replace for both. For multiple, I need to know WHICH one to replace.
    // ResourcePicker onSelect needs to know if we are replacing `activeSlug`.

    setIsPickerOpen(true);
    handleCloseMenu();
  };

  // Custom onSelect wrapper to handle "Replace" vs "Add" logic
  const onResourcePick = (slug: string, type: string, extraData?: any) => {
    if (activeSlug && multiple) {
      // We are replacing a specific item
      const newValue = valueArray.map((s) => (s === activeSlug ? slug : s));
      // Check for duplicates? If new slug already exists elsewhere, simple swap might create duplicate.
      // For now allow it or dedupe.
      const uniqueValues = Array.from(new Set(newValue));
      onChange(uniqueValues);
      if (extraData)
        setCollectionDetailsMap((prev) => ({ ...prev, [slug]: extraData }));
    } else {
      // Normal select (Add or Single Set)
      handleSelect(slug, type, extraData);
    }
    setActiveSlug(null);
    setIsPickerOpen(false);
  };

  const handleRemove = () => {
    if (multiple && activeSlug) {
      const newValue = valueArray.filter((s) => s !== activeSlug);
      onChange(newValue);
    } else {
      onChange("");
    }
    handleCloseMenu();
  };

  const openPicker = () => {
    setActiveSlug(null); // Ensure we are in "Add" mode not "Replace" mode
    setIsPickerOpen(true);
  };

  const openMenu = Boolean(anchorEl);

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}

      <div className="space-y-2">
        {valueArray.map((slug) => {
          const details = collectionDetailsMap[slug];
          const isLoading = loadingMap[slug];
          const name = details?.name || slug;
          const image = details?.image;

          return (
            <div
              key={slug}
              onClick={(e) => handleOpenMenu(e, slug)}
              className="relative group cursor-pointer"
            >
              <div className="w-full p-1 pl-2 bg-white border border-slate-300 hover:border-slate-400 rounded-lg flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                    {isLoading ? "Loading..." : name}
                  </span>
                </div>

                <div className="px-2 text-slate-400">
                  <UnfoldMoreIcon fontSize="small" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State or Add Button */}
        {(!hasValue || multiple) && (
          <div onClick={openPicker} className="relative group cursor-pointer">
            <div
              className={`w-full h-[42px] px-3 bg-white border ${hasValue ? "border-dashed border-slate-300" : "border-slate-300"
                } hover:border-slate-400 rounded-lg flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors`}
            >
              {hasValue ? <AddIcon fontSize="small" /> : null}
              <span>
                {hasValue ? "Add Another Collection" : "Select Collection"}
              </span>
              {!hasValue && (
                <UnfoldMoreIcon
                  className="text-slate-400 ml-auto"
                  fontSize="small"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}

      {/* Actions Menu */}
      <Popover
        open={openMenu}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1,
            borderRadius: 2,
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0",
          },
        }}
      >
        <List sx={{ p: 1 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleReplace} sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ReplaceIcon fontSize="small" className="text-slate-600" />
              </ListItemIcon>
              <ListItemText
                primary="Replace"
                primaryTypographyProps={{ fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={handleRemove} sx={{ borderRadius: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DeleteIcon fontSize="small" className="text-red-600" />
              </ListItemIcon>
              <ListItemText
                primary="Remove collection"
                primaryTypographyProps={{ fontSize: 14, color: "#dc2626" }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>

      <ResourcePicker
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setActiveSlug(null);
        }}
        onSelect={onResourcePick}
        initialType="collection"
        allowedTypes={["collection"]}
        collectionLinkFormat="plain"
      />
    </div>
  );
}

