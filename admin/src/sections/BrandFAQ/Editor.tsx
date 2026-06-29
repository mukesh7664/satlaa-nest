import React, { useState } from "react";
import StyledTextModal from "@/components/StyledTextModal";
import { FormatPaint as FormatPaintIcon } from "@mui/icons-material";
import { Box, Stack, Typography, Paper, Button, TextField, Select, MenuItem } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface FAQEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BrandFAQEditor: React.FC<FAQEditorProps> = ({
  data,
  onChange,
}) => {
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newFaqs = [...(data.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    updateData("faqs", newFaqs);
  };

  const handleAddItem = () => {
    const newFaqs = [...(data.faqs || []), { question: "", answer: "" }];
    updateData("faqs", newFaqs);
  };

  const handleRemoveItem = (index: number) => {
    const newFaqs = data.faqs.filter((_: any, i: number) => i !== index);
    updateData("faqs", newFaqs);
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
      <ShopifyImagePicker
        label="Side Image"
        value={data.image}
        onChange={(url) => updateData("image", url)}
      />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Questions
        </Typography>
        {data.faqs?.map((item: any, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Question
                </label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.question}
                  onChange={(e) =>
                    handleUpdateItem(index, "question", e.target.value)
                  }
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Answer
                </label>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={item.answer}
                  onChange={(e) =>
                    handleUpdateItem(index, "answer", e.target.value)
                  }
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
                Remove Question
              </Button>
            </Stack>
          </Paper>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          variant="outlined"
        >
          Add Question
        </Button>
      </Box>
    </Stack>
  );
};
