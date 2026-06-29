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
  VideoLibrary as VideoLibraryIcon,
  DeleteOutline as DeleteOutlineIcon,
  Movie as MovieIcon,
} from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface ShopifyVideoPickerProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
}

export default function ShopifyVideoPicker({
  label = "Video",
  value,
  onChange,
}: ShopifyVideoPickerProps) {
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

  // Helper to render the video preview or empty state
  const renderVideoPreview = (videoUrl: string | undefined) => {
    const hasVideo = !!videoUrl;

    if (hasVideo) {
      return (
        <Box className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
          <Box
            component="video"
            src={videoUrl}
            controls
            sx={{
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Overlay with Change Button */}
          {/* Note: Overlay on video might interfere with controls, so we only show it if not playing or maybe just top right edit button is safer for video. 
              But sticking to the image look: content creators usually just want to change it. 
              However, to play the video they need access to controls. 
              The hover overlay in ShopifyImagePicker covers the whole image. 
              For video, let's put the overlay only on hover and ensure it doesn't block controls if possible, 
              OR just provide the top-right edit button always visible or on hover.
              Use a layout that allows interacting with controls but showing edit options.
          */}
          <Box className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Box
              className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm cursor-pointer hover:bg-white"
              onClick={handleOpenPopover}
            >
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
          startIcon={<MovieIcon fontSize="small" />}
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
          Select Video
        </Button>
      </Box>
    );
  };

  return (
    <Box className="space-y-6">
      {/* Label */}
      {label && (
        <Typography variant="body2" className="font-medium text-slate-700">
          {label}
        </Typography>
      )}

      {/* Primary Video */}
      {renderVideoPreview(value)}

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
              <VideoLibraryIcon fontSize="small" />
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
        title="Select Video"
      />
    </Box>
  );
}
