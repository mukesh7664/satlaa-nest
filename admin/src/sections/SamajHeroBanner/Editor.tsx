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

interface SamajHeroBannerData {
    bgImage?: string;
    tagline?: string;
    title?: string;
    subtitle?: string;
    recentNewsLabel?: string;
    recentNewsText?: string;
}

interface SamajHeroBannerEditorProps {
    data: SamajHeroBannerData;
    onChange: (data: SamajHeroBannerData) => void;
}

export const SamajHeroBannerEditor: React.FC<SamajHeroBannerEditorProps> = ({ data, onChange }) => {
    const safeData: SamajHeroBannerData = {
        bgImage: data?.bgImage ?? "",
        tagline: data?.tagline ?? "UNITY, CULTURE, AND PROGRESS TOGETHER",
        title: data?.title ?? "श्री माहेश्वरी समाज, जयपुर",
        subtitle: data?.subtitle ?? "Connecting Hearts, Preserving Culture, And Empowering Generations",
        recentNewsLabel: data?.recentNewsLabel ?? "Recent News",
        recentNewsText: data?.recentNewsText ?? "होली स्नेह मिलन एवं कवि सम्मेलन शनिवार, 28 फरवरी सायं 6 बजे तक्षशिला सभागार, जवाहर नगर में किया जा रहा है। जिसमें आप सपरिवार सादर आमंत्रित हैं।",
    };

    const handleChange = (field: keyof SamajHeroBannerData, value: any) => {
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
                        label="Tagline"
                        fullWidth
                        value={safeData.tagline}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                    />
                    <TextField
                        label="Main Title (Hindi/English)"
                        fullWidth
                        value={safeData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                    />
                    <TextField
                        label="Subtitle"
                        fullWidth
                        multiline
                        rows={2}
                        value={safeData.subtitle}
                        onChange={(e) => handleChange("subtitle", e.target.value)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Background Image
                </Typography>
                <ShopifyImagePicker
                    label="Background Image"
                    value={safeData.bgImage}
                    onChange={(url) => handleChange("bgImage", url)}
                    aspectRatio="16/9"
                />
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Recent News Ticker
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="News Label"
                        fullWidth
                        value={safeData.recentNewsLabel}
                        onChange={(e) => handleChange("recentNewsLabel", e.target.value)}
                    />
                    <TextField
                        label="News Content"
                        fullWidth
                        multiline
                        rows={3}
                        value={safeData.recentNewsText}
                        onChange={(e) => handleChange("recentNewsText", e.target.value)}
                    />
                </Stack>
            </Box>
        </Stack>
    );
};
