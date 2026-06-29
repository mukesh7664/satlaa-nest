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
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    Tooltip,
    Collapse,
    Checkbox,
    FormControlLabel,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
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
    FolderOutlined,
    VisibilityOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { categoriesApi, Category } from "@/services/categories.api";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

interface DynamicField {
    name: string;
    type: "text" | "number" | "select" | "checkbox";
    options?: string[];
    is_variant: boolean;
}

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

// Tree Item Component
interface CategoryTreeItemProps {
    category: Category;
    level: number;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
    onAddSub: (parentId: string) => void;
    onView: (cat: Category) => void;
    isSuperAdmin: boolean;
    currentStoreId?: string | null;
}

const CategoryTreeItem = ({
    category,
    level,
    onEdit,
    onDelete,
    onAddSub,
    onView,
    isSuperAdmin,
    currentStoreId,
}: CategoryTreeItemProps) => {
    const [open, setOpen] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    const isGlobal = !category.storeId || category.storeId === null;
    const canManage = isSuperAdmin || (!isGlobal && category.storeId === currentStoreId);

    return (
        <>
            <ListItem
                sx={{
                    pl: level * 3 + 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    py: 1,
                    "&:hover": { bgcolor: "action.hover" },
                    "&:last-child": { borderBottom: "none" },
                }}
                secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                        {canManage ? (
                            <>
                                <Tooltip title="Add Sub-category">
                                    <IconButton
                                        size="small"
                                        onClick={() => onAddSub(category.id!)}
                                        sx={{ color: "primary.main" }}
                                    >
                                        <AddCircleOutline sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(category)}
                                        sx={{ color: "info.main" }}
                                    >
                                        <EditIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(category.id!)}
                                        sx={{ color: "error.main" }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 17 }} />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip title="View Details">
                                <IconButton
                                    size="small"
                                    onClick={() => onView(category)}
                                    sx={{ color: "text.secondary" }}
                                >
                                    <VisibilityOutlined sx={{ fontSize: 17 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                }
            >
                <ListItemIcon sx={{ minWidth: 36 }}>
                    {hasChildren ? (
                        <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.5 }}>
                            {open ? (
                                <ExpandMore sx={{ fontSize: 18 }} />
                            ) : (
                                <ChevronRight sx={{ fontSize: 18 }} />
                            )}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 28 }} />
                    )}
                </ListItemIcon>
                <ListItemText
                    primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                                sx={{ fontSize: "0.875rem", fontWeight: level === 0 ? 600 : 400 }}
                            >
                                {category.name}
                            </Typography>
                        </Box>
                    }
                    secondary={
                        <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontFamily: "monospace" }}>
                            /{category.slug}
                        </Typography>
                    }
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
                                onView={onView}
                                isSuperAdmin={isSuperAdmin}
                                currentStoreId={currentStoreId}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
};

