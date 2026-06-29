"use client";
import React from "react";

import {
  Box,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  MenuItem,
} from "@mui/material";

import { Category } from "@/services/categories.api";

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category | null) => void;
}

export default function BasicInfoStep({
  formData,
  setFormData,
  selectedCategory,
  setSelectedCategory,
}: BasicInfoStepProps) {
  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: { xs: 1.5, xl: 3 } }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ color: "primary.main", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
            Basic Information
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', xl: '12px' } }}>
            Enter the title, description, and pricing details.
          </Typography>
        </Box>

        {/* Category Header */}
        <Box sx={{ px: { xs: 1.5, xl: 2 }, py: { xs: 1, xl: 1.2 }, border: "1px dashed #667eea", borderRadius: 2, bgcolor: "#f0f4ff" }}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: { xs: 11, xl: 14 } }}>
              Selected Category: <Box component="span" sx={{ color: "primary.main" }}>{selectedCategory?.name || "N/A"}</Box>
            </Typography>
            <Button variant="outlined" size="small" onClick={() => setSelectedCategory(null)} sx={{ height: 24, fontSize: 10, py: 0 }}>
              Change
            </Button>
          </Stack>
        </Box>
      </Stack>

      <Stack spacing={{ xs: 1.5, xl: 3 }}>

        {/* Form Fields Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: { xs: 1.5, xl: 3 } }}>
          <TextField
            label="Product Title *"
            size="small"
            value={formData.productInfo?.title || ""}
            onChange={(e) => setFormData({ ...formData, productInfo: { ...formData.productInfo, title: e.target.value } })}
            fullWidth
            InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
          />
          <TextField
            label="HSN Code"
            size="small"
            value={formData.hsn_code || ""}
            onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
            fullWidth
            InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
          />
        </Box>

        <TextField
          label="Product Description *"
          size="small"
          multiline
          rows={2}
          value={formData.productInfo?.description || ""}
          onChange={(e) => setFormData({ ...formData, productInfo: { ...formData.productInfo, description: e.target.value } })}
          fullWidth
          InputProps={{ sx: { fontSize: { xs: 11, xl: 14 } } }}
        />

        {/* Policy & Purchase Configurations Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1.5, xl: 3 } }}>
          {/* Policy Section */}
          <Box sx={{ p: { xs: 1.5, xl: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 4, bgcolor: "#f8faff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: "primary.main", textTransform: "uppercase", mb: 1.5, display: "block", fontSize: { xs: 9, xl: 11 } }}>
              Return & Replacement Policy
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center" sx={{ minHeight: 56 }}>
              <Stack direction="column" spacing={0.5}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.is_returnable}
                      onChange={(e) => setFormData({ ...formData, is_returnable: e.target.checked })}
                      sx={{ py: 0 }}
                    />
                  }
                  label={<Typography sx={{ fontSize: { xs: 10, xl: 12 }, lineHeight: 1 }}>Returnable</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={formData.is_replaceable}
                      onChange={(e) => setFormData({ ...formData, is_replaceable: e.target.checked })}
                      sx={{ py: 0 }}
                    />
                  }
                  label={<Typography sx={{ fontSize: { xs: 10, xl: 12 }, lineHeight: 1 }}>Replaceable</Typography>}
                />
              </Stack>
              <Box sx={{ flex: 1, minWidth: { xs: 100, sm: 120 } }}>
                <TextField
                  label="Window"
                  type="number"
                  size="small"
                  value={formData.return_window_days}
                  onChange={(e) => setFormData({ ...formData, return_window_days: parseInt(e.target.value) || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end" sx={{ '& p': { fontSize: { xs: 9, xl: 13 } } }}>Days</InputAdornment>,
                    sx: { fontSize: { xs: 11, xl: 14 } }
                  }}
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>

          {/* Purchase Options Section */}
          <Box sx={{ p: { xs: 1.5, xl: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 4, bgcolor: "#faf8ff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Typography variant="caption" fontWeight="bold" sx={{ color: "primary.main", textTransform: "uppercase", mb: 1.5, display: "block", fontSize: { xs: 9, xl: 11 } }}>
              Purchase Configuration
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
              <TextField
                select
                label="Purchase Mode"
                size="small"
                value={formData.purchaseType || "online"}
                onChange={(e) => setFormData({ ...formData, purchaseType: e.target.value })}
                fullWidth
                InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
              >
                <MenuItem value="online">Online Only (Buy Now / Add to Cart)</MenuItem>
                <MenuItem value="quote">Quote Only (Request Quote Form)</MenuItem>
                <MenuItem value="both">Both (Online Purchase & Quote Request)</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
