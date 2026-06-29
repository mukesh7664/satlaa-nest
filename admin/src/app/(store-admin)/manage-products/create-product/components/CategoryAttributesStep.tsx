"use client";

import React from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Category } from "@/services/categories.api";

interface CategoryAttributesStepProps {
  formData: any;
  setFormData: (data: any) => void;
  category: Category;
}

export default function CategoryAttributesStep({
  formData,
  setFormData,
  category,
}: CategoryAttributesStepProps) {
  // Filter for fields that are NOT variants (General product specifications)
  const fields = (category.fieldsConfig?.fields || []).filter(
    (f: any) => !f.is_variant
  );

  const handleAttributeChange = (name: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      dynamicAttributes: {
        ...(prev.dynamicAttributes || {}),
        [name]: value,
      },
    }));
  };

  if (fields.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
          No additional attributes for this category.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: { xs: 1.5, xl: 3 } }}>
        <Typography variant="h6" fontWeight="700" sx={{ color: "#667eea", fontSize: { xs: '0.9rem', xl: '1.25rem' } }}>
          Dynamic Fields
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '10px', xl: '12px' } }}>
          Enter general information and technical specifications.
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 1.5, xl: 3 } 
        }}
      >
        {fields.map((field: any) => {
          const fieldLabel = field.name.charAt(0).toUpperCase() + field.name.slice(1);
          // Auto-generate placeholder/hints based on field name
          let placeholder = `Enter ${field.name}`;
          let helperText = "";

          if (field.name.toLowerCase().includes('fabric')) {
              placeholder = 'e.g. 100% Cotton, Denim';
              helperText = 'Describe the material used';
          }
          if (field.name.toLowerCase().includes('battery')) {
              placeholder = 'e.g. 4000mAh';
              helperText = 'Enter battery capacity';
          }
          if (field.name.toLowerCase().includes('voltage')) {
              placeholder = 'e.g. 220V';
              helperText = 'Operating voltage';
          }
          if (field.name.toLowerCase().includes('warranty')) {
              placeholder = 'e.g. 1 Year';
              helperText = 'Manufacturer warranty duration';
          }
          if (field.name.toLowerCase().includes('fit')) {
              placeholder = 'e.g. Slim, Regular';
              helperText = 'Typical fit style';
          }

          return (
            <Box key={field.name}>
              {field.type === "select" ? (
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: { xs: 11, xl: 14 } }}>{fieldLabel}</InputLabel>
                  <Select
                    value={formData.dynamicAttributes?.[field.name] || ""}
                    label={fieldLabel}
                    onChange={(e) => handleAttributeChange(field.name, e.target.value)}
                    sx={{ height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } }}
                  >
                    <MenuItem value="" disabled sx={{ fontSize: { xs: 11, xl: 14 } }}>Select {fieldLabel}</MenuItem>
                    {(field.options || []).map((opt: string) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: { xs: 11, xl: 14 } }}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  label={fieldLabel}
                  placeholder={placeholder}
                  value={formData.dynamicAttributes?.[field.name] || ""}
                  onChange={(e) => handleAttributeChange(field.name, e.target.value)}
                  type={field.type === "number" ? "number" : "text"}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { height: { xs: 32, xl: 40 }, fontSize: { xs: 11, xl: 14 } } }}
                  FormHelperTextProps={{ sx: { fontSize: { xs: 9, xl: 11 }, mt: 0.2 } }}
                  helperText={helperText}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
