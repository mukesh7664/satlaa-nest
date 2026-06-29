"use client";

import React from "react";
import { Stack, TextField, Typography, Box, IconButton, Button, Card, CardContent } from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

export const SamajEventSliderEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
    const events = data.events || [];

    const handleFieldChange = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleEventChange = (index: number, field: string, value: any) => {
        const newEvents = [...events];
        newEvents[index] = { ...newEvents[index], [field]: value };
        onChange({ ...data, events: newEvents });
    };

    const addEvent = () => {
        onChange({ ...data, events: [...events, { image: "", title: "", description: "" }] });
    };

    const removeEvent = (index: number) => {
        onChange({ ...data, events: events.filter((_: any, i: number) => i !== index) });
    };

    return (
        <Stack spacing={4}>
            <TextField
                label="Top Title Badge"
                fullWidth
                value={data.topTitle || ""}
                onChange={(e) => handleFieldChange("topTitle", e.target.value)}
                placeholder="All Events"
            />
            <TextField
                label="Main Section Title"
                fullWidth
                value={data.mainTitle || ""}
                onChange={(e) => handleFieldChange("mainTitle", e.target.value)}
                placeholder="ABMM Event"
            />
            <TextField
                label="Section Subtitle"
                fullWidth
                multiline
                rows={3}
                value={data.subTitle || ""}
                onChange={(e) => handleFieldChange("subTitle", e.target.value)}
            />

            <Box>
                <Typography variant="h6" gutterBottom>Event Items (Slider)</Typography>
                <Stack spacing={2}>
                    {events.map((event: any, index: number) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold">Event {index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => removeEvent(index)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Stack>
                                    <ShopifyImagePicker
                                        value={event.image}
                                        onChange={(val) => handleEventChange(index, "image", val)}
                                        label="Event Image"
                                    />
                                    <TextField
                                        label="Event Title"
                                        fullWidth
                                        value={event.title}
                                        onChange={(e) => handleEventChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Event Description"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={event.description}
                                        onChange={(e) => handleEventChange(index, "description", e.target.value)}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    <Button startIcon={<FaPlus />} variant="contained" onClick={addEvent}>Add Event</Button>
                </Stack>
            </Box>
        </Stack>
    );
};
