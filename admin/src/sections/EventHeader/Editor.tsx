import React from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import {
    TextField,
    Box,
    IconButton,
    Button,
    Typography,
    Paper,
    Grid,
    Stack,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DragHandle } from "@mui/icons-material";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface MenuItem {
    id: string;
    label: string;
    url: string;
}

interface EventHeaderData {
    logoImage?: string;
    title?: string;
    subtitle?: string; // e.g. "by SID Events"
    menuItems?: MenuItem[];
    ctaLabel?: string;
    ctaUrl?: string;
}

interface EditorProps {
    data: EventHeaderData;
    onChange: (data: EventHeaderData) => void;
}

const SortableMenuItem = ({
    id,
    item,
    onChange,
    onDelete
}: {
    id: string;
    item: MenuItem;
    onChange: (id: string, field: keyof MenuItem, value: any) => void;
    onDelete: (id: string) => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            sx={{ p: 2, mb: 1, display: "flex", gap: 2 }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "center", pt: 1 }}>
                <IconButton {...attributes} {...listeners} size="small" sx={{ cursor: "grab" }}>
                    <DragHandle />
                </IconButton>

                <IconButton onClick={() => onDelete(id)} color="error" size="small">
                    <DeleteIcon />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <TextField
                    label="Label"
                    value={item.label}
                    onChange={(e) => onChange(id, "label", e.target.value)}
                    size="small"
                    fullWidth
                />
                <FormControl fullWidth size="small">
                    <InputLabel>Section</InputLabel>
                    <Select
                        value={item.url}
                        onChange={(e) => onChange(id, "url", e.target.value)}
                        label="Section"
                    >
                        <MenuItem value="#event-hero">Event Hero</MenuItem>
                        <MenuItem value="#about-event">About Event</MenuItem>
                        <MenuItem value="#featured-artists">Featured Artists</MenuItem>
                        <MenuItem value="#what-we-offer">What We Offer</MenuItem>
                        <MenuItem value="#partners">Partners</MenuItem>
                        <MenuItem value="#sponsorship">Sponsorship</MenuItem>
                        <MenuItem value="#previous-editions">Previous Editions</MenuItem>
                        <MenuItem value="#event-footer">Event Footer</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Paper>
    );
};

export const EventHeaderEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    const safeData = {
        logoImage: data?.logoImage ?? "",
        title: data?.title ?? "HOLLYWOOD 3.0",
        subtitle: data?.subtitle ?? "by SID Events",
        menuItems: data?.menuItems ?? [],
        ctaLabel: data?.ctaLabel ?? "BUY TICKETS",
        ctaUrl: data?.ctaUrl ?? "#",
    };

    const updateField = (field: keyof EventHeaderData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    // Menu Item Handlers
    const handleAddMenuItem = () => {
        const newItem: MenuItem = {
            id: Date.now().toString(),
            label: "New Link",
            url: "#"
        };
        updateField("menuItems", [...safeData.menuItems, newItem]);
    };

    const handleUpdateMenuItem = (id: string, field: keyof MenuItem, value: any) => {
        const newItems = safeData.menuItems.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateField("menuItems", newItems);
    };

    const handleDeleteMenuItem = (id: string) => {
        updateField(
            "menuItems",
            safeData.menuItems.filter((item) => item.id !== id)
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = safeData.menuItems.findIndex((item) => item.id === active.id);
            const newIndex = safeData.menuItems.findIndex((item) => item.id === over?.id);
            updateField("menuItems", arrayMove(safeData.menuItems, oldIndex, newIndex));
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Event Header Settings</Typography>

            <Stack spacing={3}>
                {/* Branding Section */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Branding</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Event Title"
                            value={safeData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Subtitle / Organizer"
                            value={safeData.subtitle}
                            onChange={(e) => updateField("subtitle", e.target.value)}
                            fullWidth
                        />
                        <Box>
                            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>Logo Image</Typography>
                            <ShopifyImagePicker
                                value={safeData.logoImage}
                                onChange={(value) => updateField("logoImage", value)}
                            />
                        </Box>
                    </Stack>
                </Box>

                <Divider />

                {/* Call To Action */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Call To Action Button</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Button Label"
                            value={safeData.ctaLabel}
                            onChange={(e) => updateField("ctaLabel", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Button URL"
                            value={safeData.ctaUrl}
                            onChange={(e) => updateField("ctaUrl", e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </Box>

                <Divider />

                {/* Navigation Menu */}
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle1">Navigation Menu</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleAddMenuItem}
                        >
                            Add Link
                        </Button>
                    </Box>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={safeData.menuItems.map((item) => item.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {safeData.menuItems.map((item) => (
                                <SortableMenuItem
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    onChange={handleUpdateMenuItem}
                                    onDelete={handleDeleteMenuItem}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </Box>
            </Stack>
        </Box>
    );
};
