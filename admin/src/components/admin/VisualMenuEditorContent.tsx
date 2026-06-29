"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ShopifyImagePicker from "@/components/ShopifyImagePicker";

type PathSegment = string | number;

interface VisualMenuEditorContentProps {
    menuData: any;
    menuType: string;
    onChange: (newData: any) => void;
}

export const VisualMenuEditorContent: React.FC<VisualMenuEditorContentProps> = ({
    menuData,
    menuType,
    onChange,
}) => {
    const updateMenuDataState = (mutator: (draft: any) => void) => {
        const draft = JSON.parse(JSON.stringify(menuData || {}));
        mutator(draft);
        onChange(draft);
    };

    const updateNestedValue = (path: PathSegment[], value: any) => {
        if (!path.length) return;
        updateMenuDataState((draft) => {
            let current = draft;
            for (let i = 0; i < path.length - 1; i++) {
                const key = path[i] as any;
                if (current[key] === undefined) {
                    current[key] = typeof path[i + 1] === "number" ? [] : {};
                }
                current = current[key];
            }
            current[path[path.length - 1] as any] = value;
        });
    };

    const ensurePath = (
        draft: any,
        path: PathSegment[],
        finalInitializer?: () => any
    ) => {
        let current = draft;
        for (let i = 0; i < path.length; i++) {
            const key = path[i] as any;
            const isLast = i === path.length - 1;
            if (current[key] === undefined) {
                if (isLast && finalInitializer) {
                    current[key] = finalInitializer();
                } else {
                    const nextKey = path[i + 1];
                    current[key] = typeof nextKey === "number" ? [] : {};
                }
            }
            current = current[key];
        }
        return current;
    };

    const addArrayItem = (path: PathSegment[], newItem: any) => {
        updateMenuDataState((draft) => {
            const target = ensurePath(draft, path, () => []);
            if (Array.isArray(target)) {
                target.push(newItem);
            }
        });
    };

    const removeArrayItem = (path: PathSegment[], index: number) => {
        updateMenuDataState((draft) => {
            const target = ensurePath(draft, path, () => []);
            if (Array.isArray(target)) {
                target.splice(index, 1);
            }
        });
    };

    const renderIconUploader = (
        currentUrl: string,
        path: PathSegment[]
    ) => (
        <ShopifyImagePicker
            label="Icon"
            value={currentUrl || ""}
            onChange={(url) => updateNestedValue(path, url)}
        />
    );

    const renderDynamicMenu = () => {
        const columns = (menuData?.columns as any[]) || [];
        return (
            <Box>
                <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">
                    Mega Menu Layout (Columns)
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Each column represents a category in the mega menu. You can add multiple links inside each column.
                </Alert>
                
                <Stack spacing={3}>
                    {columns.map((column: any, colIndex: number) => (
                        <Card key={colIndex} sx={{ p: 3, position: "relative", border: "1px solid #e2e8f0", boxShadow: "none", bgcolor: "#fff" }}>
                            <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => removeArrayItem(["columns"], colIndex)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <Stack spacing={3}>
                                <Box display="flex" gap={2} alignItems="flex-start">
                                    <Box sx={{ flex: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Column Title"
                                            placeholder="e.g. Products, Services, Shop By Category"
                                            value={column.title || ""}
                                            onChange={(e) => updateNestedValue(["columns", colIndex, "title"], e.target.value)}
                                            sx={{ mb: 1 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            This will appear as a bold heading at the top of the column.
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 120 }}>
                                        {renderIconUploader(column.icon, ["columns", colIndex, "icon"])}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        Links in this column
                                    </Typography>
                                    
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        {(column.items || []).map((item: any, itemIndex: number) => (
                                            <Card key={itemIndex} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed" }}>
                                                <Box display="flex" gap={2}>
                                                    <Stack spacing={2} sx={{ flex: 1 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Link Name"
                                                            value={item.name || ""}
                                                            onChange={(e) => updateNestedValue(["columns", colIndex, "items", itemIndex, "name"], e.target.value)}
                                                        />
                                                        <Box display="flex" gap={2}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="URL Path"
                                                                placeholder="/products/name"
                                                                value={item.href || ""}
                                                                onChange={(e) => updateNestedValue(["columns", colIndex, "items", itemIndex, "href"], e.target.value)}
                                                            />
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                label="Description (Subtext)"
                                                                value={item.description || ""}
                                                                onChange={(e) => updateNestedValue(["columns", colIndex, "items", itemIndex, "description"], e.target.value)}
                                                            />
                                                        </Box>
                                                    </Stack>
                                                    <Stack spacing={1} alignItems="center">
                                                        <Box sx={{ width: 60, height: 60 }}>
                                                            {renderIconUploader(item.icon, ["columns", colIndex, "items", itemIndex, "icon"])}
                                                        </Box>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => removeArrayItem(["columns", colIndex, "items"], itemIndex)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </Box>
                                            </Card>
                                        ))}

                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            variant="outlined"
                                            onClick={() => addArrayItem(["columns", colIndex, "items"], { name: "", href: "", description: "", icon: "" })}
                                            sx={{ alignSelf: "flex-start", borderRadius: 2 }}
                                        >
                                            Add Link Item
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Card>
                    ))}

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => addArrayItem(["columns"], { title: "", icon: "", items: [] })}
                        sx={{ py: 1.5, borderRadius: 2, bgcolor: "#1e293b", "&:hover": { bgcolor: "#0f172a" } }}
                    >
                        Add New Column Category
                    </Button>
                </Stack>
            </Box>
        );
    };

    const renderMenuByType = () => {
        switch (menuType) {
            case "dynamic":
                return renderDynamicMenu();
            default:
                return (
                    <Box>
                         <Alert severity="warning" sx={{ mb: 2 }}>
                            This menu is using a legacy type or no type. Switching to Dynamic Menu editor.
                        </Alert>
                        {renderDynamicMenu()}
                    </Box>
                );
        }
    };

    return (
        <Box sx={{ py: 1 }}>
            {renderMenuByType()}
        </Box>
    );
};
