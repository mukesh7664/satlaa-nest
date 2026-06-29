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
    Chip,
    Button,
    CircularProgress,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    Grid,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { documentationApi, Documentation } from "@/services/documentation.api";

export default function DocumentationPage() {
    const router = useRouter();
    const [docs, setDocs] = useState<Documentation[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination State
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Unique categories from data
    const [categories, setCategories] = useState<string[]>([]);

    const fetchDocs = async () => {
        try {
            setLoading(true);
            const data = await documentationApi.getAll();
            setDocs(data);
            const uniqueCategories = Array.from(new Set(data.map((d: any) => d.category).filter(Boolean))) as string[];
            setCategories(uniqueCategories);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to load documentation");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    // Derived filtered state
    const filteredDocs = docs.filter(doc => {
        const matchCategory = categoryFilter === "all" || doc.category === categoryFilter;
        let matchStatus = true;
        if (statusFilter === "published") matchStatus = doc.isPublished === true;
        if (statusFilter === "draft") matchStatus = doc.isPublished === false;

        return matchCategory && matchStatus;
    });

    const paginatedDocs = filteredDocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await documentationApi.delete(id);
            toast.success("Document deleted");
            fetchDocs();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete document");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Documentation Hub
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/documentation/new')}
                    sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                    Create Guide
                </Button>
            </Box>

            {/* Filter Bar at Top */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                label="Category"
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="all">All Categories</MenuItem>
                                {categories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="all">All Statuses</MenuItem>
                                <MenuItem value="published">Published</MenuItem>
                                <MenuItem value="draft">Draft</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>
            </Paper>

            <TableContainer component={Paper} elevation={1} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Slug</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedDocs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    No guides match your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedDocs.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {doc.title}
                                        </Typography>
                                        {doc.sectionTitle && (
                                            <Typography variant="caption" color="text.secondary">
                                                Section: {doc.sectionTitle}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{doc.category}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            /{doc.slug}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={doc.isPublished ? 'Published' : 'Draft'}
                                            size="small"
                                            color={doc.isPublished ? 'success' : 'default'}
                                            sx={{ fontSize: '0.75rem', height: 24 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                            <IconButton
                                                size="small"
                                                color="info"
                                                onClick={() => router.push(`/documentation/${doc.id}`)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredDocs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Box>
    );
}
