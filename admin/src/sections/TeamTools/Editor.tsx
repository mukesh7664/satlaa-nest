import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import {
  Box,
  TextField,
  Stack,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ImageUploader from "@/components/ImageUploader";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";

interface TeamToolsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TeamToolsEditor: React.FC<TeamToolsEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateTool = (index: number, field: string, value: any) => {
    const newTools = [...(data.tools || [])];
    newTools[index] = { ...newTools[index], [field]: value };
    updateData("tools", newTools);
  };

  const handleAddTool = () => {
    const newTools = [
      ...(data.tools || []),
      { name: "", icon: "", description: "" },
    ];
    updateData("tools", newTools);
  };

  const handleRemoveTool = (index: number) => {
    const newTools = data.tools.filter((_: any, i: number) => i !== index);
    updateData("tools", newTools);
  };

  const handleUpdatePoint = (index: number, value: string) => {
    const newPoints = [...(data.points || [])];
    newPoints[index] = value;
    updateData("points", newPoints);
  };

  const handleAddPoint = () => {
    const newPoints = [...(data.points || []), ""];
    updateData("points", newPoints);
  };

  const handleRemovePoint = (index: number) => {
    const newPoints = data.points.filter((_: any, i: number) => i !== index);
    updateData("points", newPoints);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FormatPaintIcon />}
          onClick={() => setStyleModalOpen(true)}
          sx={{ mb: 2 }}
        >
          Style Text Tool
        </Button>
        <StyledTextModal
          open={styleModalOpen}
          onClose={() => setStyleModalOpen(false)}
        />
      </Box>

      {/* Background Settings */}
      <div className="space-y-4 border rounded-lg p-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Background Settings
        </h3>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Type</label>
          <Select
            size="small"
            fullWidth
            value={data.bgType || "color"}
            onChange={(e) => updateData("bgType", e.target.value)}
            className="bg-white"
            inputProps={{ className: "bg-white" }}
          >
            <MenuItem value="color">Solid Color</MenuItem>
            <MenuItem value="gradient">Gradient</MenuItem>
            <MenuItem value="image">Image</MenuItem>
          </Select>
        </div>

        {data.bgType === "color" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Background Color
            </label>
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
        )}

        {data.bgType === "gradient" && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              CSS Gradient
            </label>
            <TextField
              size="small"
              fullWidth
              value={data.bgGradient || ""}
              onChange={(e) => updateData("bgGradient", e.target.value)}
              placeholder="linear-gradient(to right, #ff0000, #0000ff)"
              sx={{ bgcolor: "white" }}
            />
          </div>
        )}

        {data.bgType === "image" && (
          <ShopifyImagePicker
            label="Background Image"
            value={data.backgroundImage || ""}
            onChange={(url) => updateData("backgroundImage", url)}
          />
        )}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Title</label>
        <TextField
          size="small"
          fullWidth
          value={data.title || ""}
          onChange={(e) => updateData("title", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">
          Description
        </label>
        <TextField
          fullWidth
          multiline
          rows={2}
          value={data.description || ""}
          onChange={(e) => updateData("description", e.target.value)}
          sx={{ bgcolor: "white" }}
        />
      </div>

      <ShopifyVideoPicker
        label="Video (Upload or URL)"
        value={data.videoUrl || ""}
        onChange={(url) => updateData("videoUrl", url)}
      />
      <Stack spacing={2}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Text
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.buttonText || ""}
            onChange={(e) => updateData("buttonText", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Background Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateData("buttonBgColor", e.target.value)}
              className="h-10 w-10 shrink-0 p-0 border rounded cursor-pointer"
            />
            <TextField
              size="small"
              fullWidth
              value={data.buttonBgColor || "#004DAA"}
              onChange={(e) => updateData("buttonBgColor", e.target.value)}
              sx={{ bgcolor: "white" }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Button Link
          </label>
          <TextField
            size="small"
            fullWidth
            value={data.buttonLink || ""}
            onChange={(e) => updateData("buttonLink", e.target.value)}
            sx={{ bgcolor: "white" }}
          />
        </div>
      </Stack>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Tools
        </Typography>
        {data.tools?.map((tool: any, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Tool Name
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={tool.name}
                  onChange={(e) =>
                    handleUpdateTool(index, "name", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={tool.description}
                  onChange={(e) =>
                    handleUpdateTool(index, "description", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1}
                >
                  Icon
                </Typography>
                <Box sx={{ width: 120 }}>
                  <ImageUploader
                    value={tool.icon}
                    onChange={(url) => handleUpdateTool(index, "icon", url)}
                    compact
                  />
                </Box>
              </Box>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveTool(index)}
                sx={{ alignSelf: "flex-start" }}
              >
                Remove Tool
              </Button>
            </Stack>
          </Paper>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTool}
          variant="outlined"
        >
          Add Tool
        </Button>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Key Points
        </Typography>
        {data.points?.map((point: string, index: number) => (
          <Stack key={index} direction="row" spacing={1} sx={{ mb: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={point}
              onChange={(e) => handleUpdatePoint(index, e.target.value)}
              sx={{ bgcolor: "white" }}
            />
            <Button
              color="error"
              size="small"
              onClick={() => handleRemovePoint(index)}
            >
              <DeleteIcon />
            </Button>
          </Stack>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPoint}
          variant="outlined"
          size="small"
        >
          Add Point
        </Button>
      </Box>
    </Stack>
  );
};
