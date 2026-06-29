"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputBase,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  FolderOutlined,
} from "@mui/icons-material";
import { toast } from "sonner";
import { blogApi, BlogTerm } from "@/services/blog.api";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

const inputSx = {
  border: "1.5px solid",
  borderColor: "divider",
  borderRadius: "8px",
  px: 1.5,
  py: 0.875,
  fontSize: "0.875rem",
  width: "100%",
  bgcolor: "background.paper",
  transition: "border-color 0.15s",
  "&:hover": { borderColor: "primary.light" },
  "&.Mui-focused": { borderColor: "primary.main", boxShadow: "0 0 0 3px rgba(25,118,210,0.1)" },
};

const LabeledInput = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <Box>
    <Typography
      component="label"
      sx={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary", mb: 0.75 }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
          *
        </Box>
      )}
    </Typography>
    {children}
  </Box>
);

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<BlogTerm | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await blogApi.getCategories();
      setCategories(data || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = (category?: BlogTerm) => {
    if (category) {
      setEditing(category);
      setFormData({ name: category.name, slug: category.slug, description: category.description || "" });
    } else {
      setEditing(null);
      setFormData({ name: "", slug: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-fill slug when creating (don't clobber an edited slug)
      slug: editing ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      if (editing) {
        await blogApi.updateCategory(editing.id, formData);
        toast.success("Category updated");
      } else {
        await blogApi.createCategory(formData);
        toast.success("Category created");
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await blogApi.deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Blog Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize your blog posts into categories
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchCategories}
              size="small"
              sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: "8px" }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
              textTransform: "none",
              borderRadius: "8px",
              px: 2.5,
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Add Category
          </Button>
        </Stack>
      </Box>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Paper
          sx={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid", borderColor: "divider" }}
          elevation={0}
        >
          {categories.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <FolderOutlined sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" fontSize="0.875rem">
                No categories yet
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 1.5, textTransform: "none" }}
              >
                Add your first category
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {categories.map((cat) => (
                <ListItem
                  key={cat.id}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenDialog(cat)} sx={{ color: "info.main" }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setToDeleteId(cat.id);
                            setDeleteConfirmOpen(true);
                          }}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{cat.name}</Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontFamily: "monospace" }}>
                        /{cat.slug}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1.5px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          <Typography fontWeight={700} fontSize="1.0625rem">
            {editing ? "Edit Category" : "Add New Category"}
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: "8px" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <LabeledInput label="Category Name" required>
              <InputBase value={formData.name} onChange={handleNameChange} placeholder="e.g. Tutorials" sx={inputSx} />
            </LabeledInput>
            <LabeledInput label="Slug" required>
              <InputBase
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. tutorials"
                sx={inputSx}
              />
            </LabeledInput>
            <LabeledInput label="Description">
              <InputBase
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional short description"
                multiline
                minRows={2}
                sx={inputSx}
              />
            </LabeledInput>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1.5px solid", borderColor: "divider", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{ flex: 1, textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              bgcolor: "var(--primary)",
              boxShadow: "none",
              "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)", boxShadow: "none" },
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : editing ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationModal
        open={deleteConfirmOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
        confirmLabel="Delete"
        isDestructive
        onConfirm={() => {
          if (toDeleteId) executeDelete(toDeleteId);
          setDeleteConfirmOpen(false);
          setToDeleteId(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setToDeleteId(null);
        }}
      />
    </Box>
  );
}
