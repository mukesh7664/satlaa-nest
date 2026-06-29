"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings, updateSettings } from "@/store/slices/settingsSlice";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Switch,
    Checkbox,
    Fab,
    Chip,
    Alert,
    Pagination,
    Tabs,
    Tab,
    Badge,
    LinearProgress,
    CircularProgress,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
} from "@mui/material";
import { toast } from "sonner";
import AddIcon from '@mui/icons-material/Add';
import MailIcon from '@mui/icons-material/Mail';

const colorKeys = [
    "primary",
    "secondary",
    "error",
    "warning",
    "info",
    "success",
] as const;

const PALETTE_DEFAULTS: Record<string, string> = {
    primary: '#1976d2',
    secondary: '#9c27b0',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
};

const PALETTE_LABELS: Record<string, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    error: 'Error / Danger',
    warning: 'Warning',
    info: 'Info',
    success: 'Success',
};

// Define desired defaults for component mappings (using keys, not hex)
const defaultComponentStyles = {
    buttonContained: 'primary',
    buttonOutlined: 'primary',
    buttonText: 'primary',
    checkbox: 'primary',
    switch: 'primary',
    select: 'primary',
    chip: 'primary',
    alert: 'primary',
    pagination: 'primary',
    tabs: 'primary',
    badge: 'primary',
    progress: 'primary',
    fab: 'primary',
    slider: 'primary',
};

