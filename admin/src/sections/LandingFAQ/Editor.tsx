import React from "react";
import { Box, Stack, Typography, Paper, Button, TextField } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingFAQEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const LandingFAQEditor: React.FC<LandingFAQEditorProps> = ({ data, onChange }) => {
  const updateData = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const handleUpdateItem = (index: number, field: keyof FaqItem, value: string) => {
    const newFaqs = [...(data.faqs || [])];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    updateData("faqs", newFaqs);
  };

  const handleAddItem = () => {
    const newFaqs = [...(data.faqs || []), { question: "New Question?", answer: "Answer detail..." }];
    updateData("faqs", newFaqs);
  };

  const handleRemoveItem = (index: number) => {
    const newFaqs = data.faqs.filter((_: any, i: number) => i !== index);
    updateData("faqs", newFaqs);
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

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          FAQ Accordion Items
        </Typography>
        {data.faqs?.map((item: FaqItem, index: number) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: "grey.50" }} variant="outlined">
            <Stack spacing={2}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Question</label>
                <TextField
                  size="small"
                  fullWidth
                  value={item.question || ""}
                  onChange={(e) => handleUpdateItem(index, "question", e.target.value)}
                  sx={{ bgcolor: "white" }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Answer</label>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  value={item.answer || ""}
                  onChange={(e) => handleUpdateItem(index, "answer", e.target.value)}
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
                Remove FAQ
              </Button>
            </Stack>
          </Paper>
        ))}

        <Button startIcon={<AddIcon />} onClick={handleAddItem} variant="outlined">
          Add FAQ Accordion Item
        </Button>
      </Box>
    </Stack>
  );
};
