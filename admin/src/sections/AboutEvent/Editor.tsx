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
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Slider,
    InputAdornment
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface Stat {
    metric: string;
    label: string;
}

interface AboutEventData {
    topLabel: string;
    title: string;
    description: string;
    linkText: string;
    linkUrl: string;
    backgroundImage: string;
    statsTitle?: string;
    stats: Stat[];
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
    data: AboutEventData;
    onChange: (data: AboutEventData) => void;
}

export const AboutEventEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    // Ensure default data structure
    const safeData: AboutEventData = {
        topLabel: data?.topLabel ?? "About Us",
        title: data?.title ?? "Vietnam's leading creative agency",
        description: data?.description ?? "Founded in 2013, Zeit has become one of Vietnam's leading agencies...",
        linkText: data?.linkText ?? "Learn More",
        linkUrl: data?.linkUrl ?? "#",
        backgroundImage: data?.backgroundImage ?? "",
        statsTitle: data?.statsTitle ?? "Our Impact",
        stats: Array.isArray(data?.stats) ? data.stats : [
            { metric: "200+", label: "Events organized for top brands" },
            { metric: "1000+", label: "Communication publications designed" },
            { metric: "50+", label: "Experienced, passionate staff" }
        ],
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
        patternDirection: data?.patternDirection ?? "45deg",
    };

    const updateField = (field: keyof AboutEventData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const handleMediaSelect = (file: any) => {
        updateField("backgroundImage", file.url);
        setMediaPickerOpen(false);
    };

    const addStat = () => {
        const newStat: Stat = { metric: "0+", label: "Description" };
        updateField("stats", [...safeData.stats, newStat]);
    };

    const updateStat = (index: number, field: keyof Stat, value: string) => {
        const updatedStats = [...safeData.stats];
        updatedStats[index] = { ...updatedStats[index], [field]: value };
        updateField("stats", updatedStats);
    };

    const removeStat = (index: number) => {
        const updatedStats = safeData.stats.filter((_, i) => i !== index);
        updateField("stats", updatedStats);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={4}>
                {/* Top Section */}
                <Box>
                    <Typography variant="h6" gutterBottom>Top Content</Typography>
                    <Stack spacing={2}>
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

                        <TextField
                            label="Top Label"
                            fullWidth
                            size="small"
                            value={safeData.topLabel}
                            onChange={(e) => updateField("topLabel", e.target.value)}
                        />
                        <TextField
                            label="Main Title"
                            fullWidth
                            multiline
                            rows={2}
                            value={safeData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={safeData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Link Text"
                                fullWidth
                                size="small"
                                value={safeData.linkText}
                                onChange={(e) => updateField("linkText", e.target.value)}
                            />
                            <TextField
                                label="Link URL"
                                fullWidth
                                size="small"
                                value={safeData.linkUrl}
                                onChange={(e) => updateField("linkUrl", e.target.value)}
                            />
                        </Stack>
                    </Stack>
                </Box>

                {/* Bottom Section */}
                <Box>
                    <Typography variant="h6" gutterBottom>Bottom Stats Section</Typography>

                    {/* Background Image */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Background Image
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {safeData.backgroundImage ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 200,
                                        bgcolor: "#eee",
                                        backgroundImage: `url(${safeData.backgroundImage})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: 1,
                                        border: "1px dashed #ccc",
                                        position: "relative",
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: 100,
                                        bgcolor: "#f9f9f9",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px dashed #ddd",
                                        borderRadius: 1,
                                        color: "#888",
                                    }}
                                >
                                    <Typography variant="body2">No Image Selected</Typography>
                                </Box>
                            )}

                            <Stack direction="row" spacing={2} justifyContent="flex-start">
                                <Button
                                    variant="contained"
                                    onClick={() => setMediaPickerOpen(true)}
                                    color="primary"
                                >
                                    {safeData.backgroundImage ? "Change Image" : "Select Image"}
                                </Button>
                                {safeData.backgroundImage && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => updateField("backgroundImage", "")}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Stats List */}
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            label="Stats Section Title"
                            fullWidth
                            size="small"
                            value={safeData.statsTitle || ""}
                            onChange={(e) => updateField("statsTitle", e.target.value)}
                            placeholder="e.g. Our Impact"
                            sx={{ mb: 2 }}
                        />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle2">Stats Items</Typography>
                            <Button startIcon={<AddIcon />} size="small" onClick={addStat}>
                                Add Stat
                            </Button>
                        </Stack>
                    </Box>

                    <Stack spacing={2}>
                        {safeData.stats.map((stat, index) => (
                            <Card key={index} variant="outlined">
                                <CardContent sx={{ p: '16px !important' }}>
                                    <Grid container spacing={1} alignItems="center">
                                        <Grid size={4}>
                                            <TextField
                                                label="Metric"
                                                size="small"
                                                fullWidth
                                                value={stat.metric}
                                                onChange={(e) => updateStat(index, "metric", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={6}>
                                            <TextField
                                                label="Label"
                                                size="small"
                                                fullWidth
                                                value={stat.label}
                                                onChange={(e) => updateStat(index, "label", e.target.value)}
                                            />
                                        </Grid>
                                        <Grid size={1}>
                                            <IconButton color="error" onClick={() => removeStat(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Box>
            </Stack>

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                title="Select Background Image"
            />
        </Box>
    );
};

