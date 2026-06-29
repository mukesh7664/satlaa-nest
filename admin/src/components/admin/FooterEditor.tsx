"use client";
import React from "react";
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Link as LinkIcon,
} from "@mui/icons-material";
import {
    Button,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Stack,
    Typography,
    Box,
    Divider,
} from "@mui/material";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface FooterLink {
    label: string;
    href: string;
}

interface FooterColumn {
    title: string;
    links: FooterLink[];
}

interface SocialLink {
    icon: string;
    url: string;
}

interface FooterSettings {
    logo?: { url?: string; publicId?: string };
    companyRegNumber?: string;
    description?: string;
    tagline?: string;
    contact: {
        phone: string;
        email: string;
        address: string;
    };
    columns: FooterColumn[];
    socialLinks: SocialLink[];
    copyrightText: string;
    showNewsletter: boolean;
    newsletterDescription?: string;
    certificates?: {
        url: string;
        alt?: string;
        publicId?: string;
        link?: string;
    }[];
}

interface FooterEditorProps {
    data: FooterSettings | null;
    onChange: (newData: FooterSettings) => void;
}

const socialIcons = [
    { label: "Facebook", value: "facebook" },
    { label: "Twitter", value: "twitter" },
    { label: "Instagram", value: "instagram" },
    { label: "LinkedIn", value: "linkedin" },
    { label: "YouTube", value: "youtube" },
    { label: "Telegram", value: "telegram" },
];

export const FooterEditor: React.FC<FooterEditorProps> = ({ data: rawData, onChange }) => {
    const data: FooterSettings = {
        logo: rawData?.logo || {},
        tagline: rawData?.tagline || "",
        description: rawData?.description || "",
        contact: {
            phone: rawData?.contact?.phone || "",
            email: rawData?.contact?.email || "",
            address: rawData?.contact?.address || ""
        },
        columns: rawData?.columns || [],
        socialLinks: rawData?.socialLinks || [],
        copyrightText: rawData?.copyrightText || "",
        showNewsletter: rawData?.showNewsletter ?? true,
        newsletterDescription: rawData?.newsletterDescription || "",
        certificates: rawData?.certificates || [],
    };

    const handleChange = (field: keyof FooterSettings, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleAddColumn = () => {
        handleChange("columns", [
            ...data.columns,
            { title: `Column ${data.columns.length + 1}`, links: [{ label: "", href: "" }] },
        ]);
    };

    const handleRemoveColumn = (index: number) => {
        handleChange("columns", data.columns.filter((_, i) => i !== index));
    };

    const handleColumnChange = (index: number, field: string, value: any) => {
        const newCols = [...data.columns];
        newCols[index] = { ...newCols[index], [field]: value };
        handleChange("columns", newCols);
    };

    const handleAddSocial = () => {
        handleChange("socialLinks", [...data.socialLinks, { icon: "facebook", url: "" }]);
    };

    const handleRemoveSocial = (index: number) => {
        handleChange("socialLinks", data.socialLinks.filter((_, i) => i !== index));
    };

    const handleSocialChange = (index: number, field: string, value: any) => {
        const newLinks = [...data.socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        handleChange("socialLinks", newLinks);
    };

    return (
        <Stack spacing={4} sx={{ p: 2 }}>
            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Brand & Identity</Typography>
                <Stack spacing={2}>
                    <ShopifyImagePicker
                        label="Footer Logo (e.g. Mingers.)"
                        value={data.logo?.url || ""}
                        onChange={(url) => handleChange("logo", { url })}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="Copyright Text"
                        value={data.copyrightText || ""}
                        onChange={(e) => handleChange("copyrightText", e.target.value)}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>Newsletter Subscription</Typography>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="Newsletter Description"
                        value={data.newsletterDescription || ""}
                        onChange={(e) => handleChange("newsletterDescription", e.target.value)}
                        placeholder="e.g. Join our community to receive updates"
                    />
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Navigation Columns</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddColumn} sx={{ textTransform: "none" }}>
                        Add Column
                    </Button>
                </Box>
                <Stack spacing={3}>
                    {data.columns.map((col, colIdx) => (
                        <Box key={colIdx} sx={{ p: 1.5, border: "1px solid #e2e8f0", borderRadius: 1, position: "relative" }}>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveColumn(colIdx)}
                                sx={{ position: "absolute", top: 4, right: 4 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                            <TextField
                                size="small"
                                fullWidth
                                label="Column Title"
                                value={col.title}
                                onChange={(e) => handleColumnChange(colIdx, "title", e.target.value)}
                                sx={{ mb: 2, mt: 1 }}
                            />
                            <Stack spacing={1}>
                                {col.links.map((link, linkIdx) => (
                                    <Box key={linkIdx} sx={{ display: "flex", gap: 1 }}>
                                        <TextField
                                            size="small"
                                            placeholder="Label"
                                            value={link.label}
                                            onChange={(e) => {
                                                const newLinks = [...col.links];
                                                newLinks[linkIdx].label = e.target.value;
                                                handleColumnChange(colIdx, "links", newLinks);
                                            }}
                                            sx={{ flex: 1 }}
                                        />
                                        <TextField
                                            size="small"
                                            placeholder="URL"
                                            value={link.href}
                                            onChange={(e) => {
                                                const newLinks = [...col.links];
                                                newLinks[linkIdx].href = e.target.value;
                                                handleColumnChange(colIdx, "links", newLinks);
                                            }}
                                            sx={{ flex: 1 }}
                                        />
                                        <IconButton
                                            size="small"
                                            disabled={col.links.length === 1}
                                            onClick={() => {
                                                handleColumnChange(colIdx, "links", col.links.filter((_, i) => i !== linkIdx));
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleColumnChange(colIdx, "links", [...col.links, { label: "", href: "" }])}
                                    sx={{ textTransform: "none", width: "fit-content" }}
                                >
                                    Add Link
                                </Button>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Social Media</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={handleAddSocial} sx={{ textTransform: "none" }}>
                        Add Social Link
                    </Button>
                </Box>
                <Stack spacing={2}>
                    {data.socialLinks.map((s, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <FormControl size="small" sx={{ width: 140 }}>
                                <Select
                                    value={s.icon}
                                    onChange={(e) => handleSocialChange(idx, "icon", e.target.value)}
                                >
                                    {socialIcons.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Social Profile URL"
                                value={s.url}
                                onChange={(e) => handleSocialChange(idx, "url", e.target.value)}
                            />
                            <IconButton size="small" color="error" onClick={() => handleRemoveSocial(idx)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};
