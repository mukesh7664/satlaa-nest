"use client";

import React from "react";
import {
    Stack,
    TextField,
    Typography,
    Box,
    Divider,
    Card,
    CardContent,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Button,
    FormControl
} from "@mui/material";
import { FaTrash, FaPlus } from "react-icons/fa";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

interface MemberCard {
    title?: string;
    description?: string;
    image?: string;
    link?: string;
    type: 'info' | 'message';
    bgColor?: string;
    buttonColor?: string;
    subtitle?: string;
    name?: string;
}

interface AyojakMembersData {
    cards?: MemberCard[];
}

interface AyojakMembersEditorProps {
    data: AyojakMembersData;
    onChange: (data: AyojakMembersData) => void;
}

const getHexColor = (val: string | undefined, defaultColor: string) => {
    if (!val) return defaultColor;
    if (val.startsWith('bg-[') || val.startsWith('text-[')) {
        const match = val.match(/\[(.*?)\]/);
        if (match) return match[1];
    }
    if (val === 'bg-white' || val === 'text-white') return '#ffffff';
    if (val === 'bg-black' || val === 'text-black') return '#000000';
    return val;
};

export const AyojakMembersEditor: React.FC<AyojakMembersEditorProps> = ({ data, onChange }) => {
    const safeData: AyojakMembersData = {
        cards: data?.cards || [
            {
                type: 'info',
                title: "About Maheshwari Samaj",
                description: "",
                image: "",
                link: "#",
                bgColor: "bg-[#E6A01C]",
                buttonColor: "text-[#008080]"
            },
            {
                type: 'info',
                title: "About ABMM",
                description: "",
                image: "",
                link: "#",
                bgColor: "bg-[#E65C19]",
                buttonColor: "text-[#E65C19]"
            },
            {
                type: 'message',
                title: "Sabhapati's Message",
                subtitle: "",
                name: "Namaste!",
                description: "",
                image: "",
                link: "#",
                bgColor: "bg-[#C4302B]",
                buttonColor: "text-white"
            }
        ],
    };

    const handleCardChange = (index: number, field: keyof MemberCard, value: any) => {
        const newCards = [...(safeData.cards || [])];
        newCards[index] = { ...newCards[index], [field]: value };
        onChange({ ...safeData, cards: newCards });
    };

    const addCard = () => {
        const newCards = [...(safeData.cards || []), {
            type: 'info' as const,
            title: "New Card",
            description: "",
            image: "",
            link: "#",
            bgColor: "bg-[#E6A01C]",
            buttonColor: "text-[#008080]"
        }];
        onChange({ ...safeData, cards: newCards });
    };

    const removeCard = (index: number) => {
        const newCards = (safeData.cards || []).filter((_: any, i: number) => i !== index);
        onChange({ ...safeData, cards: newCards });
    };

    return (
        <Stack spacing={4} sx={{ py: 2 }}>
            <Typography variant="h6" fontWeight="bold">
                Redesigned 3-Card Layout
            </Typography>

            <Stack spacing={3}>
                {(safeData.cards || []).map((card, index) => (
                    <Card key={index} variant="outlined">
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                    Card {index + 1}: {card.type === 'info' ? 'Info Section' : 'Sabhapati Message'}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => removeCard(index)}>
                                    <FaTrash />
                                </IconButton>
                            </Stack>

                            <Stack spacing={2} sx={{ mt: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Card Type</InputLabel>
                                    <Select
                                        value={card.type}
                                        label="Card Type"
                                        onChange={(e) => handleCardChange(index, "type", e.target.value)}
                                    >
                                        <MenuItem value="info">Information Card</MenuItem>
                                        <MenuItem value="message">Message Card (Person)</MenuItem>
                                    </Select>
                                </FormControl>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mt: 2 }}>
                                    <Typography variant="body2" sx={{ minWidth: 100 }}>Background</Typography>
                                    <input
                                        type="color"
                                        value={getHexColor(card.bgColor, "#E6A01C")}
                                        onChange={(e) => handleCardChange(index, "bgColor", e.target.value)}
                                        style={{ width: 40, height: 40, padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                                    />
                                    <TextField
                                        size="small"
                                        value={getHexColor(card.bgColor, "#E6A01C")}
                                        onChange={(e) => handleCardChange(index, "bgColor", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                </Stack>

                                <TextField
                                    label="Title"
                                    fullWidth
                                    size="small"
                                    value={card.title}
                                    onChange={(e) => handleCardChange(index, "title", e.target.value)}
                                />

                                {card.type === 'message' && (
                                    <>
                                        <TextField
                                            label="Person Subtitle (e.g. Shri Sandeep Ji Kabra)"
                                            fullWidth
                                            size="small"
                                            value={card.subtitle}
                                            onChange={(e) => handleCardChange(index, "subtitle", e.target.value)}
                                        />
                                        <TextField
                                            label="Greeting/Name (e.g. Namaste!)"
                                            fullWidth
                                            size="small"
                                            value={card.name}
                                            onChange={(e) => handleCardChange(index, "name", e.target.value)}
                                        />
                                    </>
                                )}

                                <TextField
                                    label="Description / Content"
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={4}
                                    value={card.description}
                                    onChange={(e) => handleCardChange(index, "description", e.target.value)}
                                />

                                <ShopifyImagePicker
                                    label={card.type === 'message' ? "Person Image" : "Logo Image"}
                                    value={card.image}
                                    onChange={(url) => handleCardChange(index, "image", url)}
                                    aspectRatio="1/1"
                                />

                                <TextField
                                    label="Link URL"
                                    fullWidth
                                    size="small"
                                    value={card.link}
                                    onChange={(e) => handleCardChange(index, "link", e.target.value)}
                                />

                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mt: 2 }}>
                                    <Typography variant="body2" sx={{ minWidth: 100 }}>Text Color</Typography>
                                    <input
                                        type="color"
                                        value={getHexColor(card.buttonColor, "#000000")}
                                        onChange={(e) => handleCardChange(index, "buttonColor", e.target.value)}
                                        style={{ width: 40, height: 40, padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                                    />
                                    <TextField
                                        size="small"
                                        value={getHexColor(card.buttonColor, "#000000")}
                                        onChange={(e) => handleCardChange(index, "buttonColor", e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
                <Button startIcon={<FaPlus />} variant="contained" onClick={addCard}>
                    Add Card
                </Button>
            </Stack>
        </Stack>
    );
};

