"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Button,
    Drawer,
    TextField,
    Alert,
    CircularProgress,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
    Collapse,
    Divider,
    Checkbox,
    FormControlLabel,
    Chip,
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
    ExpandMore,
    ChevronRight,
    Close as CloseIcon,
    DeleteOutline,
    AddCircleOutline,
    AccountTree,
    Settings,
} from "@mui/icons-material";
import { categoriesApi, Category } from "@/services/categories.api";

// Reusable labeled input component
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
            sx={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "text.secondary",
                mb: 0.75,
                letterSpacing: "0.01em",
            }}
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
    "&.Mui-disabled": { bgcolor: "#f8fafc", color: "text.disabled" },
};

const selectSx = {
    border: "1.5px solid",
    borderColor: "divider",
    borderRadius: "8px",
    fontSize: "0.875rem",
    bgcolor: "background.paper",
    width: "100%",
    "& .MuiSelect-select": { py: 0.875, px: 1.5 },
    "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(25,118,210,0.1)", borderColor: "primary.main" },
    "&.Mui-disabled": { bgcolor: "#f8fafc" },
};

interface DynamicField {
    name: string;
    type: "text" | "number" | "select" | "checkbox";
    options?: string[]; // Comma separated values for select
    is_variant: boolean;
}

// Tree Item Component
interface CategoryTreeItemProps {
    category: Category;
    level: number;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
    onAddSub: (parentId: string) => void;
}

