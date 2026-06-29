import React from "react";
import { TextField, Stack, Typography, Divider } from "@mui/material";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesRowEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const FeaturesRowEditor: React.FC<FeaturesRowEditorProps> = ({ data, onChange }) => {
  const features: Feature[] = data.features || [
    {
      icon: "return",
      title: "30 DAYS RETURN",
      description: "Hassle-free 30-day exchange and refund guarantees on all orders."
    },
    {
      icon: "shipping",
      title: "FREE US DELIVERY",
      description: "Free express shipping across the USA on orders over $150."
    },
    {
      icon: "support",
      title: "SUPPORT 24/7",
      description: "Direct elite support helpline for order tracking and size inquiries."
    }
  ];

  const handleUpdateFeature = (index: number, updatedFields: Partial<Feature>) => {
    const updated = [...features];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange({ ...data, features: updated });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Features Guarantees Settings
      </Typography>

      {features.map((feature, idx) => (
        <Stack key={idx} spacing={2} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
          <Typography variant="caption" fontWeight="bold" color="textSecondary">
            {`GUARANTEE NODE #${idx + 1}`}
          </Typography>

          <TextField
            label="Title Name"
            size="small"
            fullWidth
            value={feature.title}
            onChange={(e) => handleUpdateFeature(idx, { title: e.target.value })}
          />

          <TextField
            label="Description / Details"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={feature.description}
            onChange={(e) => handleUpdateFeature(idx, { description: e.target.value })}
          />
        </Stack>
      ))}
    </Stack>
  );
};
