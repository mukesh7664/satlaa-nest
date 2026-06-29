"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Popover,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  PhotoLibrary as PhotoLibraryIcon,
  DeleteOutline as DeleteOutlineIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface ShopifyImagePickerProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export default function ShopifyImagePicker({
  label = "Image",
  value,
  onChange,
  aspectRatio = "16/9",
  objectFit = "cover",
}: ShopifyImagePickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Popover State
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleOpenPicker = () => {
    setPickerOpen(true);
    handleClosePopover();
  };

  const handleSelectMedia = (file: any) => {
    onChange(file.url);
  };

  const handleRemove = () => {
    onChange("");
    handleClosePopover();
  };

  // Helper to render the image preview or empty state
  const renderImagePreview = (imageUrl: string | undefined) => {
    const hasImage = !!imageUrl;

    if (hasImage) {
      return (
        <Box className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
          <Box
            component="img"
            src={imageUrl}
            alt="Preview"
            sx={{
              width: "100%",
              height: "auto",
              aspectRatio: aspectRatio,
              objectFit: objectFit,
              display: "block",
            }}
          />
          {/* Overlay with Change Button */}
          <Box
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={handleOpenPopover}
          >
            <Box className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <EditIcon sx={{ fontSize: 16, color: "#334155" }} />
              <span className="text-sm font-medium text-slate-700">Change</span>
            </Box>

          </Box>
        </Box>
      );
    }

    // Empty State
    return (
      <Box
        className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center"
        onClick={handleOpenPopover}
      >
        <Button
          variant="contained"
          color="inherit"
          size="small"
          startIcon={<StorageIcon fontSize="small" />}
          sx={{
            bgcolor: "white",
            color: "#0f172a",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 600,
            border: "1px solid #e2e8f0",
            "&:hover": { bgcolor: "#f8fafc" },
          }}
        >
          Select Image
        </Button>
      </Box>
    );
  };

  return (
    <Box className="space-y-2">
      {/* Label */}
      {label && (
        <Typography variant="body2" className="font-medium text-slate-700">
          {label}
        </Typography>
      )}

      {/* Primary Image */}
      {renderImagePreview(value)}

      {/* Popover Menu */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
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
            borderRadius: 2,
            mt: 1,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)",
          },
        }}
      >
        <Box className="py-1">
          <MenuItem onClick={handleOpenPicker}>
            <ListItemIcon>
              <PhotoLibraryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Select from library"
              primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
            />
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem onClick={handleRemove} sx={{ color: "#ef4444" }}>
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" sx={{ color: "#ef4444" }} />
            </ListItemIcon>
            <ListItemText
              primary="Remove"
              primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
            />
          </MenuItem>
        </Box>
      </Popover>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectMedia}
        title="Select Image"
      />
    </Box>
  );
}