export default function ThemeSettingsPage() {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { themeColors, componentColors, loading } = useAppSelector((state) => state.settings);
    const [localColors, setLocalColors] = useState<any>({ ...themeColors, ...componentColors });
    const [hasChanges, setHasChanges] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        setLocalColors({ ...themeColors, ...componentColors });
    }, [themeColors, componentColors]);

    const handleColorChange = (key: string, value: string) => {
        setLocalColors((prev: any) => ({
            ...prev,
            [key]: value,
        }));
        setHasChanges(true);
    };

    const handleResetClick = () => {
        setResetDialogOpen(true);
    };

    const handleConfirmReset = async () => {
        try {
            await dispatch(updateSettings({
                themeColors: themeColors, // Keep existing palette
                componentColors: defaultComponentStyles
            })).unwrap();

            toast.success("Component styles reset to defaults");
            setResetDialogOpen(false);
        } catch (error) {
            toast.error("Failed to reset settings");
            console.error(error);
        }
    };

    const handleSave = async () => {
        try {
            // Split back into theme and component colors
            const newThemeColors = { ...themeColors };
            const newComponentColors = {
                buttonContained: localColors.buttonContained,
                buttonOutlined: localColors.buttonOutlined,
                buttonText: localColors.buttonText,
                checkbox: localColors.checkbox,
                switch: localColors.switch,
                select: localColors.select,
                chip: localColors.chip,
                alert: localColors.alert,
                pagination: localColors.pagination,
                tabs: localColors.tabs,
                badge: localColors.badge,
                progress: localColors.progress,
            };

            colorKeys.forEach(key => {
                if (localColors[key]) newThemeColors[key] = localColors[key];
            });

            await dispatch(updateSettings({
                themeColors: newThemeColors,
                componentColors: newComponentColors as any
            })).unwrap();
            toast.success("Theme colors updated successfully");
            setHasChanges(false);
        } catch (error) {
            toast.error("Failed to update theme colors");
            console.error(error);
        }
    };

    const renderColorSelect = (key: string, label: string, previewComponent: React.ReactNode) => {
        const currentValue = localColors[key] || 'primary';
        const isCustom = !colorKeys.includes(currentValue as any);

        return (
            <div className="flex flex-col gap-2 p-2 2xl:p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between min-h-[44px] gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700" style={{ fontSize: '13px' }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center min-w-[80px]">
                            {previewComponent}
                        </div>
                        <Select
                            value={isCustom ? 'custom' : currentValue}
                            onChange={(e) => {
                                const val = e.target.value as string;
                                if (val === 'custom') {
                                    handleColorChange(key, isCustom ? currentValue : '#000000');
                                } else {
                                    handleColorChange(key, val);
                                }
                            }}
                            size="small"
                            sx={{
                                height: 32,
                                fontSize: '11px',
                                minWidth: 100,
                                fontWeight: 'bold',
                                color: '#475569',
                                bgcolor: '#f8fafc',
                                borderRadius: '8px',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#cbd5e1',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#3b82f6',
                                }
                            }}
                        >
                            {colorKeys.map(k => (
                                <MenuItem key={k} value={k} sx={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
                                    {k.charAt(0).toUpperCase() + k.slice(1)}
                                </MenuItem>
                            ))}
                            <MenuItem value="custom" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Custom</MenuItem>
                        </Select>
                    </div>
                </div>

                {isCustom && (
                    <div className="flex items-center gap-2 mt-2 justify-end bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500 font-medium">Hex Color:</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={currentValue}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                            />
                            <input
                                type="text"
                                value={currentValue}
                                onChange={(e) => handleColorChange(key, e.target.value)}
                                className="border rounded px-2 py-1 text-sm w-24 uppercase"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Resolve a component key (e.g. 'buttonContained') to an actual hex color with fallback
    const resolveColor = (key: string): string => {
        const val = localColors[key];
        if (!val) return PALETTE_DEFAULTS['primary'];
        // If it's a palette key like 'primary', resolve via localColors (which merges themeColors + componentColors)
        if (colorKeys.includes(val as any)) {
            return localColors[val] || themeColors[val as keyof typeof themeColors] || PALETTE_DEFAULTS[val] || PALETTE_DEFAULTS['primary'];
        }
        // It's already a hex string
        return val;
    };
    const checkColor = (key: string) => `${resolveColor(key)} !important`;

    return (
        <>
            <style>
                {`
                  .MuiOutlinedInput-root {
                    border-radius: 8px !important;
                  }
                `}
            </style>
            <div className="max-w-6xl mx-auto flex flex-col gap-4 2xl:gap-8 pb-12 text-slate-800">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Theme Settings</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Configure your default theme colors and component mappings.</p>
                    </div>
                    <Button
                        variant="outlined"
                        onClick={handleResetClick}
                        disabled={loading}
                        size="small"
                        sx={{
                            fontSize: { xs: 11, '2xl': 13 },
                            borderRadius: '8px',
                            borderColor: checkColor("buttonOutlined"),
                            color: checkColor("buttonOutlined"),
                            "&:hover": {
                                borderColor: checkColor("buttonOutlined"),
                                bgcolor: `${checkColor("buttonOutlined")}10`,
                            },
                        }}
                    >
                        Reset Palette to Defaults
                    </Button>
                </div>
    
                <Dialog
                    open={resetDialogOpen}
                    onClose={() => setResetDialogOpen(false)}
                    PaperProps={{ sx: { borderRadius: '12px' } }}
                >
                    <DialogTitle sx={{ fontWeight: 'bold' }}>Reset Component Styles?</DialogTitle>
                    <DialogContent>
                        <DialogContentText className="text-slate-500 text-xs">
                            Are you sure you want to reset all component styles to their default values? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 1 }}>
                        <Button 
                            onClick={() => setResetDialogOpen(false)} 
                            color="inherit"
                            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleConfirmReset} 
                            color="error" 
                            variant="contained"
                            sx={{ textTransform: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}
                        >
                            Reset
                        </Button>
                    </DialogActions>
                </Dialog>
    
                <div className="w-full flex flex-col gap-4 2xl:gap-8">
                    {/* Palette Colors */}
                    <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardHeader
                            title="Palette Colors"
                            subheader="Set the base hex colors for your theme palette"
                            titleTypographyProps={{ sx: { fontSize: { xs: '1rem', '2xl': '1.25rem' }, fontWeight: 700 } }}
                            subheaderTypographyProps={{ sx: { fontSize: { xs: '0.75rem', '2xl': '0.875rem' } } }}
                            sx={{ p: { xs: 1.5, '2xl': 3 }, pb: 0 }}
                        />
                        <CardContent sx={{ p: { xs: 1.5, '2xl': 3 } }}>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 2xl:gap-6">
                                {colorKeys.map((key) => {
                                    const hex = localColors[key] || PALETTE_DEFAULTS[key];
                                    return (
                                        <div key={key} className="flex items-center justify-between p-2 2xl:p-3 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow gap-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-8 h-8 rounded-lg border border-slate-200 flex-shrink-0"
                                                    style={{ backgroundColor: hex }}
                                                />
                                                <span className="font-bold text-slate-700" style={{ fontSize: '13px' }}>
                                                    {PALETTE_LABELS[key]}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={hex}
                                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={hex}
                                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs w-20 uppercase font-mono bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    placeholder="#1976d2"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
    
                    {/* Basic Inputs */}
                    <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardHeader 
                            title="Inputs & Buttons" 
                            subheader="Map buttons and inputs to palette colors"
                            titleTypographyProps={{ sx: { fontSize: { xs: '1rem', '2xl': '1.25rem' }, fontWeight: 700 } }}
                            subheaderTypographyProps={{ sx: { fontSize: { xs: '0.75rem', '2xl': '0.875rem' } } }}
                            sx={{ p: { xs: 1.5, '2xl': 3 }, pb: 0 }}
                        />
                        <CardContent sx={{ p: { xs: 1.5, '2xl': 3 } }}>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 2xl:gap-6">
                            {renderColorSelect('buttonContained', 'Button Contained', (
                                <Button variant="contained" size="small" sx={{ borderRadius: '8px', bgcolor: checkColor('buttonContained'), '&:hover': { bgcolor: checkColor('buttonContained'), filter: 'brightness(0.9)' } }}>Preview</Button>
                            ))}
                            {renderColorSelect('buttonOutlined', 'Button Outlined', (
                                <Button variant="outlined" size="small" sx={{ borderRadius: '8px', borderColor: checkColor('buttonOutlined'), color: checkColor('buttonOutlined') }}>Preview</Button>
                            ))}
                            {renderColorSelect('buttonText', 'Button Text', (
                                <Button variant="text" size="small" sx={{ borderRadius: '8px', color: checkColor('buttonText') }}>Preview</Button>
                            ))}
                            {renderColorSelect('checkbox', 'Checkbox', (
                                <Checkbox defaultChecked sx={{ color: checkColor('checkbox'), '&.Mui-checked': { color: checkColor('checkbox') } }} />
                            ))}
                            {renderColorSelect('switch', 'Switch', (
                                <Switch defaultChecked sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: checkColor('switch') }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: checkColor('switch') } }} />
                            ))}
                            {renderColorSelect('select', 'Select / Input', (
                                <FormControl size="small" sx={{ width: 100 }}>
                                    <Select
                                        defaultValue={10}
                                        sx={{
                                            height: 32,
                                            fontSize: '11px',
                                            borderRadius: '8px',
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: checkColor('select') }
                                        }}
                                    >
                                        <MenuItem value={10} sx={{ fontSize: '11px' }}>Ten</MenuItem>
                                        <MenuItem value={20} sx={{ fontSize: '11px' }}>Twenty</MenuItem>
                                        <MenuItem value={30} sx={{ fontSize: '11px' }}>Thirty</MenuItem>
                                    </Select>
                                </FormControl>
                            ))}
    
                            </div>
                        </CardContent>
                    </Card>
    
                    {/* Status & Feedback */}
                    <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardHeader 
                            title="Status & Feedback" 
                            subheader="Map chips, alerts, badges to palette colors"
                            titleTypographyProps={{ sx: { fontSize: { xs: '1rem', '2xl': '1.25rem' }, fontWeight: 700 } }}
                            subheaderTypographyProps={{ sx: { fontSize: { xs: '0.75rem', '2xl': '0.875rem' } } }}
                            sx={{ p: { xs: 1.5, '2xl': 3 }, pb: 0 }}
                        />
                        <CardContent sx={{ p: { xs: 1.5, '2xl': 3 } }}>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 2xl:gap-6">
                            {renderColorSelect('progress', 'Progress Indicators', (
                                <div className="flex gap-2 items-center">
                                    <CircularProgress size={20} sx={{ color: checkColor('progress') }} />
                                    <LinearProgress sx={{ width: 50, bgcolor: checkColor('progress'), '& .MuiLinearProgress-bar': { bgcolor: checkColor('progress'), filter: 'brightness(0.8)' } }} />
                                </div>
                            ))}
                            </div>
                        </CardContent>
                    </Card>
    
                    {/* Navigation */}
                    <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                        <CardHeader 
                            title="Navigation" 
                            subheader="Map tabs and pagination to palette colors"
                            titleTypographyProps={{ sx: { fontSize: { xs: '1rem', '2xl': '1.25rem' }, fontWeight: 700 } }}
                            subheaderTypographyProps={{ sx: { fontSize: { xs: '0.75rem', '2xl': '0.875rem' } } }}
                            sx={{ p: { xs: 1.5, '2xl': 3 }, pb: 0 }}
                        />
                        <CardContent sx={{ p: { xs: 1.5, '2xl': 3 } }}>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 2xl:gap-6">
                            {renderColorSelect('tabs', 'Tabs', (
                                <Tabs value={0} textColor="inherit" sx={{ '& .MuiTabs-indicator': { bgcolor: checkColor('tabs') }, '& .Mui-selected': { color: checkColor('tabs') } }}>
                                    <Tab label="Item One" />
                                </Tabs>
                            ))}
                            {renderColorSelect('pagination', 'Pagination', (
                                <Pagination count={3} defaultPage={1} sx={{ '& .Mui-selected': { bgcolor: checkColor('pagination'), color: '#fff' } }} />
                            ))}
                            </div>
                        </CardContent>
                    </Card>
    
                    <div className="mt-2 2xl:mt-6 flex justify-end">
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={loading || !hasChanges}
                            size={pathname.includes('settings') ? 'small' : 'medium'}
                            sx={{
                                px: { xs: 4, '2xl': 8 },
                                py: { xs: 1, '2xl': 1.5 },
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: { xs: 12, '2xl': 14 }
                            }}
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
