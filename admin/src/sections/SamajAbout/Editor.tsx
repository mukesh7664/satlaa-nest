"use client";

import React from "react";
import {
    Stack,
    TextField,
    Typography,
    Box,
    Divider,
} from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface SamajAboutData {
    title?: string;
    subtitle?: string;
    description?: string;
    logo?: string;
    image1?: string;
    image2?: string;
    phone?: string;
    googlePlayLink?: string;
    readMoreLink?: string;
}

interface SamajAboutEditorProps {
    data: SamajAboutData;
    onChange: (data: SamajAboutData) => void;
}

export const SamajAboutEditor: React.FC<SamajAboutEditorProps> = ({ data, onChange }) => {
    const safeData: SamajAboutData = {
        title: data?.title ?? "A Community of Values, Vision, and Togetherness",
        subtitle: data?.subtitle ?? "Welcome to Get More About Us",
        description: data?.description ?? "",
        logo: data?.logo ?? "",
        image1: data?.image1 ?? "",
        image2: data?.image2 ?? "",
        phone: data?.phone ?? "0141-2623500",
        googlePlayLink: data?.googlePlayLink ?? "",
        readMoreLink: data?.readMoreLink ?? "/about-us",
    };

    const handleChange = (field: keyof SamajAboutData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Hero Content
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Subtitle"
                        fullWidth
                        value={safeData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                    />
                    <TextField
                        label="Main Title"
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
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Logos & Images
                </Typography>
                <Stack spacing={3}>
                    <ShopifyImagePicker
                        label="Section Logo/Emblem"
                        value={safeData.logo}
                        onChange={(url) => handleChange("logo", url)}
                        aspectRatio="3/2"
                        objectFit="contain"
                    />
                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <ShopifyImagePicker
                                label="Left Image (Large)"
                                value={safeData.image1}
                                onChange={(url) => handleChange("image1", url)}
                                aspectRatio="4/5"
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <ShopifyImagePicker
                                label="Right Overlapping Image"
                                value={safeData.image2}
                                onChange={(url) => handleChange("image2", url)}
                                aspectRatio="4/5"
                            />
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Description & Links
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Description (Hindi/English)"
                        fullWidth
                        multiline
                        rows={8}
                        value={safeData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                    <TextField
                        label="Read More Link"
                        fullWidth
                        value={safeData.readMoreLink}
                        onChange={(e) => handleChange("readMoreLink", e.target.value)}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Support Phone Number"
                            fullWidth
                            value={safeData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />
                        <TextField
                            label="Google Play Link"
                            fullWidth
                            value={safeData.googlePlayLink}
                            onChange={(e) => handleChange("googlePlayLink", e.target.value)}
                        />
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
};
