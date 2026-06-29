"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Stack,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Tooltip,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    Tabs,
    Tab,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CloudUpload as CloudUploadIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { sectionApi, ISectionType as ISection } from "@/services/section.api";
import MediaPickerModal from "@/components/MediaPickerModal";
import SectionDialog, { SECTION_TYPES } from "@/app/(store-admin)/sections/SectionDialog";

export default function SectionLibraryPage() {
    const [sections, setSections] = useState<ISection[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [filterType, setFilterType] = useState("All");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active'
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<ISection | null>(null);
    const [category, setCategory] = useState("All");
    const [selectedScope, setSelectedScope] = useState("All");

    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Preview Image States
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [sectionForUpload, setSectionForUpload] = useState<ISection | null>(
        null
    );
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [response, tagsData] = await Promise.all([
                sectionApi.getAll({
                    search,
                    tags: selectedTag,
                    includeInactive: statusFilter === "all",
                    type: filterType === "All" ? "" : filterType,
                    category: category === "All" ? "" : category.toLowerCase(),
                    scope: selectedScope === "All" ? "" : selectedScope,
                    exact: selectedScope === "All" ? undefined : true,
                    page: page + 1,
                    limit: rowsPerPage,
                }),
                sectionApi.getTags(),
            ]);
            setSections(response.data);
            setTotalItems(response.total);
            setTags(tagsData);
        } catch (error) {
            console.error("Failed to fetch library sections:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        setPage(0); // Reset to first page on filter change
    }, [search, selectedTag, filterType, statusFilter, category, selectedScope]);

    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage, search, selectedTag, filterType, statusFilter, category, selectedScope]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this section template? This will remove it from the global library.")) {
            try {
                await sectionApi.delete(id);
                fetchData();
            } catch (error) {
                console.error("Failed to delete section:", error);
            }
        }
    };

    const handleUploadClick = (section: ISection) => {
        setSectionForUpload(section);
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = async (file: any) => {
        const url = file.url;
        if (sectionForUpload) {
            try {
                await sectionApi.update(sectionForUpload._id || sectionForUpload.id, {
                    ...sectionForUpload,
                    thumbnail: url,
                    tags: sectionForUpload.tags ?? undefined,
                });
                setMediaPickerOpen(false);
                setSectionForUpload(null);
                fetchData();
            } catch (error) {
                console.error("Failed to update section thumbnail:", error);
            }
        }
    };

    const handleViewClick = (thumbnail: string) => {
        setPreviewImage(thumbnail);
        setPreviewDialogOpen(true);
    };

    const handleToggleStatus = async (section: ISection) => {
        try {
            await sectionApi.update(section._id || section.id, {
                isActive: !section.isActive,
            });
            fetchData();
        } catch (error) {
            console.error("Failed to update section status:", error);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
            >
                <Typography variant="h4" fontWeight="bold">Global Section Library</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedSection(null);
                        setDialogOpen(true);
                    }}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                    Add New Template
                </Button>
            </Stack>

            <Paper sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                <Tabs
                    value={category}
                    onChange={(e, newValue) => setCategory(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ px: 2 }}
                >
                    <Tab label="All Sections" value="All" />
                    <Tab label="Headers" value="header" />
                    <Tab label="Footers" value="footer" />
                    <Tab label="Page Sections" value="section" />
                </Tabs>
            </Paper>

            <Paper sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="active">Active Only</MenuItem>
                            <MenuItem value="all">Show All</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Scope</InputLabel>
                        <Select
                            value={selectedScope}
                            label="Scope"
                            onChange={(e) => setSelectedScope(e.target.value)}
                        >
                            <MenuItem value="All">All Scopes</MenuItem>
                            <MenuItem value="page-builder">Page Builder</MenuItem>
                            <MenuItem value="ecommerce">Ecommerce</MenuItem>
                            <MenuItem value="both">Both</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Refresh Data">
                        <IconButton onClick={fetchData} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.light' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type / Key</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Scope</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Preview</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                    <Typography sx={{ mt: 1 }}>Loading library...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : sections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No section templates found in the library.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sections.map((section) => (
                                <TableRow key={section._id || section.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">{section.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{section.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={section.type} size="small" color="primary" variant="outlined" sx={{ mb: 0.5 }} />
                                        <br />
                                        <Typography variant="caption" color="text.secondary">{section.type}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={section.category || 'section'} size="small" color="info" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={
                                                section.scope === "ecommerce"
                                                    ? "E-commerce"
                                                    : section.scope === "page-builder"
                                                    ? "Page Builder"
                                                    : "Both"
                                            }
                                            size="small"
                                            color={
                                                section.scope === "ecommerce"
                                                    ? "primary"
                                                    : section.scope === "page-builder"
                                                    ? "secondary"
                                                    : "default"
                                            }
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {section.tags?.map((tag) => (
                                                <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )) || <Typography variant="caption" color="text.secondary">-</Typography>}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Switch
                                                size="small"
                                                checked={section.isActive}
                                                onChange={() => handleToggleStatus(section)}
                                            />
                                            <Chip
                                                label={section.isActive ? "Active" : "Inactive"}
                                                color={section.isActive ? "success" : "default"}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Upload Preview Image">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleUploadClick(section)}
                                                >
                                                    <CloudUploadIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="View Preview">
                                                <Box component="span">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        disabled={!section.thumbnail}
                                                        onClick={() =>
                                                            section.thumbnail &&
                                                            handleViewClick(section.thumbnail)
                                                        }
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Box>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                            <IconButton
                                                size="small"
                                                color="secondary"
                                                onClick={() => {
                                                    setSelectedSection(section);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(section._id || section.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={totalItems}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
                />
            </TableContainer>

            <SectionDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                section={selectedSection}
                onSave={fetchData}
            />

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                title="Select Preview Image"
            />

            <Dialog
                open={previewDialogOpen}
                onClose={() => setPreviewDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    Section Template Preview
                    <IconButton onClick={() => setPreviewDialogOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {previewImage ? (
                        <Box
                            component="img"
                            src={previewImage}
                            alt="Section Preview"
                            sx={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "70vh",
                                objectFit: "contain",
                                display: "block",
                                mx: "auto",
                                borderRadius: 1,
                                boxShadow: 1,
                            }}
                        />
                    ) : (
                        <Box sx={{ py: 10, textAlign: 'center' }}>
                            <Typography color="text.secondary">No preview image available</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
