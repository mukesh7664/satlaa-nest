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

interface Slide {
    image: string;
    title: string;
    description: string;
    link?: string;
}

interface SamajAboutHeroData {
    slides?: Slide[];
    autoPlayInterval?: number;
}

interface SamajAboutHeroEditorProps {
    data: SamajAboutHeroData;
    onChange: (data: SamajAboutHeroData) => void;
}

export const SamajAboutHeroEditor: React.FC<SamajAboutHeroEditorProps> = ({ data, onChange }) => {
    const safeData: SamajAboutHeroData = {
        slides: data?.slides || [
            {
                image: "",
                title: "शौर्य भवन, अयोध्या",
                description: "भगवान श्री राम की अयोध्या नगरी में सर्वसुविधायुक्त शौर्य भवन का निर्माण होगा, जिसका भूमि पूजन 8 दिसम्बर 2023 को हुआ है।",
                link: "#"
            }
        ],
        autoPlayInterval: data?.autoPlayInterval || 5000,
    };

    const handleChange = (field: keyof SamajAboutHeroData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleSlideChange = (index: number, field: keyof Slide, value: any) => {
        const newSlides = [...(safeData.slides || [])];
        newSlides[index] = { ...newSlides[index], [field]: value };
        handleChange("slides", newSlides);
    };

    const addSlide = () => {
        handleChange("slides", [...(safeData.slides || []), { image: "", title: "", description: "", link: "#" }]);
    };

    const removeSlide = (index: number) => {
        const newSlides = (safeData.slides || []).filter((_, i) => i !== index);
        handleChange("slides", newSlides);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Slider Settings
                </Typography>
                <TextField
                    label="Auto Play Interval (ms)"
                    type="number"
                    fullWidth
                    size="small"
                    value={safeData.autoPlayInterval}
                    onChange={(e) => handleChange("autoPlayInterval", parseInt(e.target.value))}
                />
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Slides
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addSlide}
                        size="small"
                        color="primary"
                    >
                        Add Slide
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {(safeData.slides || []).map((slide, index) => (
                        <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                                <IconButton
                                    onClick={() => removeSlide(index)}
                                    color="error"
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                >
                                    <FaTrash size={12} />
                                </IconButton>
                            </Box>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        SLIDE {index + 1}
                                    </Typography>
                                    <ShopifyImagePicker
                                        value={slide.image}
                                        onChange={(val) => handleSlideChange(index, "image", val)}
                                        label="Background Image"
                                    />
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        size="small"
                                        value={slide.title}
                                        onChange={(e) => handleSlideChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={3}
                                        value={slide.description}
                                        onChange={(e) => handleSlideChange(index, "description", e.target.value)}
                                    />
                                    <TextField
                                        label="Read More Link"
                                        fullWidth
                                        size="small"
                                        value={slide.link}
                                        onChange={(e) => handleSlideChange(index, "link", e.target.value)}
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
