"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    CircularProgress,
    Autocomplete
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { documentationApi } from "@/services/documentation.api";
import dynamic from 'next/dynamic';

const CKEditorWrapper = dynamic(() => import('@/components/CKEditorWrapper'), { ssr: false });

export default function EditDocumentationPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const docs = await documentationApi.getAll();
                const uniqueCategories = Array.from(new Set(docs.map((d: any) => d.category).filter(Boolean)));
                setCategories(uniqueCategories);
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);
    
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        sectionTitle: "",
        content: "",
        order: 0,
        isPublished: true
    });

    useEffect(() => {
        if (!id) return;
        const fetchDoc = async () => {
            try {
                const doc = await documentationApi.getById(id);
                setFormData({
                    title: doc.title || "",
                    category: doc.category || "",
                    sectionTitle: doc.sectionTitle || "",
                    content: doc.content || "",
                    order: doc.order || 0,
                    isPublished: doc.isPublished ?? true
                });
            } catch (error) {
                toast.error("Failed to load document");
                router.push("/documentation");
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isPublished: e.target.checked }));
    };

    const handleCustomChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.category || !formData.content) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setSubmitting(true);
            await documentationApi.update(id, formData);
            toast.success("Documentation updated successfully");
            router.push('/documentation');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update documentation");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box maxWidth="xl" mx="auto">
            <Box display="flex" alignItems="center" mb={3} gap={2}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => router.push('/documentation')}
                    color="inherit"
                >
                    Back
                </Button>
                <Typography variant="h4" fontWeight="bold">
                    Edit Guide
                </Typography>
            </Box>

            <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                        <Box flex={2}>
                            <TextField
                                fullWidth
                                required
                                label="Document Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Getting Started with APIs"
                                sx={{ mb: 3 }}
                            />
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" mb={1} color="text.secondary">
                                    Content Editor *
                                </Typography>
                                <Box sx={{ minHeight: '400px', '.ck-editor__editable_inline': { minHeight: '400px' }}}>
                                    <CKEditorWrapper 
                                        value={formData.content}
                                        onChange={(data) => handleCustomChange('content', data)}
                                        placeholder="Start writing the documentation here..."
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box flex={1}>
                            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'slate.50' }}>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Organization
                                </Typography>
                                
                                <Autocomplete
                                    freeSolo
                                    options={categories}
                                    value={formData.category}
                                    onChange={(event, newValue) => {
                                        handleCustomChange('category', newValue || '');
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        handleCustomChange('category', newInputValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Category"
                                            name="category"
                                            placeholder="e.g. Developer Docs"
                                            helperText="Used to group docs in the sidebar"
                                            sx={{ mb: 3 }}
                                        />
                                    )}
                                />

                                <TextField
                                    fullWidth
                                    label="Section Title (Optional)"
                                    name="sectionTitle"
                                    value={formData.sectionTitle}
                                    onChange={handleChange}
                                    placeholder="e.g. Authentication"
                                    helperText="Groups within the same Category"
                                    sx={{ mb: 3 }}
                                />

                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Display Order"
                                    name="order"
                                    value={formData.order}
                                    onChange={(e) => handleCustomChange('order', Number(e.target.value))}
                                    inputProps={{ min: 0 }}
                                    sx={{ mb: 3 }}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch 
                                            name="isPublished" 
                                            checked={formData.isPublished}
                                            onChange={handleToggle}
                                            color="primary"
                                        />
                                    }
                                    label="Publish immediately"
                                />
                            </Paper>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                disabled={submitting}
                                startIcon={submitting && <CircularProgress size={20} color="inherit" />}
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
