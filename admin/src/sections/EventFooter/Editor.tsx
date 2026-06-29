import React from "react";
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

interface EventFooterData {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;

    address?: string;
    email?: string;
    phone?: string;
    copyright?: string;

    menuItems?: MenuItem[];

    // Social Links
    facebookUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    behanceUrl?: string;
}

interface EditorProps {
    data: EventFooterData;
    onChange: (data: EventFooterData) => void;
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
                <TextField
                    label="URL"
                    value={item.url}
                    onChange={(e) => onChange(id, "url", e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="e.g., https://example.com or #section-id"
                />
            </Box>
        </Paper>
    );
};

export const EventFooterEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    const safeData = {
        title: data?.title ?? "Art Comes First",
        description: data?.description ?? "We shape distinctive success stories with breakthrough ideas and creative mastery...",
        ctaText: data?.ctaText ?? "Got A Project? Let's Talk",
        ctaUrl: data?.ctaUrl ?? "#",

        address: data?.address ?? "24 Tue Tinh Street, Cua Nam Ward, Hanoi.\n9 Doan Van Bo, Xom Chieu Ward, Ho Chi Minh City.",
        email: data?.email ?? "info@zeitmedia.vn",
        phone: data?.phone ?? "(+84) 84 848 8686",
        copyright: data?.copyright ?? "2025 ZEIT MEDIA. ALL RIGHTS RESERVED",

        menuItems: data?.menuItems ?? [],

        facebookUrl: data?.facebookUrl ?? "",
        instagramUrl: data?.instagramUrl ?? "",
        linkedinUrl: data?.linkedinUrl ?? "",
        twitterUrl: data?.twitterUrl ?? "",
    };

    const updateField = (field: keyof EventFooterData, value: any) => {
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
            <Typography variant="h6" sx={{ mb: 2 }}>Event Footer Settings</Typography>

            <Stack spacing={3}>
                {/* Main Content */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Main Content</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Title / Tagline"
                            value={safeData.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={safeData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Stack>
                </Box>

                <Divider />

                {/* Call To Action */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Call To Action Box</Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="CTA Text"
                            value={safeData.ctaText}
                            onChange={(e) => updateField("ctaText", e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="CTA URL"
                            value={safeData.ctaUrl}
                            onChange={(e) => updateField("ctaUrl", e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </Box>

                <Divider />

                {/* Contact Info */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Contact Information</Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Address"
                            value={safeData.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Email"
                                value={safeData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Phone"
                                value={safeData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                fullWidth
                            />
                        </Stack>
                        <TextField
                            label="Copyright Text"
                            value={safeData.copyright}
                            onChange={(e) => updateField("copyright", e.target.value)}
                            fullWidth
                        />
                    </Stack>
                </Box>

                <Divider />

                {/* Social Links */}
                <Box>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>Social Media Links</Typography>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <TextField label="Facebook URL" value={safeData.facebookUrl} onChange={(e) => updateField("facebookUrl", e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={6}>
                            <TextField label="Instagram URL" value={safeData.instagramUrl} onChange={(e) => updateField("instagramUrl", e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={6}>
                            <TextField label="LinkedIn URL" value={safeData.linkedinUrl} onChange={(e) => updateField("linkedinUrl", e.target.value)} fullWidth />
                        </Grid>
                        <Grid size={6}>
                            <TextField label="Twitter URL" value={safeData.twitterUrl} onChange={(e) => updateField("twitterUrl", e.target.value)} fullWidth />
                        </Grid>
                    </Grid>
                </Box>

                <Divider />

                {/* Navigation Menu */}
                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Typography variant="subtitle1">Footer Menu Links</Typography>
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
