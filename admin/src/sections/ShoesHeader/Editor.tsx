"use client";

import React, { useState } from "react";
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
    FormControlLabel,
    Switch,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface DropdownItem {
    name: string;
    link: string;
}

interface MenuItem {
    name: string;
    link: string;
    dropdown?: DropdownItem[];
}

interface ShoesHeaderData {
    logoText?: string;
    logoImage?: string;
    navMenu?: MenuItem[];
    profileLink?: string;
    favoritesLink?: string;
    showProfileIcon?: boolean;
    profileIconOrder?: number;
    showFavoritesIcon?: boolean;
    favoritesIconOrder?: number;
    showCartIcon?: boolean;
    cartIconOrder?: number;
    showSocialBar?: boolean;
    socialBarText?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        website?: string;
    };
}

interface ShoesHeaderEditorProps {
    data: ShoesHeaderData;
    onChange: (data: ShoesHeaderData) => void;
}

export const ShoesHeaderEditor: React.FC<ShoesHeaderEditorProps> = ({ data, onChange }) => {
    const [expandedMenuIdx, setExpandedMenuIdx] = useState<number | null>(null);

    const safeData: ShoesHeaderData = {
        logoText: data?.logoText ?? "MATE",
        logoImage: data?.logoImage ?? "",
        profileLink: data?.profileLink ?? "/profile",
        favoritesLink: data?.favoritesLink ?? "/profile",
        showProfileIcon: data?.showProfileIcon ?? true,
        profileIconOrder: data?.profileIconOrder ?? 1,
        showFavoritesIcon: data?.showFavoritesIcon ?? true,
        favoritesIconOrder: data?.favoritesIconOrder ?? 2,
        showCartIcon: data?.showCartIcon ?? true,
        cartIconOrder: data?.cartIconOrder ?? 3,
        showSocialBar: data?.showSocialBar ?? true,
        socialBarText: data?.socialBarText ?? "FOLLOW US",
        socialLinks: data?.socialLinks ?? {
            facebook: "#",
            instagram: "#",
            youtube: "#",
            website: "#"
        },
        navMenu: data?.navMenu ?? [
            { name: "HOME", link: "/" },
            { name: "SHOP", link: "/shop" },
            { name: "PRODUCT", link: "/products" },
            {
                name: "PAGES",
                link: "#",
                dropdown: [
                    { name: "About Us", link: "/pages/about" },
                    { name: "FAQ", link: "/pages/faq" },
                    { name: "Contact Us", link: "/pages/contact" }
                ]
            },
            { name: "BLOG", link: "/blog" }
        ]
    };

    const handleChange = (field: keyof ShoesHeaderData, value: any) => {
        onChange({
            ...safeData,
            [field]: value,
        });
    };

    // --- Main Menu Handlers ---
    const handleMenuItemChange = (index: number, field: keyof MenuItem, value: any) => {
        const newItems = [...(safeData.navMenu || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleChange("navMenu", newItems);
    };

    const addMenuItem = () => {
        const newItems = [...(safeData.navMenu || []), { name: "NEW LINK", link: "#", dropdown: [] }];
        handleChange("navMenu", newItems);
        setExpandedMenuIdx(newItems.length - 1);
    };

    const removeMenuItem = (index: number) => {
        const newItems = (safeData.navMenu || []).filter((_, i) => i !== index);
        handleChange("navMenu", newItems);
        if (expandedMenuIdx === index) setExpandedMenuIdx(null);
    };

    // --- Nested Dropdown Handlers ---
    const addDropdownItem = (menuIdx: number) => {
        const newItems = [...(safeData.navMenu || [])];
        const subMenu = [...(newItems[menuIdx].dropdown || []), { name: "Sub-link name", link: "#" }];
        newItems[menuIdx] = { ...newItems[menuIdx], dropdown: subMenu };
        handleChange("navMenu", newItems);
    };

    const handleDropdownItemChange = (menuIdx: number, subIdx: number, field: keyof DropdownItem, value: string) => {
        const newItems = [...(safeData.navMenu || [])];
        const subMenu = [...(newItems[menuIdx].dropdown || [])];
        subMenu[subIdx] = { ...subMenu[subIdx], [field]: value };
        newItems[menuIdx] = { ...newItems[menuIdx], dropdown: subMenu };
        handleChange("navMenu", newItems);
    };

    const removeDropdownItem = (menuIdx: number, subIdx: number) => {
        const newItems = [...(safeData.navMenu || [])];
        const subMenu = (newItems[menuIdx].dropdown || []).filter((_, i) => i !== subIdx);
        newItems[menuIdx] = { ...newItems[menuIdx], dropdown: subMenu };
        handleChange("navMenu", newItems);
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Logo & Branding
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Logo Text Branding"
                        fullWidth
                        size="small"
                        value={safeData.logoText}
                        onChange={(e) => handleChange("logoText", e.target.value)}
                    />
                    <ShopifyImagePicker
                        label="Custom Brand Logo Image"
                        value={safeData.logoImage}
                        onChange={(url) => handleChange("logoImage", url)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Navigation Menu (Supporting Dropdowns)
                </Typography>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {(safeData.navMenu || []).map((menu, menuIdx) => {
                        const isExpanded = expandedMenuIdx === menuIdx;
                        return (
                            <Card key={menuIdx} variant="outlined" sx={{ bgcolor: isExpanded ? "#f8fafc" : "inherit" }}>
                                <CardContent sx={{ p: '16px !important' }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <TextField
                                            label="Link Name"
                                            size="small"
                                            value={menu.name}
                                            onChange={(e) => handleMenuItemChange(menuIdx, "name", e.target.value)}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <TextField
                                            label="Navigate URL"
                                            size="small"
                                            value={menu.link}
                                            onChange={(e) => handleMenuItemChange(menuIdx, "link", e.target.value)}
                                            sx={{ flexGrow: 1 }}
                                        />
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setExpandedMenuIdx(isExpanded ? null : menuIdx)}
                                            color="primary"
                                        >
                                            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                        <IconButton
                                            onClick={() => removeMenuItem(menuIdx)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>

                                    {/* Nested Dropdown Sub-links */}
                                    {isExpanded && (
                                        <Box sx={{ mt: 2.5, pl: 3, borderLeft: "2px solid #55eb0c" }}>
                                            <Typography variant="caption" fontWeight="bold" sx={{ mb: 1.5, display: "block" }}>
                                                Dropdown Sub-Menu Links
                                            </Typography>
                                            <Stack spacing={1.5}>
                                                {(menu.dropdown || []).map((subItem, subIdx) => (
                                                    <Stack key={subIdx} direction="row" spacing={2} alignItems="center">
                                                        <TextField
                                                            label="Sub-link Title"
                                                            size="small"
                                                            value={subItem.name}
                                                            onChange={(e) => handleDropdownItemChange(menuIdx, subIdx, "name", e.target.value)}
                                                            sx={{ flexGrow: 1 }}
                                                        />
                                                        <TextField
                                                            label="Sub-link URL"
                                                            size="small"
                                                            value={subItem.link}
                                                            onChange={(e) => handleDropdownItemChange(menuIdx, subIdx, "link", e.target.value)}
                                                            sx={{ flexGrow: 1 }}
                                                        />
                                                        <IconButton
                                                            onClick={() => removeDropdownItem(menuIdx, subIdx)}
                                                            color="error"
                                                            size="small"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                ))}
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => addDropdownItem(menuIdx)}
                                                    sx={{ alignSelf: "flex-start", mt: 1 }}
                                                >
                                                    Add Dropdown Sub-link
                                                </Button>
                                            </Stack>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}

                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addMenuItem}
                        fullWidth
                        sx={{ mt: 1, borderRadius: 2 }}
                    >
                        Add Navigation Main Link
                    </Button>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Header Action Icons & Position Configuration
                </Typography>
                <Stack spacing={3} sx={{ mt: 1.5 }}>
                    {/* User Profile Config */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={safeData.showProfileIcon}
                                        onChange={(e) => handleChange("showProfileIcon", e.target.checked)}
                                    />
                                }
                                label="Show Profile Icon"
                            />
                            <TextField
                                label="Display Position"
                                type="number"
                                size="small"
                                sx={{ width: 140 }}
                                value={safeData.profileIconOrder}
                                onChange={(e) => handleChange("profileIconOrder", parseInt(e.target.value) || 1)}
                            />
                        </Stack>
                        {safeData.showProfileIcon && (
                            <TextField
                                label="User Profile Redirect URL"
                                fullWidth
                                size="small"
                                value={safeData.profileLink}
                                onChange={(e) => handleChange("profileLink", e.target.value)}
                            />
                        )}
                    </Box>

                    {/* Favorites Config */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={safeData.showFavoritesIcon}
                                        onChange={(e) => handleChange("showFavoritesIcon", e.target.checked)}
                                    />
                                }
                                label="Show Favorites Icon"
                            />
                            <TextField
                                label="Display Position"
                                type="number"
                                size="small"
                                sx={{ width: 140 }}
                                value={safeData.favoritesIconOrder}
                                onChange={(e) => handleChange("favoritesIconOrder", parseInt(e.target.value) || 2)}
                            />
                        </Stack>
                        {safeData.showFavoritesIcon && (
                            <TextField
                                label="Favorites List Redirect URL"
                                fullWidth
                                size="small"
                                value={safeData.favoritesLink}
                                onChange={(e) => handleChange("favoritesLink", e.target.value)}
                            />
                        )}
                    </Box>

                    {/* Cart Config */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={safeData.showCartIcon}
                                        onChange={(e) => handleChange("showCartIcon", e.target.checked)}
                                    />
                                }
                                label="Show Cart Icon"
                            />
                            <TextField
                                label="Display Position"
                                type="number"
                                size="small"
                                sx={{ width: 140 }}
                                value={safeData.cartIconOrder}
                                onChange={(e) => handleChange("cartIconOrder", parseInt(e.target.value) || 3)}
                            />
                        </Stack>
                    </Box>

                    {/* Social Bar Config */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={safeData.showSocialBar}
                                        onChange={(e) => handleChange("showSocialBar", e.target.checked)}
                                    />
                                }
                                label="Show Floating Social Bar"
                            />
                        </Stack>
                        {safeData.showSocialBar && (
                            <Stack spacing={2}>
                                <TextField
                                    label="Social Bar Vertical Text"
                                    fullWidth
                                    size="small"
                                    value={safeData.socialBarText}
                                    onChange={(e) => handleChange("socialBarText", e.target.value)}
                                />
                                <Typography variant="caption" fontWeight="bold">Social Links</Typography>
                                <TextField
                                    label="Facebook URL"
                                    fullWidth
                                    size="small"
                                    value={safeData.socialLinks?.facebook}
                                    onChange={(e) => handleChange("socialLinks", { ...safeData.socialLinks, facebook: e.target.value })}
                                />
                                <TextField
                                    label="Instagram URL"
                                    fullWidth
                                    size="small"
                                    value={safeData.socialLinks?.instagram}
                                    onChange={(e) => handleChange("socialLinks", { ...safeData.socialLinks, instagram: e.target.value })}
                                />
                                <TextField
                                    label="YouTube URL"
                                    fullWidth
                                    size="small"
                                    value={safeData.socialLinks?.youtube}
                                    onChange={(e) => handleChange("socialLinks", { ...safeData.socialLinks, youtube: e.target.value })}
                                />
                                <TextField
                                    label="Website/Chrome URL"
                                    fullWidth
                                    size="small"
                                    value={safeData.socialLinks?.website}
                                    onChange={(e) => handleChange("socialLinks", { ...safeData.socialLinks, website: e.target.value })}
                                />
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Box>
        </Stack>
    );
};
