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
    Switch,
    FormControlLabel,
    Slider,
    InputAdornment,
} from "@mui/material";

interface SponsorshipData {
    title: string;
    subtitle: string;
    buttonText: string;
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
    data: SponsorshipData;
    onChange: (data: SponsorshipData) => void;
}

export const SponsorshipEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    // Ensure default data structure
    const safeData: SponsorshipData = {
        title: data?.title ?? "Interested in Sponsoring?",
        subtitle: data?.subtitle ?? "Join us in creating an unforgettable experience",
        buttonText: data?.buttonText ?? "BECOME A SPONSOR",
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
        patternDirection: data?.patternDirection ?? "45deg",
    };

    const updateField = (field: keyof SponsorshipData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h6" gutterBottom>Section Content</Typography>

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

                    {/* Pattern Settings */}
                    <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 1, mb: 2 }}>
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
                            multiline
                            rows={2}
                            value={safeData.subtitle}
                            onChange={(e) => updateField("subtitle", e.target.value)}
                        />
                        <TextField
                            label="Button Text"
                            fullWidth
                            value={safeData.buttonText}
                            onChange={(e) => updateField("buttonText", e.target.value)}
                        />
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};
