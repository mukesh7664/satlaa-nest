"use client";

import React from "react";
import { Stack, TextField, Typography, Box, IconButton, Button, Card, CardContent, Divider } from "@mui/material";
import { FaTrash, FaPlus, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaDownload, FaUserPlus, FaHeadset, FaMobileAlt } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

const ICONS = [
    { label: "Phone", value: "phone", icon: <FaPhoneAlt /> },
    { label: "WhatsApp", value: "whatsapp", icon: <FaWhatsapp /> },
    { label: "Email", value: "email", icon: <FaEnvelope /> },
    { label: "Download", value: "download", icon: <FaDownload /> },
    { label: "User Plus", value: "user-plus", icon: <FaUserPlus /> },
    { label: "Headset", value: "headset", icon: <FaHeadset /> },
    { label: "Mobile", value: "mobile", icon: <FaMobileAlt /> }
];

export const SamajContactInfoEditor: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
    const cards = data.cards || [];
    const footerItems = data.footerItems || [];

    const handleCardChange = (index: number, field: string, value: any) => {
        const newCards = [...cards];
        newCards[index] = { ...newCards[index], [field]: value };
        onChange({ ...data, cards: newCards });
    };

    const addCard = () => {
        onChange({ ...data, cards: [...cards, { title: "", subtitle: "", image: "" }] });
    };

    const removeCard = (index: number) => {
        onChange({ ...data, cards: cards.filter((_: any, i: number) => i !== index) });
    };

    const handleFooterItemChange = (index: number, field: string, value: any) => {
        const newFooterItems = [...footerItems];
        newFooterItems[index] = { ...newFooterItems[index], [field]: value };
        onChange({ ...data, footerItems: newFooterItems });
    };

    const addFooterItem = () => {
        onChange({ ...data, footerItems: [...footerItems, { icon: "user-plus", title: "", subtitle: "" }] });
    };

    const removeFooterItem = (index: number) => {
        onChange({ ...data, footerItems: footerItems.filter((_: any, i: number) => i !== index) });
    };

    const toggleButtonIcon = (cardIndex: number, iconValue: string) => {
        const currentIcons = cards[cardIndex].buttonIcons || [];
        const newIcons = currentIcons.includes(iconValue)
            ? currentIcons.filter((i: string) => i !== iconValue)
            : [...currentIcons, iconValue];
        handleCardChange(cardIndex, "buttonIcons", newIcons);
    };

    return (
        <Stack spacing={4}>
            <Box>
                <Typography variant="h6" gutterBottom>Cards (Top Grid)</Typography>
                <Stack spacing={2}>
                    {cards.map((card: any, index: number) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold">Card {index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => removeCard(index)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Stack>
                                    <TextField
                                        label="Title"
                                        fullWidth
                                        value={card.title}
                                        onChange={(e) => handleCardChange(index, "title", e.target.value)}
                                    />
                                    <TextField
                                        label="Subtitle"
                                        fullWidth
                                        value={card.subtitle}
                                        onChange={(e) => handleCardChange(index, "subtitle", e.target.value)}
                                    />
                                    <ShopifyImagePicker
                                        value={card.image}
                                        onChange={(val) => handleCardChange(index, "image", val)}
                                        label="Card Image"
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    <Button startIcon={<FaPlus />} variant="contained" onClick={addCard}>Add Card</Button>
                </Stack>
            </Box>

            <Divider />

            <Box>
                <Typography variant="h6" gutterBottom>Footer Summary Items</Typography>
                <Stack spacing={2}>
                    {footerItems.map((item: any, index: number) => (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="bold">Item {index + 1}</Typography>
                                        <IconButton size="small" color="error" onClick={() => removeFooterItem(index)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Stack>
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            select
                                            label="Icon"
                                            fullWidth
                                            value={item.icon}
                                            onChange={(e) => handleFooterItemChange(index, "icon", e.target.value)}
                                            SelectProps={{ native: true }}
                                            sx={{ flex: 1 }}
                                        >
                                            {ICONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </TextField>
                                        <TextField
                                            label="Title"
                                            fullWidth
                                            value={item.title}
                                            onChange={(e) => handleFooterItemChange(index, "title", e.target.value)}
                                            sx={{ flex: 1 }}
                                        />
                                    </Stack>
                                    <TextField
                                        label="Subtitle"
                                        fullWidth
                                        value={item.subtitle}
                                        onChange={(e) => handleFooterItemChange(index, "subtitle", e.target.value)}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                    <Button startIcon={<FaPlus />} variant="contained" onClick={addFooterItem}>Add Footer Item</Button>
                </Stack>
            </Box>
        </Stack>
    );
};
