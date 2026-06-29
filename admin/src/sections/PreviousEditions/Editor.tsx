import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Stack,
    Button,
    Card,
    CardContent,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Switch,
    FormControlLabel,
    Slider,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface ImageItem {
    url: string;
    label: string;
}

interface PreviousEditionsData {
    title: string;
    subtitle: string;
    images: ImageItem[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
}

interface EditorProps {
    data: PreviousEditionsData;
    onChange: (data: PreviousEditionsData) => void;
}

export const PreviousEditionsEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    // Ensure default data structure and handle migration from string[] to ImageItem[]
    const processImages = (imgs: any[]): ImageItem[] => {
        if (!Array.isArray(imgs)) return [];
        return imgs.map((img) => {
            if (typeof img === "string") {
                return { url: img, label: "" };
            }
            return img;
        });
    };

    const safeData: PreviousEditionsData = {
        title: data?.title ?? "PREVIOUS EDITIONS",
        subtitle: data?.subtitle ?? "Relive the magic of past events",
        images: processImages(data?.images),
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
    };

    const updateField = (field: keyof PreviousEditionsData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const handleMediaSelect = (file: any) => {
        const newImages = [...safeData.images, { url: file.url, label: "" }];
        updateField("images", newImages);
        setMediaPickerOpen(false);
    };

    const removeImage = (index: number) => {
        const newImages = safeData.images.filter((_, i) => i !== index);
        updateField("images", newImages);
    };

    const updateImageLabel = (index: number, label: string) => {
        const newImages = safeData.images.map((img, i) =>
            i === index ? { ...img, label } : img
        );
        updateField("images", newImages);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h6" gutterBottom>Section Settings</Typography>

                    {/* Gradient Settings */}
                    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, mb: 2 }}>
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



                    <Stack spacing={2}>
                        <TextField
                            label="Title"
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
                    </Stack>
                </Box>

                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">Gallery Images</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            onClick={() => setMediaPickerOpen(true)}
                        >
                            Add Image
                        </Button>
                    </Stack>

                    <Grid container spacing={3}>
                        {safeData.images.map((item, index) => (
                            <Grid key={index} size={{ xs: 12 }}>
                                <Card variant="outlined">
                                    <Stack direction="column" spacing={2} sx={{ p: 2 }}>
                                        {/* Image Preview */}
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 300,
                                                bgcolor: '#eee',
                                                borderRadius: 1,
                                                position: 'relative',
                                                backgroundImage: `url(${item.url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        />

                                        {/* Inputs & Actions */}
                                        <Stack spacing={2} sx={{ width: '100%' }}>
                                            <TextField
                                                label="Event Name"
                                                fullWidth
                                                value={item.label}
                                                onChange={(e) => updateImageLabel(index, e.target.value)}
                                                placeholder="e.g. Summer Festival 2023"
                                            />
                                            <Box sx={{ alignSelf: 'flex-end' }}>
                                                <Button
                                                    startIcon={<DeleteIcon />}
                                                    color="error"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    {safeData.images.length === 0 && (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                            No images added yet.
                        </Typography>
                    )}
                </Box>
            </Stack >

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                title="Select Image"
            />
        </Box >
    );
};
