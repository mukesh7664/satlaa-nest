import React from "react";
import { TextField, Stack, Typography, Button, IconButton, Divider } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  link: string;
}

interface BlogCarouselEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const BlogCarouselEditor: React.FC<BlogCarouselEditorProps> = ({ data, onChange }) => {
  const posts: BlogPost[] = data.posts || [];

  const handleUpdatePost = (index: number, updatedFields: Partial<BlogPost>) => {
    const updated = [...posts];
    updated[index] = { ...updated[index], ...updatedFields };
    onChange({ ...data, posts: updated });
  };

  const handleAddPost = () => {
    const updated = [
      ...posts,
      {
        id: `blog-post-${Date.now()}`,
        title: "New Blog Post",
        excerpt: "Write a short summary...",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        author: "Admin",
        image: "",
        link: "#"
      }
    ];
    onChange({ ...data, posts: updated });
  };

  const handleRemovePost = (index: number) => {
    const updated = posts.filter((_, idx) => idx !== index);
    onChange({ ...data, posts: updated });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Blog Carousel Settings
      </Typography>

      <TextField
        label="Editorial Title"
        fullWidth
        size="small"
        value={data.title || "LATEST NEWS"}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <Divider />
      
      <Typography variant="subtitle2" fontWeight="bold">
        Blog Cards
      </Typography>

      {posts.map((post, idx) => (
        <Stack key={post.id || idx} spacing={2} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2, position: "relative" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" fontWeight="bold" color="textSecondary">
              {`CARD #${idx + 1}`}
            </Typography>
            <IconButton color="error" size="small" onClick={() => handleRemovePost(idx)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>

          <TextField
            label="Title"
            size="small"
            fullWidth
            value={post.title}
            onChange={(e) => handleUpdatePost(idx, { title: e.target.value })}
          />

          <TextField
            label="Excerpt"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={post.excerpt}
            onChange={(e) => handleUpdatePost(idx, { excerpt: e.target.value })}
          />
          
          <Stack direction="row" spacing={2}>
            <TextField
              label="Date"
              size="small"
              fullWidth
              value={post.date}
              onChange={(e) => handleUpdatePost(idx, { date: e.target.value })}
            />
            <TextField
              label="Author"
              size="small"
              fullWidth
              value={post.author}
              onChange={(e) => handleUpdatePost(idx, { author: e.target.value })}
            />
          </Stack>

          <TextField
            label="Target Link"
            size="small"
            fullWidth
            value={post.link}
            onChange={(e) => handleUpdatePost(idx, { link: e.target.value })}
          />

          <ShopifyImagePicker
            label="Post Cover Image"
            value={post.image}
            onChange={(url) => handleUpdatePost(idx, { image: url })}
          />
        </Stack>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<Add />}
        onClick={handleAddPost}
        sx={{ textTransform: "none" }}
      >
        Add Blog Card
      </Button>
    </Stack>
  );
};
