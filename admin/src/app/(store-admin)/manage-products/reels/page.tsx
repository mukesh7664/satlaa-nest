"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Movie as MovieIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { productsApi } from "@/services/products.api";
import { uploadApi } from "@/services/upload.api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";

// A single reel as returned by the storefront /products/reels feed.
interface Reel {
  id: string; // product id (_id)
  slug: string;
  title: string;
  price: number;
  videoUrl: string;
  imageUrl: string;
}

// A product option for the picker.
interface ProductOption {
  id: string;
  title: string;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-reel dialog state.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [searching, setSearching] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Load existing reels (products that have a video) ----
  const loadReels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products/reels?limit=100`);
      const body = await res.json();
      const list = Array.isArray(body?.data) ? body.data : [];
      const mapped: Reel[] = list.map((p: any) => ({
        id: p._id,
        slug: p.slug,
        title: p.productInfo?.title || "Product",
        price: p.simplePricing?.basePrice || 0,
        videoUrl: p.video?.url || "",
        imageUrl: p.icon?.url || p.images?.[0]?.url || "",
      }));
      setReels(mapped);
    } catch (e: any) {
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  // ---- Product search for the picker (debounced) ----
  const searchProducts = useCallback(async (term: string) => {
    setSearching(true);
    try {
      const res = await productsApi.getAllProducts({
        search: term,
        limit: 20,
      });
      const list = Array.isArray(res?.products) ? res.products : [];
      setProductOptions(
        list.map((p: any) => ({
          id: p._id,
          title: p.productInfo?.title || p.productInfo?.name || "Untitled",
        }))
      );
    } catch (e) {
      // Silent — the picker just shows no options.
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!dialogOpen) return;
    // Initial (empty search) load when the dialog opens.
    searchProducts("");
  }, [dialogOpen, searchProducts]);

  const handleVideoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const resetDialog = () => {
    setSelectedProduct(null);
    setVideoFile(null);
    setVideoPreview(null);
    setProductOptions([]);
  };

  // ---- Upload the video, then attach it to the selected product ----
  const handleSave = async () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }
    if (!videoFile) {
      toast.error("Choose a video to upload");
      return;
    }
    setSaving(true);
    try {
      // 1. Upload the video to the reels/ folder on S3.
      const uploaded = await uploadApi.uploadVideo(
        videoFile,
        "reels",
        selectedProduct.title,
        `${selectedProduct.title} - Reel`
      );
      const url = uploaded?.url;
      if (!url) throw new Error("Upload did not return a URL");

      // 2. Attach the video to the product. Partial update — only the
      //    dedicated video row is replaced; the rest of the product is safe.
      await productsApi.updateProduct(selectedProduct.id, {
        video: { url, altText: `${selectedProduct.title} - Reel` },
      });

      toast.success("Reel added");
      setDialogOpen(false);
      resetDialog();
      loadReels();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add reel");
    } finally {
      setSaving(false);
    }
  };

  // ---- Remove a reel (clears the product's dedicated video) ----
  const handleDelete = async (reel: Reel) => {
    if (!confirm(`Remove the reel for "${reel.title}"?`)) return;
    try {
      // Sending an empty url deletes the video row without inserting a new one.
      await productsApi.updateProduct(reel.id, {
        video: { url: "" },
      });
      toast.success("Reel removed");
      loadReels();
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove reel");
    }
  };

  return (
    <div className="p-6 space-y-4 font-sans">
      {/* Header */}
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Reels
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Short product videos shown in the app&apos;s Play feed. Each reel is
            attached to a product.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ borderRadius: "10px", textTransform: "none" }}
        >
          Add Reel
        </Button>
      </Box>

      {/* Reels grid */}
      {loading ? (
        <Box className="flex justify-center py-20">
          <CircularProgress />
        </Box>
      ) : reels.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: "12px" }}>
          <CardContent className="text-center py-16">
            <MovieIcon sx={{ fontSize: 48, color: "#cbd5e1" }} />
            <Typography color="text.secondary" mt={1}>
              No reels yet. Click &quot;Add Reel&quot; to upload a product video.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 2,
          }}
        >
          {reels.map((reel) => (
            <Card
              key={reel.id}
              variant="outlined"
              sx={{ borderRadius: "12px", overflow: "hidden" }}
            >
              <Box sx={{ position: "relative", bgcolor: "#000" }}>
                <video
                  src={reel.videoUrl}
                  controls
                  preload="metadata"
                  style={{ width: "100%", height: 260, objectFit: "cover" }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleDelete(reel)}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    bgcolor: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(220,38,38,0.9)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <CardContent sx={{ p: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  noWrap
                  title={reel.title}
                >
                  {reel.title}
                </Typography>
                <Chip
                  label={`₹${reel.price}`}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Reel dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight="bold">Add a Reel</DialogTitle>
        <DialogContent dividers>
          <Box className="space-y-4 pt-1">
            {/* Product picker */}
            <Autocomplete
              options={productOptions}
              getOptionLabel={(o) => o.title}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              value={selectedProduct}
              onChange={(_, v) => setSelectedProduct(v)}
              loading={searching}
              onInputChange={(_, value, reason) => {
                if (reason === "input") searchProducts(value);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select product"
                  placeholder="Search product by name"
                  helperText="Which product is this reel for?"
                />
              )}
            />

            {/* Video picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={handleVideoPick}
            />
            {videoPreview ? (
              <Box>
                <video
                  src={videoPreview}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    borderRadius: 10,
                    background: "#000",
                  }}
                />
                <Button
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  Change video
                </Button>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  py: 3,
                  borderRadius: "12px",
                  borderStyle: "dashed",
                  textTransform: "none",
                }}
              >
                Choose reel video (MP4)
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              resetDialog();
            }}
            disabled={saving}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !selectedProduct || !videoFile}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            sx={{ textTransform: "none", borderRadius: "10px" }}
          >
            {saving ? "Uploading..." : "Save Reel"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
