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
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Slider,
    InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface Partner {
    id: string;
    image: string;
    name: string;
}

interface PartnersData {
    title: string;
    subtitle: string;
    partners: Partner[];
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
    data: PartnersData;
    onChange: (data: PartnersData) => void;
}

export const PartnersEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);

    // Ensure default data structure
    const safeData: PartnersData = {
        title: data?.title ?? "OUR PARTNERS",
        subtitle: data?.subtitle ?? "Proud sponsors making this event possible",
        partners: Array.isArray(data?.partners) ? data.partners : [],
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
        patternDirection: data?.patternDirection ?? "45deg",
    };

    const updateField = (field: keyof PartnersData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const handleMediaSelect = (file: any) => {
        const url = file.url;
        if (currentPartnerId) {
            const updatedPartners = safeData.partners.map((partner) =>
                partner.id === currentPartnerId ? { ...partner, image: url } : partner
            );
            updateField("partners", updatedPartners);
        }
        setMediaPickerOpen(false);
        setCurrentPartnerId(null);
    };

    const addPartner = () => {
        const newPartner: Partner = {
            id: Date.now().toString(),
            image: "",
            name: "Partner Name",
        };
        updateField("partners", [...safeData.partners, newPartner]);
    };

    const updatePartner = (id: string, field: keyof Partner, value: string) => {
        const updatedPartners = safeData.partners.map((partner) =>
            partner.id === id ? { ...partner, [field]: value } : partner
        );
        updateField("partners", updatedPartners);
    };

    const removePartner = (id: string) => {
        const updatedPartners = safeData.partners.filter(
            (partner) => partner.id !== id
        );
        updateField("partners", updatedPartners);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
                <Typography variant="h6">Partners Section</Typography>

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
                        <Typography variant="subtitle1">Partners</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={addPartner}
                        >
                            Add Partner
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {safeData.partners.map((partner) => (
                            <Card key={partner.id} variant="outlined">
                                <CardContent>
                                    <Stack spacing={2} alignItems="flex-start">
                                        <Box sx={{ width: "100%", flexShrink: 0 }}>
                                            <Box
                                                sx={{
                                                    width: "100%",
                                                    height: 120,
                                                    bgcolor: "#eee",
                                                    mb: 1,
                                                    backgroundImage: `url(${partner.image})`,
                                                    backgroundSize: "contain",
                                                    backgroundPosition: "center",
                                                    backgroundRepeat: "no-repeat",
                                                    borderRadius: 1,
                                                    border: "1px dashed #ccc",
                                                }}
                                            />
                                            <Button
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setCurrentPartnerId(partner.id);
                                                    setMediaPickerOpen(true);
                                                }}
                                            >
                                                Select
                                            </Button>
                                        </Box>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{ width: '100%' }}
                                        >
                                            <TextField
                                                label="Partner Name"
                                                size="small"
                                                fullWidth
                                                value={partner.name}
                                                onChange={(e) =>
                                                    updatePartner(
                                                        partner.id,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <IconButton
                                                color="error"
                                                onClick={() => removePartner(partner.id)}
                                                size="small"
                                                sx={{ mt: 0.5 }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
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
                title="Select Partner Logo"
            />
        </Box>
    );
};
