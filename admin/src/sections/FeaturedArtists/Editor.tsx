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
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Slider,
    InputAdornment,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Instagram,
    Twitter,
    LinkedIn,
    Language,
} from "@mui/icons-material";
import MediaPickerModal from "@/components/MediaPickerModal";

interface SocialLinks {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
}

interface Artist {
    id: string;
    image: string;
    name: string;
    role: string;
    company: string;
    description: string;
    socialLinks?: SocialLinks;
}

interface FeaturedArtistsData {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    artists: Artist[];
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
    data: FeaturedArtistsData;
    onChange: (data: FeaturedArtistsData) => void;
}

export const FeaturedArtistsEditor: React.FC<EditorProps> = ({
    data,
    onChange,
}) => {
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [currentField, setCurrentField] = useState<string | null>(null);
    const [currentArtistId, setCurrentArtistId] = useState<string | null>(null);

    // Ensure default data structure
    const safeData: FeaturedArtistsData = {
        title: data?.title ?? "FEATURED ARTISTS & SPEAKERS",
        subtitle: data?.subtitle ?? "THE ONLY EVENT WITH THIS LINEUP",
        artists: Array.isArray(data?.artists) ? data.artists : [],
        gradientStart: data?.gradientStart ?? "#b91d73",
        gradientMiddle: data?.gradientMiddle ?? "#3a0e3b",
        gradientEnd: data?.gradientEnd ?? "#000000",
        gradientDirection: data?.gradientDirection ?? "to bottom right",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
        patternDirection: data?.patternDirection ?? "45deg",
    };

    const updateField = (field: keyof FeaturedArtistsData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const handleMediaSelect = (file: any) => {
        const url = file.url;
        if (currentField === "backgroundImage") {
            updateField("backgroundImage", url);
        } else if (currentField === "artistImage" && currentArtistId) {
            const updatedArtists = safeData.artists.map((artist) =>
                artist.id === currentArtistId ? { ...artist, image: url } : artist
            );
            updateField("artists", updatedArtists);
        }
        setMediaPickerOpen(false);
        setCurrentField(null);
        setCurrentArtistId(null);
    };

    const addArtist = () => {
        const newArtist: Artist = {
            id: Date.now().toString(),
            image: "",
            name: "New Artist",
            role: "Artist Role",
            company: "Company Name",
            description: "Description...",
            socialLinks: {
                instagram: "",
                twitter: "",
                linkedin: "",
                website: "",
            },
        };
        updateField("artists", [...safeData.artists, newArtist]);
    };

    const updateArtist = (id: string, field: keyof Artist, value: any) => {
        const updatedArtists = safeData.artists.map((artist) =>
            artist.id === id ? { ...artist, [field]: value } : artist
        );
        updateField("artists", updatedArtists);
    };

    const updateArtistSocial = (
        id: string,
        platform: keyof SocialLinks,
        value: string
    ) => {
        const updatedArtists = safeData.artists.map((artist) =>
            artist.id === id
                ? {
                    ...artist,
                    socialLinks: { ...artist.socialLinks, [platform]: value },
                }
                : artist
        );
        updateField("artists", updatedArtists);
    };

    const removeArtist = (id: string) => {
        const updatedArtists = safeData.artists.filter((artist) => artist.id !== id);
        updateField("artists", updatedArtists);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Stack spacing={3}>
                <Typography variant="h6">Featured Artists Section</Typography>

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
                        <Typography variant="subtitle1">Artists</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            size="small"
                            onClick={addArtist}
                        >
                            Add Artist
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {safeData.artists.map((artist) => (
                            <Card key={artist.id} variant="outlined">
                                <CardContent>
                                    <Stack spacing={3}>
                                        {/* Artist Image & Basic Info */}
                                        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                            <Box sx={{ width: 120, alignSelf: "center", flexShrink: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: 120,
                                                        bgcolor: "#eee",
                                                        mb: 1,
                                                        backgroundImage: `url(${artist.image})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center",
                                                        borderRadius: 1,
                                                    }}
                                                />
                                                <Button
                                                    fullWidth
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => {
                                                        setCurrentField("artistImage");
                                                        setCurrentArtistId(artist.id);
                                                        setMediaPickerOpen(true);
                                                    }}
                                                >
                                                    Select
                                                </Button>
                                            </Box>

                                            <Stack spacing={2}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <TextField
                                                        label="Name"
                                                        size="small"
                                                        fullWidth
                                                        value={artist.name}
                                                        onChange={(e) =>
                                                            updateArtist(artist.id, "name", e.target.value)
                                                        }
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeArtist(artist.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>

                                                <Stack direction="row" spacing={1}>
                                                    <TextField
                                                        label="Role"
                                                        size="small"
                                                        fullWidth
                                                        value={artist.role}
                                                        onChange={(e) =>
                                                            updateArtist(artist.id, "role", e.target.value)
                                                        }
                                                    />
                                                    <TextField
                                                        label="Company/Tag"
                                                        size="small"
                                                        fullWidth
                                                        value={artist.company}
                                                        onChange={(e) =>
                                                            updateArtist(artist.id, "company", e.target.value)
                                                        }
                                                    />
                                                </Stack>
                                            </Stack>
                                        </Box>

                                        <TextField
                                            label="Description/Quote"
                                            multiline
                                            rows={2}
                                            size="small"
                                            fullWidth
                                            value={artist.description}
                                            onChange={(e) =>
                                                updateArtist(artist.id, "description", e.target.value)
                                            }
                                        />

                                        <Divider />

                                        {/* Social Links */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                Social Links
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6 }}>
                                                    <TextField
                                                        label="Instagram"
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <Instagram fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        }}
                                                        value={artist.socialLinks?.instagram || ""}
                                                        onChange={(e) =>
                                                            updateArtistSocial(artist.id, "instagram", e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <TextField
                                                        label="Twitter"
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <Twitter fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        }}
                                                        value={artist.socialLinks?.twitter || ""}
                                                        onChange={(e) =>
                                                            updateArtistSocial(artist.id, "twitter", e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <TextField
                                                        label="LinkedIn"
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <LinkedIn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        }}
                                                        value={artist.socialLinks?.linkedin || ""}
                                                        onChange={(e) =>
                                                            updateArtistSocial(artist.id, "linkedin", e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <TextField
                                                        label="Website"
                                                        size="small"
                                                        fullWidth
                                                        InputProps={{
                                                            startAdornment: <Language fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        }}
                                                        value={artist.socialLinks?.website || ""}
                                                        onChange={(e) =>
                                                            updateArtistSocial(artist.id, "website", e.target.value)
                                                        }
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
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
                title="Select Image"
            />
        </Box>
    );
};
