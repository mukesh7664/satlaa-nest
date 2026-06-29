import React from "react";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";
import ShopifyVideoPicker from "@/components/ShopifyVideoPicker";
import {
    TextField,
    Box,
    IconButton,
    Button,
    Typography,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Switch,
    FormControlLabel,
    Slider,
    Stack,
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

interface ButtonItem {
    id: string;
    label: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
}

interface EventHeroData {
    backgroundVideo?: string;
    backgroundImage?: string;
    sponsorText?: string;
    logoImage?: string;
    subtitle?: string;
    eventDateText?: string;
    locationText?: string;
    extraInfoText?: string;
    targetDate?: string; // ISO date string for countdown
    buttons?: ButtonItem[];
    gradientStart?: string;
    gradientMiddle?: string;
    gradientEnd?: string;
    gradientDirection?: string;
    patternEnabled?: boolean;
    patternOpacity?: number;
    patternColor?: string;
}

interface EditorProps {
    data: EventHeroData;
    onChange: (data: EventHeroData) => void;
}

const SortableButtonItem = ({
    id,
    button,
    index,
    onChange,
    onDelete
}: {
    id: string;
    button: ButtonItem;
    index: number;
    onChange: (id: string, field: keyof ButtonItem, value: any) => void;
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
            variant="outlined"
            className="p-3 mb-2 flex gap-3 bg-white"
        >
            <div className="flex flex-col items-center gap-1 pt-1">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-slate-400 hover:text-slate-600"
                >
                    <DragHandle />
                </div>
                <IconButton onClick={() => onDelete(id)} color="error" size="small">
                    <DeleteIcon />
                </IconButton>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
                <TextField
                    label="Label"
                    size="small"
                    value={button.label}
                    onChange={(e) => onChange(id, "label", e.target.value)}
                    fullWidth
                />
                <TextField
                    label="URL"
                    size="small"
                    value={button.url}
                    onChange={(e) => onChange(id, "url", e.target.value)}
                    fullWidth
                />
            </div>
        </Paper>
    );
};

export const EventHeroEditor: React.FC<EditorProps> = ({ data, onChange }) => {
    // Ensure default data structure
    const safeData = {
        backgroundVideo: data?.backgroundVideo ?? "",
        backgroundImage: data?.backgroundImage ?? "",
        sponsorText: data?.sponsorText ?? "",
        logoImage: data?.logoImage ?? "",
        subtitle: data?.subtitle ?? "",
        eventDateText: data?.eventDateText ?? "",
        locationText: data?.locationText ?? "",
        extraInfoText: data?.extraInfoText ?? "",
        targetDate: data?.targetDate ?? "",
        buttons: Array.isArray(data?.buttons) ? data.buttons : [],
        gradientStart: data?.gradientStart ?? "#4a0f3d",
        gradientMiddle: data?.gradientMiddle ?? "#000000",
        gradientEnd: data?.gradientEnd ?? "#4a0f3d",
        gradientDirection: data?.gradientDirection ?? "to bottom",
        patternEnabled: data?.patternEnabled ?? true,
        patternOpacity: data?.patternOpacity ?? 0.2,
        patternColor: data?.patternColor ?? "#000000",
    };

    const directionOptions = [
        { value: "to bottom", label: "To Bottom (↓)" },
        { value: "to top", label: "To Top (↑)" },
        { value: "to right", label: "To Right (→)" },
        { value: "to left", label: "To Left (←)" },
        { value: "to bottom right", label: "To Bottom Right (↘)" },
        { value: "to bottom left", label: "To Bottom Left (↙)" },
        { value: "to top right", label: "To Top Right (↗)" },
        { value: "to top left", label: "To Top Left (↖)" },
        { value: "45deg", label: "45 Degrees" },
        { value: "90deg", label: "90 Degrees" },
        { value: "135deg", label: "135 Degrees" },
        { value: "180deg", label: "180 Degrees" },
        { value: "225deg", label: "225 Degrees" },
        { value: "270deg", label: "270 Degrees" },
        { value: "315deg", label: "315 Degrees" },
    ];

    const updateField = (field: keyof EventHeroData, value: any) => {
        onChange({ ...safeData, [field]: value });
    };

    const addButton = () => {
        const newButton: ButtonItem = {
            id: Date.now().toString(),
            label: "New Button",
            url: "#",
            variant: "primary"
        };
        updateField("buttons", [...safeData.buttons, newButton]);
    };

    const updateButton = (id: string, field: keyof ButtonItem, value: any) => {
        const updatedButtons = safeData.buttons.map((b) =>
            b.id === id ? { ...b, [field]: value } : b
        );
        updateField("buttons", updatedButtons);
    };

    const deleteButton = (id: string) => {
        const updatedButtons = safeData.buttons.filter((b) => b.id !== id);
        updateField("buttons", updatedButtons);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = safeData.buttons.findIndex(
                (b) => b.id === active.id
            );
            const newIndex = safeData.buttons.findIndex(
                (b) => b.id === over?.id
            );
            updateField("buttons", arrayMove(safeData.buttons, oldIndex, newIndex));
        }
    };

    return (
        <div className="space-y-6">
            {/* Visuals Section */}
            <div className="flex flex-col gap-5 border rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800">Visuals</h3>
                <div className="border-t pt-4 mt-2">
                    <h4 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">Background Gradient</h4>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Set the start, middle, and end colors, and choose the direction to control the angle of the color flow.
                    </Typography>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Start Color"
                            type="color"
                            size="small"
                            fullWidth
                            value={safeData.gradientStart}
                            onChange={(e) => updateField("gradientStart", e.target.value)}
                            helperText="Top/Start Color"
                        />
                        <TextField
                            label="Middle Color"
                            type="color"
                            size="small"
                            fullWidth
                            value={safeData.gradientMiddle}
                            onChange={(e) => updateField("gradientMiddle", e.target.value)}
                            helperText="Middle Color"
                        />
                        <TextField
                            label="End Color"
                            type="color"
                            size="small"
                            fullWidth
                            value={safeData.gradientEnd}
                            onChange={(e) => updateField("gradientEnd", e.target.value)}
                            helperText="Bottom/End Color"
                        />

                        <FormControl size="small" fullWidth>
                            <InputLabel id="gradient-direction-label">Direction</InputLabel>
                            <Select
                                labelId="gradient-direction-label"
                                value={safeData.gradientDirection}
                                label="Direction"
                                onChange={(e) => updateField("gradientDirection", e.target.value)}
                            >
                                {directionOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                                Controls the angle of the gradient flow
                            </Typography>
                        </FormControl>
                    </div>
                </div>
                <ShopifyVideoPicker
                    label="Background Video"
                    value={safeData.backgroundVideo}
                    onChange={(url) => updateField("backgroundVideo", url)}
                />
                <ShopifyImagePicker
                    label="Event Logo/Title Image"
                    value={safeData.logoImage}
                    onChange={(url) => updateField("logoImage", url)}
                />


            </div>


            <div className="flex flex-col gap-5 border rounded-lg p-4 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800">Event Details</h3>
                <TextField
                    label="Sponsor Text (e.g. PEPSI presents)"
                    size="small"
                    fullWidth
                    value={safeData.sponsorText}
                    onChange={(e) => updateField("sponsorText", e.target.value)}
                />
                <TextField
                    label="Subtitle (e.g. 20 Years at Daresbury)"
                    size="small"
                    fullWidth
                    value={safeData.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                />
                <div className="flex flex-col gap-4">
                    <TextField
                        label="Event Date Text"
                        size="small"
                        fullWidth
                        value={safeData.eventDateText}
                        onChange={(e) => updateField("eventDateText", e.target.value)}
                        helperText="e.g. Thu 27 - Sun 30 August"
                    />
                    <TextField
                        label="Extra Info Text"
                        size="small"
                        fullWidth
                        value={safeData.extraInfoText}
                        onChange={(e) => updateField("extraInfoText", e.target.value)}
                        helperText="e.g. Bank Holiday Weekend"
                    />
                </div>
                <TextField
                    label="Location Text"
                    size="small"
                    fullWidth
                    value={safeData.locationText}
                    onChange={(e) => updateField("locationText", e.target.value)}
                />
                <TextField
                    label="Countdown Target Date"
                    type="datetime-local"
                    size="small"
                    fullWidth
                    value={safeData.targetDate}
                    onChange={(e) => updateField("targetDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </div>

            <div className="flex flex-col gap-5 border rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">Calls to Action</h3>
                    <Button startIcon={<AddIcon />} size="small" onClick={addButton}>
                        Add Button
                    </Button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={safeData.buttons.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div>
                            {safeData.buttons.map((button, index) => (
                                <SortableButtonItem
                                    key={button.id}
                                    id={button.id}
                                    button={button}
                                    index={index}
                                    onChange={updateButton}
                                    onDelete={deleteButton}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
};
