"use client";

import React from "react";
import {
    Stack,
    TextField,
    Typography,
    Box,
    Divider,
    IconButton,
    Button,
    Card,
    CardContent,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";

interface HelpCategory {
    title?: string;
    icon?: string;
    link?: string;
    color?: string;
}

interface SamajHelpData {
    subtitle?: string;
    title?: string;
    categories?: HelpCategory[];
}

interface SamajHelpEditorProps {
    data: SamajHelpData;
    onChange: (data: SamajHelpData) => void;
}

const ICON_OPTIONS = [
    { value: "bhawan", label: "Bhawan (House)" },
    { value: "hostel", label: "Hostel (House)" },
    { value: "medical", label: "Medical (Hospital)" },
    { value: "education", label: "Education (Cap)" },
    { value: "helping", label: "Other (Helping)" },
];

const COLOR_OPTIONS = [
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Yellow" },
    { value: "teal", label: "Teal" },
    { value: "blue", label: "Blue" },
];

export const SamajHelpEditor: React.FC<SamajHelpEditorProps> = ({ data, onChange }) => {
    const safeData: SamajHelpData = {
        subtitle: data?.subtitle ?? "Useful links to update yourself",
        title: data?.title ?? "Some Important and Useful Link for Community",
        categories: data?.categories ?? [
            {
                title: "Maheshwari Bhawan",
                icon: "bhawan",
                color: "orange",
                link: "#"
            }
        ],
    };

    const handleChange = (field: keyof SamajHelpData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleCategoryChange = (index: number, field: keyof HelpCategory, value: any) => {
        const newCategories = [...(safeData.categories || [])];
        newCategories[index] = { ...newCategories[index], [field]: value };
        handleChange("categories", newCategories);
    };

    const addCategory = () => {
        handleChange("categories", [...(safeData.categories || []), { title: "", icon: "helping", color: "orange", link: "#" }]);
    };

    const removeCategory = (index: number) => {
        const newCategories = (safeData.categories || []).filter((_, i) => i !== index);
        handleChange("categories", newCategories);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Header Content
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Subtitle (Red text with lines)"
                        fullWidth
                        value={safeData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                    />
                    <TextField
                        label="Main Title (Centered)"
                        fullWidth
                        multiline
                        rows={2}
                        value={safeData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Help Categories (Circular Icons)
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addCategory}
                        size="small"
                        color="primary"
                    >
                        Add Category
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {(safeData.categories || []).map((cat, index) => (
                        <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                                <IconButton
                                    onClick={() => removeCategory(index)}
                                    color="error"
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                >
                                    <FaTrash size={12} />
                                </IconButton>
                            </Box>
                            <CardContent>
                                <Stack spacing={2}>
                                    <TextField
                                        label="Label (Below Circle)"
                                        fullWidth
                                        size="small"
                                        value={cat.title}
                                        onChange={(e) => handleCategoryChange(index, "title", e.target.value)}
                                    />
                                    <Stack direction="row" spacing={2}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Icon Type</InputLabel>
                                            <Select
                                                value={cat.icon}
                                                label="Icon Type"
                                                onChange={(e) => handleCategoryChange(index, "icon", e.target.value)}
                                            >
                                                {ICON_OPTIONS.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Circle Color</InputLabel>
                                            <Select
                                                value={cat.color}
                                                label="Circle Color"
                                                onChange={(e) => handleCategoryChange(index, "color", e.target.value)}
                                            >
                                                {COLOR_OPTIONS.map(opt => (
                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                    <TextField
                                        label="Link URL"
                                        fullWidth
                                        size="small"
                                        value={cat.link}
                                        onChange={(e) => handleCategoryChange(index, "link", e.target.value)}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};

