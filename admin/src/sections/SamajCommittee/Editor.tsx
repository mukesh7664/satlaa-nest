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
    CardContent
} from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface Member {
    name: string;
    designation: string;
    image: string;
}

interface SamajCommitteeData {
    title?: string;
    subtitle?: string;
    members?: Member[];
}

interface SamajCommitteeEditorProps {
    data: SamajCommitteeData;
    onChange: (data: SamajCommitteeData) => void;
}

export const SamajCommitteeEditor: React.FC<SamajCommitteeEditorProps> = ({ data, onChange }) => {
    const safeData: SamajCommitteeData = {
        title: data?.title ?? "Committee Members",
        subtitle: data?.subtitle ?? "Our Dedicated Team",
        members: data?.members || []
    };

    const handleDataChange = (field: keyof SamajCommitteeData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const handleMemberChange = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...(safeData.members || [])];
        newMembers[index] = { ...newMembers[index], [field]: value };
        handleDataChange("members", newMembers);
    };

    const addMember = () => {
        const newMembers = [
            ...(safeData.members || []),
            { name: "New Member", designation: "Position", image: "" }
        ];
        handleDataChange("members", newMembers);
    };

    const removeMember = (index: number) => {
        const newMembers = (safeData.members || []).filter((_, i) => i !== index);
        handleDataChange("members", newMembers);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Section Header
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Section Title"
                        value={safeData.title}
                        onChange={(e) => handleDataChange("title", e.target.value)}
                        size="small"
                    />
                    <TextField
                        fullWidth
                        label="Section Subtitle"
                        value={safeData.subtitle}
                        onChange={(e) => handleDataChange("subtitle", e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Committee Members
                    </Typography>
                    <Button
                        startIcon={<FaPlus />}
                        variant="contained"
                        onClick={addMember}
                        size="small"
                    >
                        Add Member
                    </Button>
                </Stack>

                <Stack spacing={2}>
                    {(safeData.members || []).map((member, index) => (
                        <Card key={index} variant="outlined">
                            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Member #{index + 1}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeMember(index)}
                                        >
                                            <FaTrash size={14} />
                                        </IconButton>
                                    </Stack>

                                    <TextField
                                        fullWidth
                                        label="Name"
                                        value={member.name}
                                        onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                                        size="small"
                                    />

                                    <TextField
                                        fullWidth
                                        label="Designation"
                                        value={member.designation}
                                        onChange={(e) => handleMemberChange(index, "designation", e.target.value)}
                                        size="small"
                                    />

                                    <ShopifyImagePicker
                                        label="Member Photo"
                                        value={member.image}
                                        onChange={(url) => handleMemberChange(index, "image", url)}
                                        aspectRatio="4/5"
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
