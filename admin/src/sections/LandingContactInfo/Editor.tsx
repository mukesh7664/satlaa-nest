import React from "react";
import { Stack, TextField, Select, MenuItem } from "@mui/material";

interface LandingContactInfoEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const LandingContactInfoEditor: React.FC<LandingContactInfoEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Contact Form Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.formTitle || ""}
          onChange={(e) => updateData("formTitle", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Physical Address</label>
        <TextField
          size="small"
          fullWidth
          value={data.address || ""}
          onChange={(e) => updateData("address", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Email Address</label>
        <TextField
          size="small"
          fullWidth
          value={data.email || ""}
          onChange={(e) => updateData("email", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Phone Number</label>
        <TextField
          size="small"
          fullWidth
          value={data.phone || ""}
          onChange={(e) => updateData("phone", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Working Hours Info</label>
        <TextField
          size="small"
          fullWidth
          value={data.hours || ""}
          onChange={(e) => updateData("hours", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Show Social Links</label>
          <Select
            size="small"
            fullWidth
            value={data.showSocials ?? true}
            onChange={(e) => updateData("showSocials", e.target.value)}
            className="bg-white"
          >
            <MenuItem value={true as any}>Show Socials</MenuItem>
            <MenuItem value={false as any}>Hide Socials</MenuItem>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Background Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.bgColor || "#f8fafc"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.bgColor || "#f8fafc"}
              onChange={(e) => updateData("bgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>
      </div>
    </Stack>
  );
};
