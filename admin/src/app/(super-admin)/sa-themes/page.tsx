"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    Avatar,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import { themesApi } from "@/services/themes.api";
import { toast } from "sonner";
import ImageUploader from "@/components/ImageUploader";

interface Theme {
    id: string;
    name: string;
    description: string;
    previewImage: string;
    isActive: boolean;
    category: string;
    content: any;
    createdAt: string;
}

export default function SuperAdminThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        previewImage: "",
        category: "ecommerce",
        isActive: true,
        contentJson: "", // We'll store stringified JSON here for the textarea
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            setLoading(true);
            const data = await themesApi.getAll(true); // includeInactive = true
            setThemes(data || []);
        } catch (err) {
            console.error("Failed to fetch themes:", err);
            toast.error("Failed to load themes.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (theme?: Theme) => {
        if (theme) {
            setEditingTheme(theme);
            setFormData({
                name: theme.name,
                description: theme.description || "",
                previewImage: theme.previewImage || "",
                category: theme.category || "ecommerce",
                isActive: theme.isActive,
                contentJson: JSON.stringify(theme.content, null, 2),
            });
        } else {
            setEditingTheme(null);
            setFormData({
                name: "",
                description: "",
                previewImage: "",
                category: "ecommerce",
                isActive: true,
                contentJson: JSON.stringify({
                    sections: [],
                    header: [],
                    footer: [],
                    settings: { themeColors: { primary: "#000000", secondary: "#ffffff" } }
                }, null, 2),
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.contentJson) {
                setError("Name and Content JSON are required.");
                return;
            }

            let parsedContent;
            try {
                parsedContent = JSON.parse(formData.contentJson);
            } catch (e) {
                setError("Invalid JSON in content field.");
                return;
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                previewImage: formData.previewImage,
                category: formData.category,
                isActive: formData.isActive,
                content: parsedContent,
            };

            if (editingTheme) {
                await themesApi.update(editingTheme.id, payload);
                toast.success("Theme updated successfully");
            } else {
                await themesApi.create(payload);
                toast.success("Theme created successfully");
            }
            fetchThemes();
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to save theme.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this theme?")) {
            try {
                await themesApi.delete(id);
                toast.success("Theme deleted");
                fetchThemes();
            } catch (err: any) {
                console.error("Delete failed:", err);
                toast.error(err.message || "Failed to delete theme.");
            }
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Theme Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ borderRadius: '12px', px: 3 }}
                >
                    Create New Theme
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Preview</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {themes.map((theme) => (
                            <TableRow key={theme.id} hover>
                                <TableCell>
                                    <Avatar 
                                        variant="rounded" 
                                        src={theme.previewImage} 
                                        sx={{ width: 60, height: 40, border: '1px solid', borderColor: 'divider' }}
                                    >
                                        T
                                    </Avatar>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{theme.name}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                        theme.category === 'page_builder' 
                                            ? 'bg-purple-100 text-purple-700' 
                                            : 'bg-green-100 text-green-700'
                                    }`}>
                                        {theme.category === 'page_builder' ? 'Page Builder' : 'Ecommerce'}
                                    </span>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {theme.description}
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={theme.isActive}
                                        onChange={async () => {
                                            await themesApi.update(theme.id, { isActive: !theme.isActive });
                                            fetchThemes();
                                        }}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(theme.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(theme)} color="primary">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(theme.id)} color="error">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
                <DialogTitle>{editingTheme ? "Edit Theme" : "Create New Theme"}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                        <TextField
                            label="Theme Name"
                            fullWidth
                            size="small"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <TextField
                            label="Theme Type / Category"
                            fullWidth
                            size="small"
                            select
                            SelectProps={{ native: true }}
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="ecommerce">Ecommerce Theme</option>
                            <option value="page_builder">Page Builder Theme</option>
                        </TextField>
                        
                        <ImageUploader
                            label="Theme Preview Image"
                            value={formData.previewImage}
                            onChange={(url) => setFormData({ ...formData, previewImage: url })}
                            folder="themes"
                            isGlobal={true}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: -2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Theme Content (JSON Blueprint)</Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Upload JSON File
                                <input
                                    type="file"
                                    hidden
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                try {
                                                    const json = JSON.parse(event.target?.result as string);
                                                    let normalizedContent = json;
                                                    
                                                    // Normalize if it's a full store export from standard admin
                                                    if (json.themeType === "full-store-export") {
                                                        normalizedContent = {
                                                            header: json.global?.header || [],
                                                            footer: json.global?.footer || [],
                                                            pages: json.pages || [],
                                                            settings: json.settings || { 
                                                                themeColors: { primary: "#000000", secondary: "#ffffff" } 
                                                            }
                                                        };
                                                        
                                                        // Auto-fill name if it was empty
                                                        if (!formData.name) {
                                                            setFormData(prev => ({ ...prev, name: json.name || "New Theme from Export" }));
                                                        }
                                                    }

                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        contentJson: JSON.stringify(normalizedContent, null, 2) 
                                                    }));
                                                    toast.success("JSON file loaded and normalized successfully");
                                                } catch (err) {
                                                    toast.error("Invalid JSON file");
                                                }
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                        <TextField
                            label="Blueprint JSON"
                            fullWidth
                            multiline
                            rows={10}
                            size="small"
                            placeholder="{ 'sections': [...] }"
                            value={formData.contentJson}
                            onChange={(e) => setFormData({ ...formData, contentJson: e.target.value })}
                            sx={{ fontFamily: 'monospace' }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Theme Active (Available in Marketplace)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ borderRadius: '12px', px: 4 }}
                    >
                        Save Theme
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
