import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Stack,
    Button,
    IconButton,
    Card,
    CardContent,
    Grid,
    Select,
    MenuItem,
    InputAdornment,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Slider,
} from "@mui/material"; // Using @mui/material's Grid2 if available, or Grid v1. But wait, I just had to fix Grid usage in another file. 
// The fix in Editor.tsx was to use `size` prop instead of `xs/sm` on Grid item.
// Let's use Grid properly here. The import might be unstable_Grid2 as Grid in newer versions or just Grid with size prop.
// Based on previous file, it seems `Grid` from `@mui/material` is the one to use, but with `size` prop.
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import ImageUploader from "../../components/ImageUploader";

interface Offer {
    id: string;
    title: string;
    description: string;
    image?: string;
}

interface WhatWeOfferData {
    title: string;
    subtitle: string;
    offers: Offer[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
    patternDirection?: string;
}

interface EditorProps {
    data: WhatWeOfferData;
    onChange: (data: WhatWeOfferData) => void;
}

export const WhatWeOfferEditor: React.FC<EditorProps> = ({
    data,
    onChange,
}) => {
    // Ensure default data structure
    const safeData: WhatWeOfferData = {
        title: data?.title ?? "WHAT WE OFFER",
        subtitle: data?.subtitle ?? "AN UNFORGETTABLE EXPERIENCE AWAITS YOU",
        offers: Array.isArray(data?.offers) ? data.offers : [],
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
        patternDirection: data?.patternDirection ?? "45deg",
    };

    const updateField = (field: keyof WhatWeOfferData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const addOffer = () => {
        const newOffer: Offer = {
            id: Date.now().toString(),
            title: "New Offer",
            description: "Description of the offer...",
            image: "",
        };
        updateField("offers", [...safeData.offers, newOffer]);
    };

    const updateOffer = (id: string, field: keyof Offer, value: string) => {
        const updatedOffers = safeData.offers.map((offer) =>
            offer.id === id ? { ...offer, [field]: value } : offer
        );
        updateField("offers", updatedOffers);
    };

    const removeOffer = (id: string) => {
        const updatedOffers = safeData.offers.filter((offer) => offer.id !== id);
        updateField("offers", updatedOffers);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
                <Typography variant="h6">What We Offer Section</Typography>

                {/* Gradient Settings */}
                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Background Gradient</Typography>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <TextField
                                label="Start Color"
                                type="color"
                                size="small"
                                fullWidth
                                value={safeData.gradientStart}
                                onChange={(e) => updateField("gradientStart", e.target.value)}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label="Middle Color"
                                type="color"
                                size="small"
                                fullWidth
                                value={safeData.gradientMiddle}
                                onChange={(e) => updateField("gradientMiddle", e.target.value)}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                label="End Color"
                                type="color"
                                size="small"
                                fullWidth
                                value={safeData.gradientEnd}
                                onChange={(e) => updateField("gradientEnd", e.target.value)}
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="gradient-direction-label">Direction</InputLabel>
                                <Select
                                    labelId="gradient-direction-label"
                                    value={safeData.gradientDirection}
                                    label="Direction"
                                    onChange={(e) => updateField("gradientDirection", e.target.value)}
                                >
                                    <MenuItem value="to bottom">To Bottom (↓)</MenuItem>
                                    <MenuItem value="to top">To Top (↑)</MenuItem>
                                    <MenuItem value="to right">To Right (→)</MenuItem>
                                    <MenuItem value="to left">To Left (←)</MenuItem>
                                    <MenuItem value="to bottom right">To Bottom Right (↘)</MenuItem>
                                    <MenuItem value="to bottom left">To Bottom Left (↙)</MenuItem>
                                    <MenuItem value="to top right">To Top Right (↗)</MenuItem>
                                    <MenuItem value="to top left">To Top Left (↖)</MenuItem>
                                    <MenuItem value="45deg">45 Degrees</MenuItem>
                                    <MenuItem value="90deg">90 Degrees</MenuItem>
                                    <MenuItem value="135deg">135 Degrees</MenuItem>
                                    <MenuItem value="180deg">180 Degrees</MenuItem>
                                    <MenuItem value="225deg">225 Degrees</MenuItem>
                                    <MenuItem value="270deg">270 Degrees</MenuItem>
                                    <MenuItem value="315deg">315 Degrees</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* Pattern Settings */}
                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">Pattern Overlay</Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={safeData.patternEnabled}
                                    onChange={(e) => updateField("patternEnabled", e.target.checked)}
                                    size="small"
                                />
                            }
                            label="Enable"
                        />
                    </Stack>

                    {safeData.patternEnabled && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid size={6}>
                                <TextField
                                    label="Pattern Color"
                                    type="color"
                                    size="small"
                                    fullWidth
                                    value={safeData.patternColor}
                                    onChange={(e) => updateField("patternColor", e.target.value)}
                                />
                            </Grid>
                            <Grid size={6}>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    Opacity: {Math.round((safeData.patternOpacity || 0.2) * 100)}%
                                </Typography>
                                <Slider
                                    value={safeData.patternOpacity}
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    onChange={(_, value) => updateField("patternOpacity", value)}
                                    valueLabelDisplay="auto"
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField
                                    label="Pattern Angle"
                                    size="small"
                                    fullWidth
                                    value={safeData.patternDirection}
                                    onChange={(e) => updateField("patternDirection", e.target.value)}
                                    placeholder="e.g. 45deg"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end" sx={{ opacity: 0.6, fontSize: '0.75rem' }}>e.g. 45deg</InputAdornment>
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Box>

                <TextField
                    label="Section Title"
                    fullWidth
                    value={safeData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                />

                <TextField
                    label="Subtitle"
                    fullWidth
                    value={safeData.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                />

                <Box>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="subtitle1">Offers</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={addOffer}
                        >
                            Add Offer
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {safeData.offers.map((offer) => (
                            <Card key={offer.id} variant="outlined">
                                <CardContent>
                                    <Grid container spacing={2} alignItems="flex-start">
                                        <Grid size={{ xs: 12 }}>
                                            <Stack spacing={2}>
                                                <ImageUploader
                                                    label="Background Image"
                                                    value={offer.image}
                                                    onChange={(url) =>
                                                        updateOffer(offer.id, "image", url)
                                                    }
                                                    folder="what-we-offer"
                                                />
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <TextField
                                                        label="Title"
                                                        size="small"
                                                        fullWidth
                                                        value={offer.title}
                                                        onChange={(e) =>
                                                            updateOffer(offer.id, "title", e.target.value)
                                                        }
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeOffer(offer.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                                <TextField
                                                    label="Description"
                                                    multiline
                                                    rows={2}
                                                    size="small"
                                                    fullWidth
                                                    value={offer.description}
                                                    onChange={(e) =>
                                                        updateOffer(offer.id, "description", e.target.value)
                                                    }
                                                />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            </Stack >
        </Box >
    );
};