export default function CategoriesPage() {
    const { admin } = useAppSelector((state) => state.auth);
    const isSuperAdmin = admin?.role === "super_admin";
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const [viewCategory, setViewCategory] = useState<Category | null>(null);
    const handleOpenView = (cat: Category) => setViewCategory(cat);
    const handleCloseView = () => setViewCategory(null);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: "", slug: "", parentId: "" });
    const [fields, setFields] = useState<DynamicField[]>([]);

    const categoryTree = useMemo(() => {
        const filteredList = categories.filter((item) => {
            const isGlobal = !item.storeId || item.storeId === null;
            if (activeTab === 0) return isGlobal;
            if (activeTab === 1) return !isGlobal && item.storeId === admin?.storeId;
            return true;
        });

        const buildTreeFromList = (items: Category[], parentId: string | null = null): Category[] =>
            (parentId === null
                ? items.filter(
                    (item) => !item.parentId || !items.some((parent) => parent.id === item.parentId)
                )
                : items.filter((item) => item.parentId === parentId)
            ).map((item) => ({ ...item, children: buildTreeFromList(items, item.id || null) }));

        return buildTreeFromList(filteredList);
    }, [categories, activeTab, admin?.storeId]);

    const flatCategories = useMemo(
        () => categories.sort((a, b) => a.name.localeCompare(b.name)),
        [categories]
    );

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoriesApi.getAllCategories();
            setCategories(data || []);
            setError("");
        } catch (err: any) {
            setError(err.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleOpenDialog = (category?: Category, parentId?: string) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, slug: category.slug, parentId: category.parentId || "" });
            const fieldsConfig = category.fieldsConfig;
            if (fieldsConfig && Array.isArray(fieldsConfig.fields)) setFields(fieldsConfig.fields);
            else if (Array.isArray(fieldsConfig)) setFields(fieldsConfig);
            else setFields([]);
        } else {
            setEditingCategory(null);
            setFormData({ name: "", slug: "", parentId: parentId || "" });
            setFields([]);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => { setDialogOpen(false); setError(""); };

    const slugify = (text: string) =>
        text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({ ...formData, name, slug: slugify(name) });
    };

    const addField = () => setFields([...fields, { name: "", type: "text", is_variant: false }]);
    const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index));
    const updateField = (index: number, data: Partial<DynamicField>) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...data };
        setFields(newFields);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.slug) { setError("Name and Slug are required"); return; }
        try {
            setSubmitting(true);
            setError("");
            const payload = { ...formData, parentId: formData.parentId || null, fieldsConfig: { fields } };
            if (editingCategory) {
                await categoriesApi.updateCategory(editingCategory.id!, payload);
                toast.success("Category updated successfully");
            } else {
                await categoriesApi.createCategory(payload);
                toast.success("Category created successfully");
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
            setLoading(true);
            await categoriesApi.deleteCategory(id);
            toast.success("Category deleted");
            fetchCategories();
        } catch (err: any) {
            setError(err.message || "Failed to delete category");
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setCategoryToDeleteId(id);
        setDeleteConfirmOpen(true);
    };

    const canEditForm =
        isSuperAdmin ||
        (editingCategory && editingCategory.storeId === admin?.storeId) ||
        !editingCategory;

    return (
        <Box sx={{ p: 3 }}>
            {/* Page Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>

                        Product Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your product category hierarchy and dynamic fields
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

            {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : (
                <Paper
                    sx={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1.5px solid",
                        borderColor: "divider",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    elevation={0}
                >
                    <Box
                        sx={{
                            px: 2.5,
                            py: 1.75,
                            borderBottom: "1.5px solid",
                            borderColor: "divider",
                            bgcolor: "#fafafa",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <Typography fontWeight={600} fontSize="0.9375rem">
                            Category Hierarchy
                        </Typography>
                    </Box>

                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{
                            borderBottom: "1.5px solid",
                            borderColor: "divider",
                            minHeight: 40,
                            "& .MuiTab-root": { minHeight: 40, fontSize: "0.8125rem", fontWeight: 600, textTransform: "none" },
                            "& .MuiTabs-indicator": { height: 2 },
                        }}
                    >
                        <Tab label="Global Categories" />
                        <Tab label="My Store Categories" />
                    </Tabs>

                    {categoryTree.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: "center" }}>
                            <FolderOutlined sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                            <Typography color="text.secondary" fontSize="0.875rem">
                                {activeTab === 0 ? "No global categories found" : "No store categories found"}
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
                            {categoryTree.map((cat) => (
                                <CategoryTreeItem
                                    key={cat.id}
                                    category={cat}
                                    level={0}
                                    onEdit={handleOpenDialog}
                                    onDelete={handleDelete}
                                    onAddSub={(pid) => handleOpenDialog(undefined, pid)}
                                    onView={handleOpenView}
                                    isSuperAdmin={isSuperAdmin}
                                    currentStoreId={admin?.storeId}
                                />
                            ))}
                        </List>
                    )}
                </Paper>
            )}

            {/* Add / Edit Category Dialog */}
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
                                    disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
                                    sx={inputSx}
                                />
                            </LabeledInput>

                            <LabeledInput label="Slug" required>
                                <InputBase
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="e.g. electronics"
                                    disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
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
                                    disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
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
                                    {canEditForm && (
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
                                    )}

                                    <Stack spacing={2} sx={{ pr: 4 }}>
                                        <LabeledInput label="Field Name">
                                            <InputBase
                                                value={field.name}
                                                onChange={(e) => updateField(index, { name: e.target.value })}
                                                placeholder="e.g. Color, Size, Material"
                                                disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
                                                sx={inputSx}
                                            />
                                        </LabeledInput>

                                        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                                            <Box sx={{ flex: 1 }}>
                                                <LabeledInput label="Field Type">
                                                    <Select
                                                        value={field.type}
                                                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                                                        disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
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
                                                            disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
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
                                                    disabled={!!(editingCategory && !isSuperAdmin && !editingCategory.storeId)}
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

                        {canEditForm && (
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
                        )}
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
                    {canEditForm && (
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
                    )}
                </DialogActions>
            </Dialog>

            {/* View Details Dialog (Global / read-only categories) */}
            <Dialog
                open={!!viewCategory}
                onClose={handleCloseView}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden" },
                }}
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
                    <Box>
                        <Typography fontWeight={700} fontSize="1.0625rem">
                            Category Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Read-only — global system category
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleCloseView}
                        size="small"
                        sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: "8px" }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {viewCategory && (() => {
                        const vc = viewCategory;
                        const vcFields: DynamicField[] = Array.isArray(vc.fieldsConfig?.fields)
                            ? vc.fieldsConfig.fields
                            : Array.isArray(vc.fieldsConfig) ? vc.fieldsConfig : [];
                        const parentName = flatCategories.find((c) => c.id === vc.parentId)?.name;
                        return (
                            <>
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

                                <Stack spacing={2} sx={{ mb: 3.5 }}>
                                    {[
                                        { label: "Category Name", value: vc.name },
                                        { label: "Slug", value: vc.slug, mono: true },
                                        { label: "Parent Category", value: parentName || "None (Top Level)" },
                                    ].map(({ label, value, mono }) => (
                                        <Box key={label}>
                                            <Typography
                                                sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary", mb: 0.5 }}
                                            >
                                                {label}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    border: "1.5px solid",
                                                    borderColor: "divider",
                                                    borderRadius: "8px",
                                                    px: 1.5,
                                                    py: 0.875,
                                                    bgcolor: "#f8fafc",
                                                    fontSize: "0.875rem",
                                                    fontFamily: mono ? "monospace" : "inherit",
                                                    color: "text.primary",
                                                }}
                                            >
                                                {value}
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>

                                {vcFields.length > 0 && (
                                    <>
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
                                                {vcFields.length} field{vcFields.length !== 1 ? "s" : ""}
                                            </Typography>
                                        </Box>
                                        <Stack spacing={1.5}>
                                            {vcFields.map((field, i) => (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        border: "1.5px solid",
                                                        borderColor: "divider",
                                                        borderRadius: "10px",
                                                        p: 2,
                                                        bgcolor: "#fafafa",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography fontSize="0.875rem" fontWeight={600}>
                                                            {field.name || <Box component="span" sx={{ color: "text.disabled" }}>Unnamed</Box>}
                                                        </Typography>
                                                        {field.type === "select" && field.options?.length ? (
                                                            <Typography fontSize="0.75rem" color="text.secondary" mt={0.25}>
                                                                Options: {field.options.join(", ")}
                                                            </Typography>
                                                        ) : null}
                                                    </Box>
                                                    <Stack direction="row" spacing={0.75}>
                                                        <Chip
                                                            label={field.type}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: "0.7rem", textTransform: "capitalize", bgcolor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}
                                                        />
                                                        {field.is_variant && (
                                                            <Chip
                                                                label="Variant"
                                                                size="small"
                                                                sx={{ height: 20, fontSize: "0.7rem", bgcolor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: "1.5px solid", borderColor: "divider" }}>
                    <Button
                        variant="outlined"
                        onClick={handleCloseView}
                        fullWidth
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            borderColor: "divider",
                            color: "text.primary",
                            "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationModal
                open={deleteConfirmOpen}
                title="Delete Category"
                message="Are you sure? This will delete all sub-categories too if any."
                confirmLabel="Delete"
                isDestructive
                onConfirm={() => {
                    if (categoryToDeleteId) {
                        executeDelete(categoryToDeleteId);
                    }
                    setDeleteConfirmOpen(false);
                    setCategoryToDeleteId(null);
                }}
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setCategoryToDeleteId(null);
                }}
            />
        </Box>
    );
}
