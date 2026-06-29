"use client";
import React, { useState, useEffect } from "react";
import {
    Button,
    IconButton,
    Tabs,
    Tab,
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Chip,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    Search as SearchIcon,
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    HelpOutline as HelpIcon,
    PlayCircleOutline as VideoIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { supportApi, HelpResource } from "@/services/support.api";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`help-cms-tabpanel-${index}`}
            aria-labelledby={`help-cms-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function HelpCenterCMSPage() {
    const [tabValue, setTabValue] = useState(0);

    // Resources State
    const [resources, setResources] = useState<HelpResource[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Form Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<HelpResource | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: "faq" as "faq" | "video",
        title: "",
        category: "Getting Started",
        content: "",
        videoUrl: "",
        thumbnailUrl: "",
        order: 1,
        isPublished: true,
    });

    // Delete Confirmation State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<HelpResource | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Load resources when tab changes
    useEffect(() => {
        fetchResources();
    }, [tabValue]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const type = tabValue === 0 ? "faq" : "video";
            const data = await supportApi.getAdminHelpResources(type);
            setResources(data);
        } catch (error) {
            console.error("Error loading resources:", error);
            toast.error("Failed to load resources");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingResource(null);
        setFormData({
            type: tabValue === 0 ? "faq" : "video",
            title: "",
            category: "Getting Started",
            content: "",
            videoUrl: "",
            thumbnailUrl: "",
            order: resources.length + 1,
            isPublished: true,
        });
        setModalOpen(true);
    };

    const handleOpenEditModal = (res: HelpResource) => {
        setEditingResource(res);
        setFormData({
            type: res.type,
            title: res.title,
            category: res.category,
            content: res.content,
            videoUrl: res.videoUrl || "",
            thumbnailUrl: res.thumbnailUrl || "",
            order: res.order,
            isPublished: res.isPublished,
        });
        setModalOpen(true);
    };

    const handleSaveResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (formData.type === "video" && !formData.videoUrl.trim()) {
            toast.error("Video URL is required for video tutorials.");
            return;
        }

        try {
            setSubmitting(true);
            const payload: Partial<HelpResource> = {
                ...formData,
                order: Number(formData.order),
            };

            if (editingResource) {
                await supportApi.updateHelpResource(editingResource.id, payload);
                toast.success("Resource updated successfully!");
            } else {
                await supportApi.createHelpResource(payload);
                toast.success("Resource created successfully!");
            }
            setModalOpen(false);
            fetchResources();
        } catch (error) {
            console.error("Error saving resource:", error);
            toast.error("Failed to save resource.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenDeleteConfirm = (res: HelpResource) => {
        setResourceToDelete(res);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteResource = async () => {
        if (!resourceToDelete) return;
        try {
            setDeleting(true);
            await supportApi.deleteHelpResource(resourceToDelete.id);
            toast.success("Resource deleted successfully!");
            setDeleteConfirmOpen(false);
            setResourceToDelete(null);
            fetchResources();
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast.error("Failed to delete resource.");
        } finally {
            setDeleting(false);
        }
    };

    // Filter resources locally
    const filteredResources = resources.filter((res) => {
        const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
        const matchesSearch =
            res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];

    return (
        <div className="space-y-6 font-sans">
            {/* Header section */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-gray-100 bg-white p-4 rounded-xl shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Help Center CMS</h1>
                    <p className="text-xs text-slate-500">Manage FAQs and Video Tutorials displayed to store merchants.</p>
                </div>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                    sx={{
                        bgcolor: "var(--primary)",
                        "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                        textTransform: "none",
                        fontWeight: "bold",
                        borderRadius: "8px",
                        height: "36px",
                    }}
                >
                    Add {tabValue === 0 ? "FAQ" : "Video"}
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <Tabs
                    value={tabValue}
                    onChange={(e, val) => {
                        setTabValue(val);
                        setSelectedCategory("All");
                        setSearchTerm("");
                    }}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab
                        icon={<HelpIcon fontSize="small" />}
                        iconPosition="start"
                        label="Manage FAQs"
                        sx={{ textTransform: "none", fontWeight: "600", fontSize: "14px" }}
                    />
                    <Tab
                        icon={<VideoIcon fontSize="small" />}
                        iconPosition="start"
                        label="Manage Video Tutorials"
                        sx={{ textTransform: "none", fontWeight: "600", fontSize: "14px" }}
                    />
                </Tabs>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                <TextField
                    placeholder={`Search ${tabValue === 0 ? "FAQs" : "Videos"}...`}
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        width: { xs: "100%", sm: 300 },
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            height: "38px",
                            fontSize: "13px",
                            backgroundColor: "#ffffff",
                        }
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon className="text-slate-400 mr-1.5" fontSize="small" />
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        sx={{
                            borderRadius: "8px",
                            height: "38px",
                            fontSize: "13px",
                            bgcolor: "#ffffff"
                        }}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat} sx={{ fontSize: "13px" }}>
                                {cat === "All" ? "All Categories" : cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {/* Content Table Area */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <CircularProgress />
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                    {tabValue === 0 ? (
                        <HelpIcon sx={{ fontSize: 48 }} className="text-slate-300 mb-2" />
                    ) : (
                        <VideoIcon sx={{ fontSize: 48 }} className="text-slate-300 mb-2" />
                    )}
                    <p className="text-slate-500 font-semibold">No resources found.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <TableContainer sx={{ boxShadow: "none" }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                    <TableCell sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Order</span></TableCell>
                                    <TableCell sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Title</span></TableCell>
                                    <TableCell sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Category</span></TableCell>
                                    {tabValue === 1 && (
                                        <TableCell sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Video Link</span></TableCell>
                                    )}
                                    <TableCell sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Status</span></TableCell>
                                    <TableCell align="center" sx={{ py: 1.5 }}><span className="text-[10px] uppercase font-bold text-slate-500">Actions</span></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredResources.map((res) => (
                                    <TableRow key={res.id} hover>
                                        <TableCell sx={{ py: 1.5, fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                                            {res.order}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: "12px", fontWeight: "700", color: "#1e293b", maxWidth: "250px" }} className="truncate">
                                            {res.title}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5, fontSize: "12px", color: "#475569" }}>
                                            {res.category}
                                        </TableCell>
                                        {tabValue === 1 && (
                                            <TableCell sx={{ py: 1.5, fontSize: "11px", color: "#2563eb", maxWidth: "200px" }} className="truncate">
                                                <a href={res.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {res.videoUrl}
                                                </a>
                                            </TableCell>
                                        )}
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Chip
                                                label={res.isPublished ? "Published" : "Draft"}
                                                size="small"
                                                color={res.isPublished ? "success" : "default"}
                                                variant="outlined"
                                                sx={{ height: "20px", fontSize: "10px", fontWeight: "bold" }}
                                            />
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 1.5 }}>
                                            <div className="flex items-center justify-center gap-1">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenEditModal(res)}
                                                >
                                                    <EditIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenDeleteConfirm(res)}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}

            {/* CREATE / EDIT DIALOG */}
            <Dialog
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
            >
                <form onSubmit={handleSaveResource}>
                    <DialogTitle className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-base font-bold text-slate-800">
                            {editingResource ? "Edit Resource" : `Add New ${tabValue === 0 ? "FAQ" : "Video Tutorial"}`}
                        </span>
                        <IconButton size="small" onClick={() => setModalOpen(false)} disabled={submitting}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="space-y-4 pt-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 block">Title *</label>
                            <TextField
                                placeholder={formData.type === "faq" ? "e.g. How do I configure payment gateways?" : "e.g. Dashboard walkthrough"}
                                required
                                fullWidth
                                size="small"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-600 block">Category *</label>
                                <TextField
                                    placeholder="e.g. Settings, General, Products"
                                    required
                                    fullWidth
                                    size="small"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                />
                            </div>

                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-bold text-slate-600 block">Display Order *</label>
                                <TextField
                                    type="number"
                                    required
                                    fullWidth
                                    size="small"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                    slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                />
                            </div>
                        </div>

                        {formData.type === "video" && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 block">Video URL *</label>
                                    <TextField
                                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                                        required
                                        fullWidth
                                        size="small"
                                        value={formData.videoUrl}
                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 block">Thumbnail Image URL (Optional)</label>
                                    <TextField
                                        placeholder="e.g. https://img.youtube.com/vi/.../hqdefault.jpg"
                                        fullWidth
                                        size="small"
                                        value={formData.thumbnailUrl}
                                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                        slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 block">
                                {formData.type === "faq" ? "Content (Supports HTML) *" : "Description *"}
                            </label>
                            <TextField
                                placeholder={formData.type === "faq" ? "Write the answer/tutorial instructions here..." : "Short description of what the video tutorial covers..."}
                                required
                                fullWidth
                                multiline
                                rows={formData.type === "faq" ? 8 : 4}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </div>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                />
                            }
                            label={<span className="text-xs font-semibold text-slate-600">Publish Resource (merchants can see it immediately)</span>}
                        />
                    </DialogContent>
                    <DialogActions className="p-4 border-t border-slate-100">
                        <Button onClick={() => setModalOpen(false)} disabled={submitting} className="text-slate-500 text-xs font-bold">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            sx={{
                                bgcolor: "var(--primary)",
                                "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: "bold",
                                px: 4,
                                height: "36px",
                                fontSize: "12px",
                            }}
                        >
                            {submitting ? "Saving..." : "Save Resource"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => !deleting && setDeleteConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "12px", p: 1 } } }}
            >
                <DialogTitle className="pb-1 font-bold text-slate-800 text-base">Delete Resource?</DialogTitle>
                <DialogContent>
                    <Typography className="text-slate-600 text-xs leading-relaxed">
                        Are you sure you want to delete this help resource? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions className="p-3">
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} className="text-slate-500 text-xs font-bold">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        disabled={deleting}
                        onClick={handleDeleteResource}
                        sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "bold", fontSize: "12px" }}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
