import React from "react";
import { Box, Stack, Typography, Paper, Button, TextField } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface BadgeItem {
  title: string;
  description: string;
  icon: string;
}

interface EcommerceTrustBadgesEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const EcommerceTrustBadgesEditor: React.FC<EcommerceTrustBadgesEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: keyof BadgeItem, value: string) => {
    const newBadges = [...(data.badges || [])];
    newBadges[index] = { ...newBadges[index], [field]: value };
    updateData("badges", newBadges);
  };

  const handleAddItem = () => {
    const newBadges = [...(data.badges || []), { title: "New Benefit", description: "Details...", icon: "Shield" }];
    updateData("badges", newBadges);
  };

  const handleRemoveItem = (index: number) => {
    const newBadges = data.badges.filter((_: any, i: number) => i !== index);
    updateData("badges", newBadges);
  };

  return (
    <Stack spacing={3}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.bgColor || "#0f172a"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.bgColor || "#0f172a"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Text Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.textColor || "#ffffff"}
              onChange={(e) => updateData("textColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.textColor || "#ffffff"}
              onChange={(e) => updateData("textColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
      </div>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Trust Badges list
        </Typography>
        {data.badges?.map((item: BadgeItem, index: number) => (
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
                    value={item.icon || "Shield"}
                    onChange={(e) => handleUpdateItem(index, "icon", e.target.value)}
                    placeholder="Truck, Shield, ShieldCheck, Heart, etc."
                    sx={{ bgcolor: "white" }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description / Details</label>
                <TextField
                  size="small"
                  fullWidth
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
                Remove Badge
              </Button>
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add Trust Badge
        </Button>
      </Box>
    </Stack>
  );
};
