"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Paper,
  Typography,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { toast } from "sonner";
import { categoriesApi, Category } from "@/services/categories.api";
import { useAppSelector } from "@/store/hooks";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { admin } = useAppSelector((state) => state.auth);
  const isSuperAdmin = admin?.role === "super_admin";

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attrLoading, setAttrLoading] = useState(false);

  // Category basic info form
  const [categoryForm, setCategoryForm] = useState<any>({
    name: "",
    slug: "",
    parentId: "",
    fieldsConfig: { fields: [] }
  });

  // Attribute form
  const [openAttrDialog, setOpenAttrDialog] = useState(false);
  const [editingAttrIndex, setEditingAttrIndex] = useState<number | null>(null);
  const [attrForm, setAttrForm] = useState<any>({
    name: "",
    type: "text",
    options: [],
  });
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (!loading && !admin) {
      toast.error("Please login to access this page.");
      router.push("/admin/login");
    }
  }, [admin, loading, router]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const catData = await categoriesApi.getCategoryById(categoryId);
      setCategory(catData);
      setCategoryForm({
        name: catData.name,
        slug: catData.slug,
        parentId: catData.parentId || "",
        fieldsConfig: catData.fieldsConfig || { fields: [] }
      });
    } catch (error) {
      console.error("Failed to fetch category data:", error);
      toast.error("Failed to load category details");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySave = async () => {
    try {
      setSaving(true);
      await categoriesApi.updateCategory(categoryId, categoryForm);
      toast.success("Category updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAttrDialog = (attr?: any, index?: number) => {
    if (attr) {
      setEditingAttrIndex(index ?? null);
      setAttrForm({
        name: attr.name,
        type: attr.type || "text",
        options: attr.options || [],
      });
    } else {
      setEditingAttrIndex(null);
      setAttrForm({
        name: "",
        type: "text",
        options: [],
      });
    }
    setOpenAttrDialog(true);
  };

  const handleAttrSubmit = async () => {
    try {
      const currentFields = [...(categoryForm.fieldsConfig?.fields || [])];
      
      if (editingAttrIndex !== null) {
        currentFields[editingAttrIndex] = attrForm;
      } else {
        currentFields.push(attrForm);
      }

      const updatedForm = {
        ...categoryForm,
        fieldsConfig: { ...categoryForm.fieldsConfig, fields: currentFields }
      };

      setCategoryForm(updatedForm); // Update UI state
      setOpenAttrDialog(false);
      
      // Auto-save to backend
      setAttrLoading(true);
      await categoriesApi.updateCategory(categoryId, updatedForm);
      toast.success(editingAttrIndex !== null ? "Attribute updated" : "Attribute added");
    } catch (error: any) {
      toast.error(error.message || "Failed to save attribute");
    } finally {
      setAttrLoading(false);
    }
  };

  const handleDeleteAttr = async (index: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const currentFields = [...(categoryForm.fieldsConfig?.fields || [])];
      currentFields.splice(index, 1);

      const updatedForm = {
        ...categoryForm,
        fieldsConfig: { ...categoryForm.fieldsConfig, fields: currentFields }
      };

      setCategoryForm(updatedForm);
      await categoriesApi.updateCategory(categoryId, updatedForm);
      toast.success("Attribute deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete attribute");
    }
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs & Header */}
      <Stack spacing={1}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link href="/manage-products/categories" passHref legacyBehavior>
            <MuiLink underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
              Categories
            </MuiLink>
          </Link>
          <Typography color="text.primary">{category?.name}</Typography>
        </Breadcrumbs>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconButton onClick={() => router.back()} size="small">
              <ArrowBackIcon />
            </IconButton>
            <h1 className="text-2xl font-bold text-slate-800">Edit Category: {category?.name}</h1>
          </div>
          {(isSuperAdmin || (category?.storeId && category.storeId === admin?.storeId)) && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCategorySave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </Stack>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <Box className="lg:col-span-1">
          <Paper className="p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <Typography variant="h6" className="font-bold text-slate-700">Basic Information</Typography>
            <Divider />
            <Stack spacing={3}>
              <TextField
                label="Category Name"
                fullWidth
                size="small"
                value={categoryForm.name}
                disabled={!isSuperAdmin && category?.storeId === null}
                onChange={(e) => setCategoryForm({ 
                  ...categoryForm, 
                  name: e.target.value,
                  slug: slugify(e.target.value)
                })}
              />
              <TextField
                label="Slug"
                fullWidth
                size="small"
                value={categoryForm.slug}
                disabled
                helperText="Slug is auto-generated from name"
              />
            </Stack>
          </Paper>
        </Box>

        {/* Attributes Section */}
        <Box className="lg:col-span-2">
          <Paper className="p-6 border border-slate-200 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="h6" className="font-bold text-slate-700">Category Attributes</Typography>
              {(isSuperAdmin || (category?.storeId && category.storeId === admin?.storeId)) && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAttrDialog()}
                >
                  Add Attribute
                </Button>
              )}
            </div>
            <Divider />
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold text-slate-600">Name</TableCell>
                    <TableCell className="font-semibold text-slate-600">Type</TableCell>
                    <TableCell className="font-semibold text-slate-600">Options</TableCell>
                    {(isSuperAdmin || (category?.storeId && category.storeId === admin?.storeId)) && <TableCell align="right" className="font-semibold text-slate-600">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(!categoryForm.fieldsConfig?.fields || categoryForm.fieldsConfig.fields.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={isSuperAdmin ? 4 : 3} align="center" className="py-8 text-slate-400">
                        No attributes defined for this category.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoryForm.fieldsConfig.fields.map((attr: any, index: number) => (
                      <TableRow key={index} hover>
                        <TableCell className="font-medium text-slate-700">{attr.name}</TableCell>
                        <TableCell>
                          <Chip label={attr.type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {attr.type === 'select' ? (
                            <div className="flex gap-1 flex-wrap max-w-xs">
                              {attr.options?.map((o: string) => <Chip key={o} label={o} size="small" variant="outlined" />)}
                            </div>
                          ) : "-"}
                        </TableCell>
                        {(isSuperAdmin || (category?.storeId && category.storeId === admin?.storeId)) && (
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => handleOpenAttrDialog(attr, index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteAttr(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </div>

      {/* Attribute Dialog */}
      <Dialog open={openAttrDialog} onClose={() => setOpenAttrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAttrIndex !== null ? "Edit Attribute" : "Add Attribute"}</DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
              label="Attribute Name"
              fullWidth
              size="small"
              value={attrForm.name}
              onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })}
              required
          />
          <FormControl fullWidth size="small">
              <InputLabel>Input Type</InputLabel>
              <Select
                  value={attrForm.type}
                  label="Input Type"
                  onChange={(e) => setAttrForm({ ...attrForm, type: e.target.value as any })}
              >
                  <MenuItem value="text">Text (Single Line)</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="select">Select (Dropdown)</MenuItem>
              </Select>
          </FormControl>

          {attrForm.type === "select" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <Typography variant="caption" className="font-bold text-slate-500 uppercase tracking-wider">Dropdown Options</Typography>
              <Stack direction="row" spacing={1}>
                <TextField 
                  size="small" 
                  fullWidth 
                  placeholder="New option..." 
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newOption) {
                        setAttrForm({ ...attrForm, options: [...(attrForm.options || []), newOption] });
                        setNewOption("");
                      }
                    }
                  }}
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    if (newOption) {
                      setAttrForm({ ...attrForm, options: [...(attrForm.options || []), newOption] });
                      setNewOption("");
                    }
                  }}
                >Add</Button>
              </Stack>
              <div className="flex flex-wrap gap-1">
                {attrForm.options?.map((opt: string, i: number) => (
                  <Chip 
                    key={`${opt}-${i}`} 
                    label={opt} 
                    onDelete={() => setAttrForm({ ...attrForm, options: attrForm.options?.filter((o: string) => o !== opt) })} 
                    size="small" 
                  />
                ))}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttrDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAttrSubmit} 
            variant="contained" 
            disabled={!attrForm.name || attrLoading}
          >
            {attrLoading ? <CircularProgress size={20} /> : (editingAttrIndex !== null ? "Update" : "Add Attribute")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
