import React from "react";
import { Box, Stack, Typography, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface LandingServicesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const LandingServicesEditor: React.FC<LandingServicesEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: keyof ServiceItem, value: string) => {
    const newServices = [...(data.services || [])];
    newServices[index] = { ...newServices[index], [field]: value };
    updateData("services", newServices);
  };

  const handleAddItem = () => {
    const newServices = [...(data.services || []), { title: "New Service", description: "Service details...", icon: "Layout" }];
    updateData("services", newServices);
  };

  const handleRemoveItem = (index: number) => {
    const newServices = data.services.filter((_: any, i: number) => i !== index);
    updateData("services", newServices);
  };

  return (
    <Stack spacing={3}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Badge Text</label>
        <TextField
          size="small"
          fullWidth
          value={data.badge || ""}
          onChange={(e) => updateData("badge", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Section Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Section Subtitle</label>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          value={data.subtitle || ""}
          onChange={(e) => updateData("subtitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Grid Columns</label>
          <Select
            size="small"
            fullWidth
            value={data.columns || 4}
            onChange={(e) => updateData("columns", e.target.value)}
            className="bg-white"
          >
            <MenuItem value={1}>1 Column</MenuItem>
            <MenuItem value={2}>2 Columns</MenuItem>
            <MenuItem value={3}>3 Columns</MenuItem>
            <MenuItem value={4}>4 Columns</MenuItem>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.bgColor || "#ffffff"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.bgColor || "#ffffff"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
      </div>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Services Grid Items
        </Typography>
        {data.services?.map((item: ServiceItem, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }} variant="outlined">
            <Stack spacing={2}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.title || ""}
                    onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                    sx={{ bgcolor: "white" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Lucide Icon Name</label>
                  <TextField
                    size="small"
                    fullWidth
                    value={item.icon || "Layout"}
                    onChange={(e) => handleUpdateItem(index, "icon", e.target.value)}
                    placeholder="Zap, Shield, Search, Layout, etc."
                    sx={{ bgcolor: "white" }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={item.description || ""}
                  onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveItem(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Service
              </Button>
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add Service Card
        </Button>
      </Box>
    </Stack>
  );
};
