import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Box } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface ReviewsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const ReviewsEditor: React.FC<ReviewsEditorProps> = ({ data, onChange }) => {
  const reviews = data.reviews || [];

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addReview = () => {
    updateField("reviews", [...reviews, { name: "", date: "Recently", comment: "", rating: 5 }]);
  };

  const removeReview = (index: number) => {
    updateField("reviews", reviews.filter((_: any, i: number) => i !== index));
  };

  const updateReview = (index: number, field: string, value: any) => {
    const newReviews = reviews.map((rev: any, i: number) => 
      i === index ? { ...rev, [field]: value } : rev
    );
    updateField("reviews", newReviews);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary">AutoServices Reviews Settings</Typography>
      
      <TextField
        label="Main Title (e.g. Excellent)"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />

      <TextField
        label="Total Reviews Text (e.g. 2,147 reviews)"
        fullWidth
        size="small"
        value={data.totalReviews || ""}
        onChange={(e) => updateField("totalReviews", e.target.value)}
      />

      <Typography variant="subtitle2">Customer Reviews</Typography>
      <Box className="space-y-4">
        {reviews.map((rev: any, index: number) => (
          <Box key={index} className="p-4 border rounded-lg bg-slate-50 relative">
            <IconButton 
              size="small" 
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
              onClick={() => removeReview(index)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            
            <Stack spacing={2}>
              <TextField
                label="Customer Name"
                fullWidth
                size="small"
                value={rev.name || ""}
                onChange={(e) => updateReview(index, "name", e.target.value)}
              />
              <TextField
                label="Date"
                fullWidth
                size="small"
                value={rev.date || ""}
                onChange={(e) => updateReview(index, "date", e.target.value)}
              />
              <TextField
                label="Rating (1-5)"
                fullWidth
                size="small"
                type="number"
                value={rev.rating || 5}
                onChange={(e) => updateReview(index, "rating", parseInt(e.target.value))}
              />
              <TextField
                label="Comment"
                fullWidth
                size="small"
                multiline
                rows={3}
                value={rev.comment || ""}
                onChange={(e) => updateReview(index, "comment", e.target.value)}
              />
            </Stack>
          </Box>
        ))}
        
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          size="small" 
          onClick={addReview}
        >
          Add Review
        </Button>
      </Box>
    </Stack>
  );
};
