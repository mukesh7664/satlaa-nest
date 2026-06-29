"use client";

import React from "react";
import { Stack, TextField, Typography, Box, IconButton, Button, Card, CardContent } from "@mui/material";
import { FaTrash, FaPlus, FaUserCircle, FaSearch, FaHandshake, FaShieldAlt, FaCalendarAlt, FaCheckCircle, FaHeadset, FaUsers } from "react-icons/fa";

const ICONS = [
    { label: "User", value: "user", icon: <FaUserCircle /> },
    { label: "Search", value: "search", icon: <FaSearch /> },
    { label: "Handshake", value: "handshake", icon: <FaHandshake /> },
    { label: "Shield", value: "shield", icon: <FaShieldAlt /> },
    { label: "Calendar", value: "calendar", icon: <FaCalendarAlt /> },
    { label: "Check", value: "check", icon: <FaCheckCircle /> },
    { label: "Headset", value: "headset", icon: <FaHeadset /> },
    { label: "Users", value: "users", icon: <FaUsers /> }
];

export const WhyChooseSamajEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
    const reasons = data.reasons || [];

    const handleFieldChange = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleReasonChange = (index: number, field: string, value: any) => {
        const newReasons = [...reasons];
        newReasons[index] = { ...newReasons[index], [field]: value };
        onChange({ ...data, reasons: newReasons });
    };

    const addReason = () => {
        onChange({ ...data, reasons: [...reasons, { icon: "check", title: "", description: "" }] });
    };

    const removeReason = (index: number) => {
        onChange({ ...data, reasons: reasons.filter((_: any, i: number) => i !== index) });
    };

    return (
        <Stack spacing={4}>
            <TextField
                label="Section Title"
                fullWidth
                value={data.title || ""}
                onChange={(e) => handleFieldChange("title", e.target.value)}
            />
            <TextField
                label="Section Subtitle"
                fullWidth
                value={data.subtitle || ""}
                onChange={(e) => handleFieldChange("subtitle", e.target.value)}
            />

            <Box>
                <Typography variant="h6" gutterBottom>Reasons / Features Grid</Typography>
                <Stack spacing={2}>
                    {reasons.map((reason: any, index: number) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold">Item {index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => removeReason(index)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Stack>
                                    <TextField
                                        select
                                        label="Icon"
                                        fullWidth
                                        value={reason.icon}
                                        onChange={(e) => handleReasonChange(index, "icon", e.target.value)}
                                        SelectProps={{ native: true }}
                                    >
                                        {ICONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </TextField>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        value={reason.title}
                                        onChange={(e) => handleReasonChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Description"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={reason.description}
                                        onChange={(e) => handleReasonChange(index, "description", e.target.value)}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    <Button startIcon={<FaPlus />} variant="contained" onClick={addReason}>Add Reason</Button>
                </Stack>
            </Box>
        </Stack>
    );
};