const CategoryTreeItem = ({ category, level, onEdit, onDelete, onAddSub }: CategoryTreeItemProps) => {
    const [open, setOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <>
            <ListItem
                sx={{
                    pl: level * 4 + 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
                secondaryAction={
                    <Stack direction="row" spacing={1}>
                        <Tooltip title="Add Sub-category">
                            <IconButton size="small" color="primary" onClick={() => onAddSub(category.id!)}>
                                <AddCircleOutline fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                            <IconButton size="small" color="info" onClick={() => onEdit(category)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => onDelete(category.id!)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                }
            >
                <ListItemIcon sx={{ minWidth: 40 }}>
                    {hasChildren ? (
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <ExpandMore /> : <ChevronRight />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 34 }} />
                    )}
                </ListItemIcon>
                <ListItemText 
                    primary={category.name} 
                    secondary={category.slug}
                    primaryTypographyProps={{ fontWeight: level === 0 ? 'bold' : 'medium' }}
                />
            </ListItem>
            {hasChildren && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {category.children!.map((child) => (
                            <CategoryTreeItem 
                                key={child.id} 
                                category={child} 
                                level={level + 1} 
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAddSub={onAddSub}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

export default function ProductCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Dialog States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        parentId: "",
    });
    const [fields, setFields] = useState<DynamicField[]>([]);

    // Tree computation
    const categoryTree = useMemo(() => {
        const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
            return items
                .filter(item => (item.parentId || null) === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id || null)
                }));
        };
        return buildTree(categories);
    }, [categories]);

    // Flat categories for dropdown
    const flatCategories = useMemo(() => {
        return categories.sort((a, b) => a.name.localeCompare(b.name));
    }, [categories]);

    // Inherited fields computation
    const inheritedFields = useMemo(() => {
        if (!formData.parentId) return [];
        
        const parent = categories.find(c => c.id === formData.parentId);
        if (!parent) return [];

        let allInherited: DynamicField[] = [];
        
        // Recursive function to get fields from parents
        const getParentFields = (cat: Category) => {
            const currentFields = Array.isArray(cat.fieldsConfig) ? cat.fieldsConfig : [];
            allInherited = [...currentFields, ...allInherited];
            
            if (cat.parentId) {
                const nextParent = categories.find(c => c.id === cat.parentId);
                if (nextParent) getParentFields(nextParent);
            }
        };

        getParentFields(parent);
        return allInherited;
    }, [formData.parentId, categories]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesApi.getAllCategories();
            setCategories(data || []);
            setError("");
        } catch (err: any) {
            console.error("Failed to fetch categories:", err);
            setError(err.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenDialog = (category?: Category, parentId?: string) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                parentId: category.parentId || "",
            });
            
            // Robustly handle fieldsConfig
            let fieldsConfig = category.fieldsConfig;
            if (typeof fieldsConfig === 'string') {
                try {
                    fieldsConfig = JSON.parse(fieldsConfig);
                } catch (e) {
                    console.error("Failed to parse fieldsConfig:", e);
                    fieldsConfig = [];
                }
            }
            
            // Check if it's already an array or a {fields: []} object
            if (Array.isArray(fieldsConfig)) {
                setFields(fieldsConfig);
            } else if (fieldsConfig && Array.isArray(fieldsConfig.fields)) {
                setFields(fieldsConfig.fields);
            } else {
                setFields([]);
            }
        } else {
            setEditingCategory(null);
            setFormData({ name: "", slug: "", parentId: parentId || "" });
            setFields([]);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setError("");
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData({ ...formData, name, slug });
    };

    // Field Builder Actions
    const addField = () => {
        setFields([...fields, { name: "", type: "text", is_variant: false }]);
    };

    const removeField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const updateField = (index: number, data: Partial<DynamicField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...data };
        setFields(newFields);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.slug) {
            setError("Name and Slug are required");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            
            const payload = {
                ...formData,
                parentId: formData.parentId || null,
                fieldsConfig: { fields: fields } // Match DB format seen in screenshot
            };

            if (editingCategory) {
                await categoriesApi.updateCategory(editingCategory.id!, payload);
            } else {
                await categoriesApi.createCategory(payload);
            }

            handleCloseDialog();
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "Failed to save category");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This will delete all sub-categories too if any.")) return;

        try {
            setLoading(true);
            await categoriesApi.deleteCategory(id);
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "Failed to delete category");
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountTree color="primary" /> Product Categories
                </Typography>
                <Box>
                    <IconButton onClick={fetchCategories} sx={{ mr: 1 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Category
                    </Button>
                </Box>
            </Box>

            {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
                    <List disablePadding>
                        <ListItem sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <AccountTree sx={{ color: 'white' }} />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Category Hierarchy" 
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                            />
                        </ListItem>
                        {categoryTree.length === 0 ? (
                            <ListItem><ListItemText primary="No categories found" sx={{ textAlign: 'center' }} /></ListItem>
                        ) : (
                            categoryTree.map((cat) => (
                                <CategoryTreeItem 
                                    key={cat.id} 
                                    category={cat} 
                                    level={0} 
                                    onEdit={handleOpenDialog}
                                    onDelete={handleDelete}
                                    onAddSub={(pid) => handleOpenDialog(undefined, pid)}
                                />
                            ))
                        )}
                    </List>
                </Paper>
            )}

            {/* Centered Dialog for Add/Edit Category */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "14px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                    },
                }}
            >
                {/* Modal Header */}
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
                    <Box>
                        <Typography fontWeight={700} fontSize="1.0625rem">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {editingCategory
                                ? "Update category details and dynamic fields"
                                : "Fill in the details to create a new category"}
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseDialog}
                        size="small"
                        sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: "8px" }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px" }}>{error}</Alert>}

                    {/* Section A */}
                    <Box sx={{ mb: 1 }}>
                        <Typography
                            fontWeight={700}
                            fontSize="0.75rem"
                            letterSpacing="0.08em"
                            color="text.disabled"
                            textTransform="uppercase"
                            sx={{ mb: 2 }}
                        >
                            Basic Information
                        </Typography>

                        <Stack spacing={2.5}>
                            <LabeledInput label="Category Name" required>
                                <InputBase
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Electronics"
                                    sx={inputSx}
                                />
                            </LabeledInput>

                            <LabeledInput label="Slug" required>
                                <InputBase
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g. electronics"
                                    sx={inputSx}
                                />
                                <Typography fontSize="0.75rem" color="text.disabled" mt={0.5}>
                                    URL friendly identifier — auto-generated from name
                                </Typography>
                            </LabeledInput>

                            <LabeledInput label="Parent Category">
                                <Select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value as string })}
                                    displayEmpty
                                    sx={selectSx}
                                >
                                    <MenuItem value="">
                                        <Typography color="text.disabled" fontSize="0.875rem">
                                            None (Top Level)
                                        </Typography>
                                    </MenuItem>
                                    {flatCategories
                                        .filter((c) => c.id !== editingCategory?.id)
                                        .map((c) => (
                                            <MenuItem key={c.id} value={c.id} sx={{ fontSize: "0.875rem" }}>
                                                {c.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </LabeledInput>
                        </Stack>
                    </Box>

                    {/* Section B */}
                    <Box sx={{ mt: 3.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                            <Typography
                                fontWeight={700}
                                fontSize="0.75rem"
                                letterSpacing="0.08em"
                                color="text.disabled"
                                textTransform="uppercase"
                            >
                                Dynamic Fields
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {fields.length} field{fields.length !== 1 ? "s" : ""}
                            </Typography>
                        </Box>

                        {/* Inherited Fields */}
                        {inheritedFields.length > 0 && (
                            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px dashed grey.300' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                    INHERITED FROM PARENTS:
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {inheritedFields.map((f, i) => (
                                        <Chip 
                                            key={i} 
                                            label={`${f.name} (${f.type})`} 
                                            size="small" 
                                            variant="outlined" 
                                            color="info"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        <Stack spacing={2}>
                            {fields.map((field, index) => (
                                <Paper
                                    key={index}
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        border: "1.5px solid",
                                        borderColor: "divider",
                                        borderRadius: "10px",
                                        bgcolor: "#fafafa",
                                        position: "relative",
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={() => removeField(index)}
                                        sx={{
                                            position: "absolute",
                                            top: 10,
                                            right: 10,
                                            color: "error.main",
                                            "&:hover": { bgcolor: "error.50" },
                                        }}
                                    >
                                        <DeleteOutline sx={{ fontSize: 17 }} />
                                    </IconButton>

                                    <Stack spacing={2} sx={{ pr: 4 }}>
                                        <LabeledInput label="Field Name">
                                            <InputBase
                                                value={field.name}
                                                onChange={(e) => updateField(index, { name: e.target.value })}
                                                placeholder="e.g. Color, Size, Material"
                                                sx={inputSx}
                                            />
                                        </LabeledInput>

                                        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                                            <Box sx={{ flex: 1 }}>
                                                <LabeledInput label="Field Type">
                                                    <Select
                                                        value={field.type}
                                                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                                                        sx={selectSx}
                                                    >
                                                        <MenuItem value="text" sx={{ fontSize: "0.875rem" }}>Text</MenuItem>
                                                        <MenuItem value="number" sx={{ fontSize: "0.875rem" }}>Number</MenuItem>
                                                        <MenuItem value="select" sx={{ fontSize: "0.875rem" }}>Dropdown</MenuItem>
                                                        <MenuItem value="checkbox" sx={{ fontSize: "0.875rem" }}>Checkbox</MenuItem>
                                                    </Select>
                                                </LabeledInput>
                                            </Box>
                                            <Box sx={{ pb: 0.25 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={field.is_variant}
                                                            onChange={(e) => updateField(index, { is_variant: e.target.checked })}
                                                            size="small"
                                                        />
                                                    }
                                                    label={
                                                        <Typography fontSize="0.8125rem" fontWeight={500}>
                                                            Use as Variant
                                                        </Typography>
                                                    }
                                                    sx={{ m: 0 }}
                                                />
                                            </Box>
                                        </Box>

                                        {field.type === "select" && (
                                            <LabeledInput label="Options">
                                                <InputBase
                                                    placeholder="Red, Blue, Green"
                                                    value={field.options?.join(", ") || ""}
                                                    onChange={(e) =>
                                                        updateField(index, {
                                                            options: e.target.value.split(",").map((o) => o.trim()),
                                                        })
                                                    }
                                                    sx={inputSx}
                                                />
                                                <Typography fontSize="0.75rem" color="text.disabled" mt={0.5}>
                                                    Separate each option with a comma
                                                </Typography>
                                            </LabeledInput>
                                        )}
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>

                        <Button
                            startIcon={<AddCircleOutline />}
                            onClick={addField}
                            variant="outlined"
                            fullWidth
                            sx={{
                                mt: fields.length > 0 ? 2 : 0,
                                borderStyle: "dashed",
                                borderRadius: "10px",
                                py: 1.25,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: "primary.main",
                                borderColor: "primary.light",
                                "&:hover": { borderStyle: "dashed", bgcolor: "primary.50" },
                            }}
                        >
                            Add Dynamic Field
                        </Button>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1.5px solid",
                        borderColor: "divider",
                        gap: 1.5,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={handleCloseDialog}
                        disabled={submitting}
                        sx={{
                            flex: 1,
                            textTransform: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            borderColor: "divider",
                            color: "text.primary",
                            "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
                        }}
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
                        {submitting ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : editingCategory ? (
                            "Update Category"
                        ) : (
                            "Save Category"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
