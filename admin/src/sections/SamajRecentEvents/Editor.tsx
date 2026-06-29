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

interface EventItem {
    image?: string;
    date?: string;
    title?: string;
    location?: string;
}

interface SamajRecentEventsData {
    badgeText?: string;
    title?: string;
    events?: EventItem[];
}

interface SamajRecentEventsEditorProps {
    data: SamajRecentEventsData;
    onChange: (data: SamajRecentEventsData) => void;
}

export const SamajRecentEventsEditor: React.FC<SamajRecentEventsEditorProps> = ({ data, onChange }) => {
    const safeData: SamajRecentEventsData = {
        badgeText: data?.badgeText ?? "Our Recent Events",
        title: data?.title ?? "Highlights From Our culture, Social, & Events",
        events: data?.events ?? [
            {
                image: "",
                date: "14-09-2025",
                title: "Goth",
                location: "Vidhyadhar Nagar Stadium, Sector-10, Vidhyadhar Nagar, Jaipur",
            },
            {
                image: "",
                date: "26-10-2025",
                title: "Annakut",
                location: "Vidhyadhar Nagar Stadium, Sector-10, Vidhyadhar Nagar, Jaipur",
            },
            {
                image: "",
                date: "25-01-2026",
                title: "Surya Saptami",
                location: "Abhinandan janupyogi Bawan, Patrakar Road, Jaipur",
            },
        ],
    };

    const handleChange = (field: keyof SamajRecentEventsData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleEventChange = (index: number, field: keyof EventItem, value: any) => {
        const newEvents = [...(safeData.events || [])];
        newEvents[index] = { ...newEvents[index], [field]: value };
        handleChange("events", newEvents);
    };

    const addEvent = () => {
        handleChange("events", [...(safeData.events || []), { image: "", date: "", title: "", location: "" }]);
    };

    const removeEvent = (index: number) => {
        const newEvents = (safeData.events || []).filter((_, i) => i !== index);
        handleChange("events", newEvents);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Header Content
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Badge Text"
                        fullWidth
                        value={safeData.badgeText}
                        onChange={(e) => handleChange("badgeText", e.target.value)}
                    />
                    <TextField
                        label="Section Title"
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
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Events List
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addEvent}
                        size="small"
                        color="primary"
                    >
                        Add Event
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {(safeData.events || []).map((event, index) => (
                        <Card key={index} variant="outlined" sx={{ position: 'relative', overflow: 'visible' }}>
                            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 1 }}>
                                <IconButton
                                    onClick={() => removeEvent(index)}
                                    color="error"
                                    size="small"
                                    sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                                >
                                    <FaTrash size={12} />
                                </IconButton>
                            </Box>
                            <CardContent>
                                <Stack spacing={2}>
                                    <ShopifyImagePicker
                                        label={`Event ${index + 1} Image`}
                                        value={event.image}
                                        onChange={(url) => handleEventChange(index, "image", url)}
                                        aspectRatio="4/3"
                                    />
                                    <TextField
                                        label="Date"
                                        fullWidth
                                        size="small"
                                        value={event.date}
                                        onChange={(e) => handleEventChange(index, "date", e.target.value)}
                                        placeholder="e.g. 14-09-2025"
                                    />
                                    <TextField
                                        label="Event Title"
                                        fullWidth
                                        size="small"
                                        value={event.title}
                                        onChange={(e) => handleEventChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Location"
                                        fullWidth
                                        size="small"
                                        multiline
                                        rows={2}
                                        value={event.location}
                                        onChange={(e) => handleEventChange(index, "location", e.target.value)}
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
