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

interface AccordionItem {
    title: string;
    description: string;
}

interface QuickAboutData {
    topTitle?: string;
    mainTitle?: string;
    subTitle?: string;
    image?: string;
    accordionItems?: AccordionItem[];
    buttonText?: string;
    buttonLink?: string;
}

interface QuickAboutEditorProps {
    data: QuickAboutData;
    onChange: (data: QuickAboutData) => void;
}

export const QuickAboutEditor: React.FC<QuickAboutEditorProps> = ({ data, onChange }) => {
    const safeData: QuickAboutData = {
        topTitle: data?.topTitle || "More about the Events",
        mainTitle: data?.mainTitle || "अखिल भारतवर्षीय माहेश्वरी महासभा",
        subTitle: data?.subTitle || "माहेश्वरी महाकुंभ का आगाज़ 2026",
        image: data?.image || "",
        accordionItems: data?.accordionItems || [
            { title: "कार्यक्रम की तिथि और स्थान", description: "" },
            { title: "उद्घाटन सत्र एजेंडा", description: "" },
            { title: "महासभा की बैठक प्रारंभ", description: "" }
        ],
        buttonText: data?.buttonText || "READ MORE",
        buttonLink: data?.buttonLink || "#",
    };

    const handleChange = (field: keyof QuickAboutData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleAccordionChange = (index: number, field: keyof AccordionItem, value: any) => {
        const newItems = [...(safeData.accordionItems || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange("accordionItems", newItems);
    };

    const addAccordionItem = () => {
        handleChange("accordionItems", [...(safeData.accordionItems || []), { title: "", description: "" }]);
    };

    const removeAccordionItem = (index: number) => {
        const newItems = (safeData.accordionItems || []).filter((_, i) => i !== index);
        handleChange("accordionItems", newItems);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Main Content
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Top Title (Small)"
                        fullWidth
                        size="small"
                        value={safeData.topTitle}
                        onChange={(e) => handleChange("topTitle", e.target.value)}
                    />
                    <TextField
                        label="Main Title (Large)"
                        fullWidth
                        size="small"
                        value={safeData.mainTitle}
                        onChange={(e) => handleChange("mainTitle", e.target.value)}
                    />
                    <TextField
                        label="Sub Title (Red)"
                        fullWidth
                        size="small"
                        value={safeData.subTitle}
                        onChange={(e) => handleChange("subTitle", e.target.value)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Section Image
                </Typography>
                <ShopifyImagePicker
                    label="Image"
                    value={safeData.image}
                    onChange={(url) => handleChange("image", url)}
                    aspectRatio="4/5"
                />
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Accordion Items
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addAccordionItem}
                        size="small"
                        color="primary"
                    >
                        Add Item
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {(safeData.accordionItems || []).map((item, index) => (
                        <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                                <IconButton
                                    onClick={() => removeAccordionItem(index)}
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
                                        label={`Item ${index + 1} Title`}
                                        fullWidth
                                        size="small"
                                        value={item.title}
                                        onChange={(e) => handleAccordionChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label={`Item ${index + 1} Description`}
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={3}
                                        value={item.description}
                                        onChange={(e) => handleAccordionChange(index, "description", e.target.value)}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Button Settings
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Button Text"
                        fullWidth
                        size="small"
                        value={safeData.buttonText}
                        onChange={(e) => handleChange("buttonText", e.target.value)}
                    />
                    <TextField
                        label="Button Link"
                        fullWidth
                        size="small"
                        value={safeData.buttonLink}
                        onChange={(e) => handleChange("buttonLink", e.target.value)}
                    />
                </Stack>
            </Box>
        </Stack>
    );
};
