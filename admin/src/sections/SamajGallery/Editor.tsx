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
} from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface GalleryItem {
    image?: string;
    title?: string;
    description?: string;
    date?: string;
    author?: string;
    pdfLink?: string;
}

interface SamajGalleryData {
    sectionLabel?: string;
    sectionTitle?: string;
    items?: GalleryItem[];
}

interface SamajGalleryEditorProps {
    data: SamajGalleryData;
    onChange: (data: SamajGalleryData) => void;
}

export const SamajGalleryEditor: React.FC<SamajGalleryEditorProps> = ({ data, onChange }) => {
    const safeData: SamajGalleryData = {
        sectionLabel: data?.sectionLabel ?? "All support them",
        sectionTitle: data?.sectionTitle ?? "Pradesh Events",
        items: data?.items ?? [
            {
                image: "",
                title: "अखिल भारतीयवर्षीय माहेश्वरी महासभा की षष्टम कार्यसमिति बैठक",
                description: "सादर अभिवादन... अखिल भारतीयवर्षीय माहेश्वरी महासभा के 30वें सत्र की षष्टम कार्यसमिति बैठक महाराष्ट्र प्रदेश माहेश्वरी सभा एवं भायन्दर जिला माहेश्वरी सभा के आतिथ्य में दिनांक 23",
                date: "March 6, 2025",
                author: "Admin",
                pdfLink: "#",
            }
        ],
    };

    const handleChange = (field: keyof SamajGalleryData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleItemChange = (index: number, field: keyof GalleryItem, value: any) => {
        const newItems = [...(safeData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange("items", newItems);
    };

    const addItem = () => {
        handleChange("items", [...(safeData.items || []), {
            image: "",
            title: "",
            description: "",
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            author: "Admin",
            pdfLink: ""
        }]);
    };

    const removeItem = (index: number) => {
        const newItems = (safeData.items || []).filter((_, i) => i !== index);
        handleChange("items", newItems);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Header Content
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Section Label"
                        fullWidth
                        value={safeData.sectionLabel}
                        onChange={(e) => handleChange("sectionLabel", e.target.value)}
                    />
                    <TextField
                        label="Section Title"
                        fullWidth
                        value={safeData.sectionTitle}
                        onChange={(e) => handleChange("sectionTitle", e.target.value)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Gallery Slider Items
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addItem}
                        size="small"
                        color="primary"
                    >
                        Add Slide
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {(safeData.items || []).map((item, index) => (
                        <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                                <IconButton
                                    onClick={() => removeItem(index)}
                                    color="error"
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                >
                                    <FaTrash size={12} />
                                </IconButton>
                            </Box>
                            <CardContent>
                                <Stack spacing={2}>
                                    <ShopifyImagePicker
                                        label={`Slide ${index + 1} Image`}
                                        value={item.image}
                                        onChange={(url) => handleItemChange(index, "image", url)}
                                        aspectRatio="16/9"
                                    />
                                    <TextField
                                        label="Title (Hindi/English)"
                                        fullWidth
                                        size="small"
                                        value={item.title}
                                        onChange={(e) => handleItemChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={3}
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                    />
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Date"
                                            fullWidth
                                            size="small"
                                            value={item.date}
                                            onChange={(e) => handleItemChange(index, "date", e.target.value)}
                                        />
                                        <TextField
                                            label="Author"
                                            fullWidth
                                            size="small"
                                            value={item.author}
                                            onChange={(e) => handleItemChange(index, "author", e.target.value)}
                                        />
                                    </Stack>
                                    <TextField
                                        label="PDF Download Link"
                                        fullWidth
                                        size="small"
                                        value={item.pdfLink}
                                        onChange={(e) => handleItemChange(index, "pdfLink", e.target.value)}
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
