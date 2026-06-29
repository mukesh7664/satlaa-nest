"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { uploadApi } from "@/services/upload.api";
import MediaPickerModal from "@/components/MediaPickerModal";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  recommendedRatio?: string;
  recommendedSize?: string;
  compact?: boolean;
  aspectRatio?: number; // Target aspect ratio (width / height)
  isGlobal?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  folder = "homepage",
  recommendedRatio,
  recommendedSize,
  compact = false,
  aspectRatio,
  isGlobal = false,
  mediaType = "image",
}: ImageUploaderProps & { mediaType?: "image" | "video" | "any" }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (file: any) => {
    const url = file.url;
    // Check if it's an image before doing aspect ratio check
    const isImage =
      file.mimeType?.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

    if (aspectRatio && isImage && mediaType !== "video") {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const tolerance = 0.05; // Allow 5% deviation
        if (Math.abs(ratio - aspectRatio) > tolerance) {
          alert(
            `Image must have an aspect ratio of approximately ${aspectRatio}:1. Current ratio: ${ratio.toFixed(
              2
            )}:1`
          );
          return;
        }
        onChange(url);
        setPickerOpen(false);
      };
      img.onerror = () => {
        // If image fails to load (e.g. invalid URL), proceed or warn?
        // Let's assume valid URL for now or just allow it if we can't validate
        onChange(url);
        setPickerOpen(false);
      };
      img.src = url;
    } else {
      onChange(url);
      setPickerOpen(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const isVideo =
    value &&
    (value.endsWith(".mp4") ||
      value.endsWith(".webm") ||
      mediaType === "video");

  if (compact) {
    return (
      <Box>
        {value ? (
          <Box sx={{ width: "100%" }}>
            {isVideo ? (
              <Box
                component="video"
                src={value}
                controls
                sx={{
                  width: "100%",
                  height: 64, // Fixed height for consistency in compact mode
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid #eee",
                  bgcolor: "#f8f9fa",
                  mb: 1,
                }}
              />
            ) : (
              <Box
                component="img"
                src={value}
                alt="Uploaded"
                sx={{
                  width: "100%",
                  height: 64, // Fixed height for consistency in compact mode
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid #eee",
                  bgcolor: "#f8f9fa",
                  mb: 1,
                }}
              />
            )}
            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title={`Change ${mediaType === "video" ? "Video" : "Image"}`}>
                <IconButton
                  size="small"
                  onClick={() => setPickerOpen(true)}
                  sx={{
                    bgcolor: "white",
                    border: "1px solid",
                    borderColor: "grey.200",
                    "&:hover": { bgcolor: "grey.50" },
                    width: 24,
                    height: 24,
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={`Remove ${mediaType === "video" ? "Video" : "Image"}`}>
                <IconButton
                  size="small"
                  onClick={handleRemove}
                  sx={{
                    bgcolor: "white",
                    border: "1px solid",
                    borderColor: "grey.200",
                    color: "error.main",
                    "&:hover": { bgcolor: "error.50" },
                    width: 24,
                    height: 24,
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ) : (
          <Box
            onClick={() => setPickerOpen(true)}
            sx={{
              width: "100%",
              height: "100%",
              minHeight: 64, // Fallback if parent doesn't set height
              bgcolor: "grey.100",
              borderRadius: 1,
              border: "1px dashed",
              borderColor: "grey.300",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "grey.200", borderColor: "primary.main" },
            }}
          >
            <CloudUploadIcon color="action" fontSize="small" />
            <Typography variant="caption" color="text.secondary" fontSize={10}>
              Upload
            </Typography>
          </Box>
        )}
        <MediaPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
          title={`Select ${label}`}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mb={1}
      >
        {label}
        {(recommendedRatio || recommendedSize) && (
          <span
            style={{ display: "block", fontSize: "0.75rem", color: "#666" }}
          >
            {recommendedRatio && `Ratio: ${recommendedRatio}`}
            {recommendedRatio && recommendedSize && " • "}
            {recommendedSize && `Size: ${recommendedSize}`}
          </span>
        )}
      </Typography>

      {value ? (
        <Stack spacing={1} alignItems="flex-start">
          {isVideo ? (
            <Box
              component="video"
              src={value}
              controls
              sx={{
                width: "100%",
                maxWidth: 300,
                height: "auto",
                borderRadius: 1,
                border: "1px solid #eee",
              }}
            />
          ) : (
            <Box
              component="img"
              src={value}
              alt="Uploaded"
              sx={{
                width: "100%",
                maxWidth: 300,
                height: "auto",
                borderRadius: 1,
                border: "1px solid #eee",
              }}
            />
          )}
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => setPickerOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              Change
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemove}
              sx={{ flexShrink: 0 }}
            >
              Remove
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => setPickerOpen(true)}
          >
            Choose {mediaType === "video" ? "Video" : "Image"}
          </Button>
        </Box>
      )}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        title={`Select ${label}`}
        isGlobal={isGlobal}
      />
    </Box>
  );
}
