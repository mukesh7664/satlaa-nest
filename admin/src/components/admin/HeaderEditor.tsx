"use client";
import React from "react";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Link as LinkIcon,
    DesignServices as VisualEditorIcon,
} from "@mui/icons-material";
import {
    Button,
    IconButton,
    TextField,
    Switch,
    FormControlLabel,
    InputAdornment,
    Stack,
    Typography,
    Box,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { VisualMenuEditorContent } from "./VisualMenuEditorContent";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface TopBarLink {
    label: string;
    url: string;
    icon?: string;
    isOpenInNewTab: boolean;
}

interface TopBarSettings {
    isEnabled: boolean;
    content: string;
    backgroundColor: string;
    textColor: string;
    links: TopBarLink[];
    contactEmail?: string;
    contactPhone?: string;
    scrollingText?: string;
    enableScrolling?: boolean;
}

interface HeaderMenu {
    id: string;
    name: string;
    icon?: string;
    isHot: boolean;
    isActive: boolean;
    menuType: string;
    sortOrder: number;
    menuData?: any;
    link?: string;
}

interface HeaderSettings {
    headerLogo?: { url?: string; publicId?: string } | string;
    sideImage1?: { url?: string; publicId?: string } | string;
    sideImage2?: { url?: string; publicId?: string } | string;
    siteLogo?: { url?: string; publicId?: string };
    siteFavicon?: { url?: string; publicId?: string };
    topBar: TopBarSettings;
    menus?: HeaderMenu[];
    menuAlignment?: "left" | "center" | "right";
    showSearch?: boolean;
    showCart?: boolean;
    showUserAccount?: boolean;
    navLayout?: "row" | "main";
}

interface HeaderEditorProps {
    data: HeaderSettings | null;
    onChange: (newData: HeaderSettings) => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({ data: rawData, onChange }) => {
    const data: HeaderSettings = {
        headerLogo: rawData?.headerLogo || "",
        sideImage1: rawData?.sideImage1 || "",
        sideImage2: rawData?.sideImage2 || "",
        topBar: {
            isEnabled: rawData?.topBar?.isEnabled ?? false,
            content: rawData?.topBar?.content || "",
            backgroundColor: rawData?.topBar?.backgroundColor || "#ffffff",
            textColor: rawData?.topBar?.textColor || "#000000",
            links: rawData?.topBar?.links || [],
            contactEmail: rawData?.topBar?.contactEmail || "",
            contactPhone: rawData?.topBar?.contactPhone || "",
            scrollingText: rawData?.topBar?.scrollingText || "",
            enableScrolling: rawData?.topBar?.enableScrolling ?? false,
        },
        menus: rawData?.menus || [],
        menuAlignment: rawData?.menuAlignment || "center",
        showSearch: rawData?.showSearch ?? true,
        showCart: rawData?.showCart ?? true,
        showUserAccount: rawData?.showUserAccount ?? true,
        navLayout: rawData?.navLayout || "row",
    };

    const [visualEditorOpen, setVisualEditorOpen] = React.useState(false);
    const [selectedMenuIndex, setSelectedMenuIndex] = React.useState<number | null>(null);

    const handleOpenVisualEditor = (index: number) => {
        setSelectedMenuIndex(index);
        setVisualEditorOpen(true);
    };

    const handleCloseVisualEditor = () => {
        setVisualEditorOpen(false);
        setSelectedMenuIndex(null);
    };

    const handleVisualMenuDataChange = (newMenuData: any) => {
        if (selectedMenuIndex !== null) {
            handleMenuChange(selectedMenuIndex, "menuData", newMenuData);
        }
    };
    const handleChange = (field: keyof HeaderSettings, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleTopBarChange = (field: keyof TopBarSettings, value: any) => {
        onChange({
            ...data,
            topBar: { ...data.topBar, [field]: value },
        });
    };

    const handleTopBarLinkChange = (index: number, field: keyof TopBarLink, value: any) => {
        const newLinks = [...data.topBar.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        handleTopBarChange("links", newLinks);
    };

    const handleAddTopBarLink = () => {
        handleTopBarChange("links", [
            ...data.topBar.links,
            { label: "", url: "", icon: "", isOpenInNewTab: false },
        ]);
    };

    const handleRemoveTopBarLink = (index: number) => {
        handleTopBarChange("links", data.topBar.links.filter((_, i) => i !== index));
    };

    const DEFAULT_MENU_DATA: any = {
        dynamic: { columns: [] },
    };

    const handleMenuChange = (index: number, field: keyof HeaderMenu, value: any) => {
        const newMenus = [...(data.menus || [])];
        const oldMenu = newMenus[index];
        newMenus[index] = { ...oldMenu, [field]: value };

        // If type changes, reset menuData to default for that type
        if (field === "menuType") {
            newMenus[index].menuData = DEFAULT_MENU_DATA[value] || {};
        }

        handleChange("menus", newMenus);
    };

    const handleAddMenu = () => {
        const menuType = "dynamic";
        const newMenu: HeaderMenu = {
            id: `temp-${Date.now()}`,
            name: "New Menu",
            isHot: false,
            isActive: true,
            menuType,
            sortOrder: (data.menus?.length || 0) + 1,
            menuData: DEFAULT_MENU_DATA[menuType],
        };
        handleChange("menus", [...(data.menus || []), newMenu]);
    };

    const handleRemoveMenu = (index: number) => {
        handleChange("menus", data.menus?.filter((_, i) => i !== index));
    };

    return (
        <Stack spacing={4} sx={{ p: 2 }}>
            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: "slate.700", mb: 2 }}>
                    Header Graphics
                </Typography>
                <Stack spacing={3}>
                    <ShopifyImagePicker
                        label="Header Logo (Overrides global logo)"
                        value={typeof data.headerLogo === 'string' ? data.headerLogo : data.headerLogo?.url}
                        onChange={(url) => handleChange("headerLogo", url)}
                        aspectRatio="auto"
                        objectFit="contain"
                    />
                    <ShopifyImagePicker
                        label="Side Image 1"
                        value={typeof data.sideImage1 === 'string' ? data.sideImage1 : data.sideImage1?.url}
                        onChange={(url) => handleChange("sideImage1", url)}
                        aspectRatio="auto"
                        objectFit="contain"
                    />
                    <ShopifyImagePicker
                        label="Side Image 2"
                        value={typeof data.sideImage2 === 'string' ? data.sideImage2 : data.sideImage2?.url}
                        onChange={(url) => handleChange("sideImage2", url)}
                        aspectRatio="auto"
                        objectFit="contain"
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "slate.600" }}>
                            Show Search Bar
                        </Typography>
                        <Switch
                            size="small"
                            checked={data.showSearch}
                            onChange={(e) => handleChange("showSearch", e.target.checked)}
                        />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "slate.600" }}>
                            Show Cart Icon
                        </Typography>
                        <Switch
                            size="small"
                            checked={data.showCart}
                            onChange={(e) => handleChange("showCart", e.target.checked)}
                        />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "slate.600" }}>
                            Show User Account Icon
                        </Typography>
                        <Switch
                            size="small"
                            checked={data.showUserAccount}
                            onChange={(e) => handleChange("showUserAccount", e.target.checked)}
                        />
                    </Box>
                </Stack>
            </Box>

            <Divider />

            <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "slate.700", mb: 2 }}>
                    Header Menus
                </Typography>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        select
                        label="Menu Alignment"
                        value={data.menuAlignment || "center"}
                        onChange={(e) => handleChange("menuAlignment", e.target.value)}
                        SelectProps={{ native: true }}
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </TextField>
                    <TextField
                        fullWidth
                        size="small"
                        select
                        label="Navigation Layout"
                        value={data.navLayout || "row"}
                        onChange={(e) => handleChange("navLayout", e.target.value)}
                        SelectProps={{ native: true }}
                    >
                        <option value="row">Separate Row (Bottom)</option>
                        <option value="main">Inline with Main Header (Center)</option>
                    </TextField>
                    <Button 
                        fullWidth
                        size="small" 
                        variant="outlined"
                        startIcon={<AddIcon />} 
                        onClick={handleAddMenu} 
                        sx={{ textTransform: "none", height: 40 }}
                    >
                        Add Menu
                    </Button>
                </Stack>
            </Box>
                <Stack spacing={2}>
                    {data.menus?.map((menu, index) => (
                        <Box key={menu.id} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff" }}>
                            <Stack spacing={2}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <TextField
                                        size="small"
                                        label="Menu Name"
                                        value={menu.name}
                                        onChange={(e) => handleMenuChange(index, "name", e.target.value)}
                                        sx={{ width: "85%" }}
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveMenu(index)}
                                        sx={{ ml: "auto" }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    label="Type"
                                    value={menu.menuType}
                                    onChange={(e) => handleMenuChange(index, "menuType", e.target.value)}
                                    SelectProps={{ native: true }}
                                >
                                    <option value="dynamic">Dynamic Mega Menu (Multi-Column)</option>
                                    <option value="simple">Simple Link (Direct)</option>
                                </TextField>

                                <Box sx={{ mb: 1 }}>
                                    <ShopifyImagePicker
                                        label="Menu Icon"
                                        value={menu.icon}
                                        onChange={(url) => handleMenuChange(index, "icon", url)}
                                        aspectRatio="auto"
                                        objectFit="contain"
                                    />
                                </Box>

                                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={menu.isHot}
                                                onChange={(e) => handleMenuChange(index, "isHot", e.target.checked)}
                                            />
                                        }
                                        label={<Typography variant="caption" sx={{ fontWeight: 500 }}>Hot</Typography>}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={menu.isActive}
                                                onChange={(e) => handleMenuChange(index, "isActive", e.target.checked)}
                                            />
                                        }
                                        label={<Typography variant="caption" sx={{ fontWeight: 500 }}>Active</Typography>}
                                    />
                                </Box>

                                {menu.menuType === "simple" ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="URL/Link Destination"
                                        placeholder="/products/new-arrivals"
                                        value={menu.link || ""}
                                        onChange={(e) => handleMenuChange(index, "link", e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LinkIcon fontSize="small" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                ) : (
                                    <Button
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        startIcon={<VisualEditorIcon />}
                                        onClick={() => handleOpenVisualEditor(index)}
                                        sx={{ textTransform: "none", borderRadius: 1.5 }}
                                    >
                                        Visual Editor
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    ))}
                    {(!data.menus || data.menus.length === 0) && (
                        <Typography variant="caption" sx={{ color: "slate.400", textAlign: "center", py: 2, border: "1px dashed #e2e8f0", borderRadius: 1 }}>
                            No menus added
                        </Typography>
                    )}
                </Stack>
            </Box>

            <Divider />

            <Dialog
                open={visualEditorOpen}
                onClose={handleCloseVisualEditor}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ borderBottom: "1px solid #f0f0f0" }}>
                    Visual Editor: {selectedMenuIndex !== null ? data.menus?.[selectedMenuIndex]?.name : ""}
                </DialogTitle>
                <DialogContent className="product-form-container" sx={{ p: 2 }}>
                    {selectedMenuIndex !== null && data.menus?.[selectedMenuIndex] && (
                        <VisualMenuEditorContent
                            menuData={data.menus[selectedMenuIndex].menuData}
                            menuType={data.menus[selectedMenuIndex].menuType}
                            onChange={handleVisualMenuDataChange}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ borderTop: "1px solid #f0f0f0", p: 2 }}>
                    <Button onClick={handleCloseVisualEditor} variant="contained" sx={{ bgcolor: "#6f42c1", "&:hover": { bgcolor: "#5a32a4" } }}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "slate.700" }}>
                        Top Bar Settings
                    </Typography>
                    <Switch
                        size="small"
                        checked={data.topBar.isEnabled}
                        onChange={(e) => handleTopBarChange("isEnabled", e.target.checked)}
                    />
                </Box>

                {data.topBar.isEnabled && (
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Announcement Text"
                            onChange={(e) => handleTopBarChange("content", e.target.value)}
                            placeholder="e.g., #1 Software Reseller in India"
                        />

                        <Box sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Scrolling Announcement</Typography>
                                <Switch
                                    size="small"
                                    checked={data.topBar.enableScrolling}
                                    onChange={(e) => handleTopBarChange("enableScrolling", e.target.checked)}
                                />
                            </Box>
                            {data.topBar.enableScrolling && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Scrolling Text"
                                    value={data.topBar.scrollingText || ""}
                                    onChange={(e) => handleTopBarChange("scrollingText", e.target.value)}
                                    placeholder="Enter text to move in the top bar..."
                                />
                            )}
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Contact Email"
                                value={data.topBar.contactEmail || ""}
                                onChange={(e) => handleTopBarChange("contactEmail", e.target.value)}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                label="Contact Phone"
                                value={data.topBar.contactPhone || ""}
                                onChange={(e) => handleTopBarChange("contactPhone", e.target.value)}
                            />
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" display="block" gutterBottom>BG Color</Typography>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <input
                                        type="color"
                                        value={data.topBar.backgroundColor || "#ffffff"}
                                        onChange={(e) => handleTopBarChange("backgroundColor", e.target.value)}
                                        style={{ width: 32, height: 32, padding: 0, border: "1px solid #ddd", cursor: "pointer" }}
                                    />
                                    <TextField
                                        size="small"
                                        value={data.topBar.backgroundColor || ""}
                                        onChange={(e) => handleTopBarChange("backgroundColor", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" display="block" gutterBottom>Text Color</Typography>
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <input
                                        type="color"
                                        value={data.topBar.textColor || "#000000"}
                                        onChange={(e) => handleTopBarChange("textColor", e.target.value)}
                                        style={{ width: 32, height: 32, padding: 0, border: "1px solid #ddd", cursor: "pointer" }}
                                    />
                                    <TextField
                                        size="small"
                                        value={data.topBar.textColor || ""}
                                        onChange={(e) => handleTopBarChange("textColor", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Links</Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={handleAddTopBarLink} sx={{ textTransform: "none" }}>
                                    Add Link
                                </Button>
                            </Box>
                            <Stack spacing={2}>
                                {data.topBar.links.map((link, index) => (
                                    <Box key={index} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff" }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <TextField
                                                    size="small"
                                                    label="Label"
                                                    value={link.label}
                                                    onChange={(e) => handleTopBarLinkChange(index, "label", e.target.value)}
                                                    sx={{ width: "85%" }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveTopBarLink(index)}
                                                    sx={{ ml: "auto" }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="URL"
                                                value={link.url}
                                                onChange={(e) => handleTopBarLinkChange(index, "url", e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LinkIcon fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={link.isOpenInNewTab}
                                                        onChange={(e) => handleTopBarLinkChange(index, "isOpenInNewTab", e.target.checked)}
                                                    />
                                                }
                                                label={<Typography variant="caption" sx={{ fontWeight: 500 }}>Open in New Tab</Typography>}
                                            />
                                        </Stack>
                                    </Box>
                                ))}
                                {data.topBar.links.length === 0 && (
                                    <Typography variant="caption" sx={{ color: "slate.400", textAlign: "center", py: 2, border: "1px dashed #e2e8f0", borderRadius: 1 }}>
                                        No links added
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                )}
            </Box>
        </Stack>
    );
};
