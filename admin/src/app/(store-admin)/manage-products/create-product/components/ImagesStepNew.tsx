"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Paper,
  TextField,
  Card,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Image as ImageIcon,
  PlayCircleOutline as VideoIcon,
} from "@mui/icons-material";
import Image from "next/image";
import MediaPickerModal from "@/components/MediaPickerModal";

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  position: number;
  altText: string;
  type: "image" | "video" | "logo";
  isPrimary?: boolean;
  variantId?: string | null;
}

interface ImagesStepProps {
  formData: { images?: MediaItem[]; [key: string]: any };
  setFormData: (data: any) => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  bannerImageFile?: File | null;
  setBannerImageFile?: (file: File | null) => void;
}

export default function ImagesStepNew({
  formData,
  setFormData,
  imageFiles,
  setImageFiles,
  bannerImageFile,
  setBannerImageFile,
}: ImagesStepProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);

  const variants = formData.variants || [];
  const images: MediaItem[] = formData.images || [];

  const handleMediaSelect = (file: any) => {
    const fileName = file.url.split("/").pop() || "image";
    const altText = fileName.split(".")[0].replace(/-/g, " ");
    const type = file.mimeType?.startsWith("video/") ? "video" : "image";

    const newMedia: MediaItem = {
      id: `media-${Date.now()}-${images.length}`,
      url: file.url,
      position: images.length,
      altText,
      type: type as any,
      isPrimary: images.length === 0,
      variantId: null,
    };

    setFormData({
      ...formData,
      images: [...images, newMedia],
    });
    setMediaPickerOpen(false);
  };

  const handleVideoSelect = (file: any) => {
    setFormData({
      ...formData,
      video: {
        url: file.url,
        altText: formData.productInfo?.name || "Product video",
        type: "video",
        position: 0,
        isPrimary: false,
      },
    });
    setVideoPickerOpen(false);
  };

  const handleDelete = (index: number) => {
    const newMedia = images.filter((_, i) => i !== index);
    const reorderedMedia = newMedia.map((img, i) => ({
      ...img,
      position: i,
      isPrimary: i === 0,
    }));

    setFormData({
      ...formData,
      images: reorderedMedia,
    });
  };

  const handleAltChange = (index: number, altText: string) => {
    const newMedia = [...images];
    newMedia[index] = { ...newMedia[index], altText };

    setFormData({
      ...formData,
      images: newMedia,
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newMedia = [...images];
    const draggedMedia = newMedia[draggedIndex];

    newMedia.splice(draggedIndex, 1);
    newMedia.splice(dropIndex, 0, draggedMedia);

    const reorderedMedia = newMedia.map((img, i) => ({
      ...img,
      position: i,
      isPrimary: i === 0,
    }));

    setFormData({
      ...formData,
      images: reorderedMedia,
    });

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Box>
      <Box sx={{ mb: { xs: 2, xl: 3 } }}>
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{ color: "#2563eb", fontSize: { xs: "0.9rem", xl: "1.25rem" } }}
        >
          Product Media
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "10px", xl: "12px" } }}>
          Manage your product images and videos.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* Images Grid Section */}
        <Box>
          <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 1.5 }}>
            Images ({images.length})
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 2,
            }}
          >
            {/* Add Images Card (Always First Position) */}
            <Card
              onClick={() => setMediaPickerOpen(true)}
              sx={{
                height: 195,
                border: "2px dashed",
                borderColor: "#3b82f6",
                borderRadius: 3,
                backgroundColor: "rgba(239, 246, 255, 0.4)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 2,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(239, 246, 255, 0.7)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
                },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 32, color: "#2563eb", mb: 1 }} />
              <Typography variant="subtitle2" color="text.primary" fontWeight="bold" sx={{ fontSize: "0.8rem" }}>
                Add Images
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Drop your files here or select to browse
              </Typography>
            </Card>

            {/* Existing Images */}
            {images.map((image, index) => (
              <Paper
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                sx={{
                  border: "2px solid",
                  borderColor: index === 0 ? "#3b82f6" : "#e2e8f0",
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  backgroundColor: draggedIndex === index ? "action.hover" : "background.paper",
                  boxShadow: index === 0 ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "0 2px 4px rgba(0,0,0,0.02)",
                  "&:hover": {
                    borderColor: index === 0 ? "#2563eb" : "#cbd5e1",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  height: 195,
                  cursor: "grab",
                }}
              >
                {/* Top Image Preview Area */}
                <Box sx={{ position: "relative", width: "100%", height: 130, overflow: "hidden", bgcolor: "#f8fafc", flexShrink: 0 }}>
                  {/* Drag Handle */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "grab",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      "&:hover": { bgcolor: "white" },
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Box>

                  {/* Delete Button */}
                  <IconButton
                    onClick={() => handleDelete(index)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      "&:hover": { bgcolor: "error.main", color: "white" },
                      color: "error.main",
                      width: 26,
                      height: 26,
                      p: 0,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>

                  {/* Image/Video Preview */}
                  {image.type === "video" ? (
                    <video
                      src={image.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      muted
                    />
                  ) : (
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      sizes="(max-width: 600px) 100vw, 200px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {/* Badge Overlay */}
                  <Box sx={{ position: "absolute", bottom: 8, left: 8, zIndex: 2 }}>
                    {index === 0 ? (
                      <Chip
                        label="Cover"
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          bgcolor: "#2563eb",
                          color: "white",
                          height: 18,
                          fontSize: "0.65rem",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                        }}
                      />
                    ) : (
                      <Chip
                        label={
                          image.variantId
                            ? `Variant: ${variants.find((v: any) => v.id === image.variantId || v.sku === image.variantId)?.name || "Mapped"}`
                            : "Gallery"
                        }
                        size="small"
                        sx={{
                          fontWeight: "medium",
                          bgcolor: image.variantId ? "#7c3aed" : "rgba(255, 255, 255, 0.95)",
                          color: image.variantId ? "white" : "text.secondary",
                          height: 18,
                          fontSize: "0.65rem",
                          maxWidth: 100,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Bottom Alt Text Area */}
                <Box sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5, flexGrow: 1, justifyContent: "center", bgcolor: "background.paper" }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Describe image (Alt text)"
                    value={image.altText}
                    onChange={(e) => handleAltChange(index, e.target.value)}
                    InputProps={{
                      sx: {
                        fontSize: "0.75rem",
                        height: 28,
                        px: 0.5,
                      },
                    }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Product Video Section */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
            Product Video (Optional)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Add a promotional or showcase video for this product.
          </Typography>

          {formData.video?.url ? (
            <Card
              sx={{
                width: "100%",
                maxWidth: 320,
                height: 140,
                border: "1px solid",
                borderColor: "#e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <video
                src={formData.video?.url}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                controls
                muted
              />
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFormData({
                    ...formData,
                    video: undefined,
                  });
                }}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": { bgcolor: "error.main", color: "white" },
                  color: "error.main",
                  width: 26,
                  height: 26,
                  p: 0,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Card>
          ) : (
            <Card
              onClick={() => setVideoPickerOpen(true)}
              sx={{
                width: "100%",
                maxWidth: 320,
                height: 120,
                border: "2px dashed",
                borderColor: "#cbd5e1",
                borderRadius: 3,
                backgroundColor: "background.default",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                p: 1.5,
                boxShadow: "none",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(239, 246, 255, 0.2)",
                },
              }}
            >
              <VideoIcon sx={{ fontSize: 28, color: "#2563eb", mb: 0.5 }} />
              <Typography variant="caption" fontWeight="bold" color="text.primary">
                Select Product Video
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                Add a showcase video
              </Typography>
            </Card>
          )}
        </Box>
      </Stack>

      {/* Media Pickers */}
      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />

      <MediaPickerModal
        open={videoPickerOpen}
        onClose={() => setVideoPickerOpen(false)}
        onSelect={handleVideoSelect}
      />
    </Box>
  );
}
