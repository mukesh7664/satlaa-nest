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
    Switch,
    FormControlLabel,
} from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface MenuItem {
    label: string;
    link: string;
}

interface SamajHeaderData {
    logo?: string;
    menuItems?: MenuItem[];
    showAuthButtons?: boolean;
    loginLink?: string;
    signupLink?: string;
}

interface SamajHeaderEditorProps {
    data: SamajHeaderData;
    onChange: (data: SamajHeaderData) => void;
}

export const SamajHeaderEditor: React.FC<SamajHeaderEditorProps> = ({ data, onChange }) => {
    const safeData: SamajHeaderData = {
        logo: data?.logo ?? "",
        menuItems: data?.menuItems ?? [
            { label: "Home", link: "/" },
            { label: "About", link: "/about" },
            { label: "Vivah Sammelan", link: "/vivah-sammelan" },
            { label: "Contact us", link: "/contact" },
        ],
        showAuthButtons: data?.showAuthButtons ?? true,
        loginLink: data?.loginLink ?? "/login",
        signupLink: data?.signupLink ?? "/signup",
    };

    const handleChange = (field: keyof SamajHeaderData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    const handleMenuItemChange = (index: number, field: keyof MenuItem, value: string) => {
        const newItems = [...(safeData.menuItems || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange("menuItems", newItems);
    };

    const addMenuItem = () => {
        handleChange("menuItems", [...(safeData.menuItems || []), { label: "", link: "" }]);
    };

    const removeMenuItem = (index: number) => {
        const newItems = (safeData.menuItems || []).filter((_, i) => i !== index);
        handleChange("menuItems", newItems);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Branding
                </Typography>
                <ShopifyImagePicker
                    label="Logo Image"
                    value={safeData.logo}
                    onChange={(url) => handleChange("logo", url)}
                />
            </Box>

            <Divider />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Navigation Menu
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={addMenuItem}
                        size="small"
                        color="primary"
                    >
                        Add Menu Item
                    </Button>
                </Stack>

                <Stack spacing={2}>
                    {(safeData.menuItems || []).map((item, index) => (
                        <Card key={index} variant="outlined">
                            <CardContent sx={{ p: '16px !important' }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        label="Label"
                                        size="small"
                                        fullWidth
                                        value={item.label}
                                        onChange={(e) => handleMenuItemChange(index, "label", e.target.value)}
                                    />
                                    <TextField
                                        label="Link"
                                        size="small"
                                        fullWidth
                                        value={item.link}
                                        onChange={(e) => handleMenuItemChange(index, "link", e.target.value)}
                                    />
                                    <IconButton
                                        onClick={() => removeMenuItem(index)}
                                        color="error"
                                        size="small"
                                    >
                                        <FaTrash />
                                    </IconButton>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Authentication
                </Typography>
                <Stack spacing={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={safeData.showAuthButtons}
                                onChange={(e) => handleChange("showAuthButtons", e.target.checked)}
                            />
                        }
                        label="Show Login/Signup Buttons"
                    />
                    {safeData.showAuthButtons && (
                        <>
                            <TextField
                                label="Login Link"
                                fullWidth
                                size="small"
                                value={safeData.loginLink}
                                onChange={(e) => handleChange("loginLink", e.target.value)}
                            />
                            <TextField
                                label="Signup Link"
                                fullWidth
                                size="small"
                                value={safeData.signupLink}
                                onChange={(e) => handleChange("signupLink", e.target.value)}
                            />
                        </>
                    )}
                </Stack>
            </Box>
        </Stack>
    );
};
