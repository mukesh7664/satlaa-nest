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
    Chip,
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

interface DentalHeaderData {
    logoText?: string;
    logoSubtext?: string;
    logoImage?: string;
    showFreeShipping?: boolean;
    freeShippingText?: string;
    freeShippingLink?: string;
    showTrackOrder?: boolean;
    trackOrderText?: string;
    trackOrderLink?: string;
    showNewsletter?: boolean;
    newsletterText?: string;
    newsletterLink?: string;
    searchCategories?: string[];
    navMenu?: MenuItem[];
    profileLink?: string;
    compareLink?: string;
    favoritesLink?: string;
    showProfileIcon?: boolean;
    profileIconOrder?: number;
    showCompareIcon?: boolean;
    compareIconOrder?: number;
    showFavoritesIcon?: boolean;
    favoritesIconOrder?: number;
    showCartIcon?: boolean;
    cartIconOrder?: number;
}

interface DentalHeaderEditorProps {
    data: DentalHeaderData;
    onChange: (data: DentalHeaderData) => void;
}

export const DentalHeaderEditor: React.FC<DentalHeaderEditorProps> = ({ data, onChange }) => {
    const [newCategory, setNewCategory] = useState("");
    const [expandedMenuIdx, setExpandedMenuIdx] = useState<number | null>(null);

    const safeData: DentalHeaderData = {
        logoText: data?.logoText ?? "STEPDENT",
        logoSubtext: data?.logoSubtext ?? "CLINIC & SUPPLIES",
        logoImage: data?.logoImage ?? "",
        showFreeShipping: data?.showFreeShipping ?? true,
        freeShippingText: data?.freeShippingText ?? "FREE SHIPPING",
        freeShippingLink: data?.freeShippingLink ?? "#",
        showTrackOrder: data?.showTrackOrder ?? true,
        trackOrderText: data?.trackOrderText ?? "TRACK ORDER",
        trackOrderLink: data?.trackOrderLink ?? "/profile",
        showNewsletter: data?.showNewsletter ?? true,
        newsletterText: data?.newsletterText ?? "NEWSLETTER",
        newsletterLink: data?.newsletterLink ?? "#",
        profileLink: data?.profileLink ?? "/profile",
        compareLink: data?.compareLink ?? "/shop",
        favoritesLink: data?.favoritesLink ?? "/profile",
        showProfileIcon: data?.showProfileIcon ?? true,
        profileIconOrder: data?.profileIconOrder ?? 1,
        showCompareIcon: data?.showCompareIcon ?? true,
        compareIconOrder: data?.compareIconOrder ?? 2,
        showFavoritesIcon: data?.showFavoritesIcon ?? true,
        favoritesIconOrder: data?.favoritesIconOrder ?? 3,
        showCartIcon: data?.showCartIcon ?? true,
        cartIconOrder: data?.cartIconOrder ?? 4,
        searchCategories: data?.searchCategories ?? ["All Categories", "Chairs", "Handpieces", "Imaging", "Instruments", "Consumables"],
        navMenu: data?.navMenu ?? [
            {
                name: "HOME",
                link: "/",
                dropdown: [
                    { name: "Dental Supplies", link: "/shop?category=supplies" },
                    { name: "Surgical Equipment", link: "/shop?category=equipment" }
                ]
            },
            {
                name: "PAGES",
                link: "#",
                dropdown: [
                    { name: "About Us", link: "/pages/about" },
                    { name: "Clinical Reviews", link: "/pages/reviews" },
                    { name: "Contact Us", link: "/pages/contact" }
                ]
            },
            { name: "DENTAL TOOLS", link: "/shop?category=tools" },
            {
                name: "CLINIC NEWS",
                link: "#",
                dropdown: [
                    { name: "New Dental Tech", link: "/blog" },
                    { name: "Maintenance Guides", link: "/blog" }
                ]
            },
            { name: "CONTACT", link: "/pages/contact" }
        ]
    };

    const handleChange = (field: keyof DentalHeaderData, value: any) => {
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

    // --- Search Categories Handlers ---
    const addCategoryTag = () => {
        if (newCategory.trim()) {
            const list = [...(safeData.searchCategories || [])];
            if (!list.includes(newCategory.trim())) {
                list.push(newCategory.trim());
                handleChange("searchCategories", list);
            }
            setNewCategory("");
        }
    };

    const removeCategoryTag = (cat: string) => {
        handleChange("searchCategories", (safeData.searchCategories || []).filter(c => c !== cat));
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Logo & Branding
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        label="Logo Brand Name"
                        fullWidth
                        size="small"
                        value={safeData.logoText}
                        onChange={(e) => handleChange("logoText", e.target.value)}
                    />
                    <TextField
                        label="Logo Subtext"
                        fullWidth
                        size="small"
                        value={safeData.logoSubtext}
                        onChange={(e) => handleChange("logoSubtext", e.target.value)}
                    />
                    <ShopifyImagePicker
                        label="Custom Logo Image (Replaces Heart Icon)"
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
                                        <Box sx={{ mt: 2.5, pl: 3, borderLeft: "2px solid #e2e8f0" }}>
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
                    Top Banner Highlights
                </Typography>
                <Stack spacing={3}>
                    {/* Free Shipping Highlight */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={safeData.showFreeShipping}
                                    onChange={(e) => handleChange("showFreeShipping", e.target.checked)}
                                />
                            }
                            label="Enable Free Shipping Highlight"
                        />
                        {safeData.showFreeShipping && (
                            <Stack spacing={2} sx={{ mt: 1.5 }}>
                                <TextField
                                    label="Highlight Text"
                                    fullWidth
                                    size="small"
                                    value={safeData.freeShippingText}
                                    onChange={(e) => handleChange("freeShippingText", e.target.value)}
                                />
                                <TextField
                                    label="Highlight URL Link"
                                    fullWidth
                                    size="small"
                                    value={safeData.freeShippingLink}
                                    onChange={(e) => handleChange("freeShippingLink", e.target.value)}
                                />
                            </Stack>
                        )}
                    </Box>

                    {/* Track Order Shortcut */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={safeData.showTrackOrder}
                                    onChange={(e) => handleChange("showTrackOrder", e.target.checked)}
                                />
                            }
                            label="Enable Track Order Shortcut"
                        />
                        {safeData.showTrackOrder && (
                            <Stack spacing={2} sx={{ mt: 1.5 }}>
                                <TextField
                                    label="Track Order Text"
                                    fullWidth
                                    size="small"
                                    value={safeData.trackOrderText}
                                    onChange={(e) => handleChange("trackOrderText", e.target.value)}
                                />
                                <TextField
                                    label="Track Order URL Link"
                                    fullWidth
                                    size="small"
                                    value={safeData.trackOrderLink}
                                    onChange={(e) => handleChange("trackOrderLink", e.target.value)}
                                />
                            </Stack>
                        )}
                    </Box>

                    {/* Newsletter Shortcut */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={safeData.showNewsletter}
                                    onChange={(e) => handleChange("showNewsletter", e.target.checked)}
                                />
                            }
                            label="Enable Newsletter Shortcut"
                        />
                        {safeData.showNewsletter && (
                            <Stack spacing={2} sx={{ mt: 1.5 }}>
                                <TextField
                                    label="Newsletter Text"
                                    fullWidth
                                    size="small"
                                    value={safeData.newsletterText}
                                    onChange={(e) => handleChange("newsletterText", e.target.value)}
                                />
                                <TextField
                                    label="Newsletter URL Link"
                                    fullWidth
                                    size="small"
                                    value={safeData.newsletterLink}
                                    onChange={(e) => handleChange("newsletterLink", e.target.value)}
                                />
                            </Stack>
                        )}
                    </Box>
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

                    {/* Compare Config */}
                    <Box sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={safeData.showCompareIcon}
                                        onChange={(e) => handleChange("showCompareIcon", e.target.checked)}
                                    />
                                }
                                label="Show Compare Icon"
                            />
                            <TextField
                                label="Display Position"
                                type="number"
                                size="small"
                                sx={{ width: 140 }}
                                value={safeData.compareIconOrder}
                                onChange={(e) => handleChange("compareIconOrder", parseInt(e.target.value) || 2)}
                            />
                        </Stack>
                        {safeData.showCompareIcon && (
                            <TextField
                                label="Compare List Redirect URL"
                                fullWidth
                                size="small"
                                value={safeData.compareLink}
                                onChange={(e) => handleChange("compareLink", e.target.value)}
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
                                onChange={(e) => handleChange("favoritesIconOrder", parseInt(e.target.value) || 3)}
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
                                onChange={(e) => handleChange("cartIconOrder", parseInt(e.target.value) || 4)}
                            />
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                    Search Filter Categories
                </Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            label="Add Search Category"
                            size="small"
                            fullWidth
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCategoryTag();
                                }
                            }}
                        />
                        <Button variant="contained" onClick={addCategoryTag}>
                            Add
                        </Button>
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                        {(safeData.searchCategories || []).map((cat) => (
                            <Chip
                                key={cat}
                                label={cat}
                                onDelete={cat !== "All Categories" ? () => removeCategoryTag(cat) : undefined}
                            />
                        ))}
                    </Stack>
                </Stack>
            </Box>
        </Stack>
    );
};
