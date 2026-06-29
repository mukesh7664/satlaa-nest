import React from "react";
import {
  TextField,
  Stack,
  Typography,
  IconButton,
  Button
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import DynamicFilterPicker from "@/components/DynamicFilterPicker";

interface TopPicksEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const TopPicksEditor: React.FC<TopPicksEditorProps> = ({ data, onChange }) => {
  const rawTabs = data.tabs || ["New Arrivals", "Best Sellers", "On Sale"];
  const tabSettings = data.tabSettings || {};

  // Normalize: if tabs is an array of strings, convert to dynamic array of objects
  const tabs = React.useMemo(() => {
    if (rawTabs.length > 0 && typeof rawTabs[0] === "string") {
      return (rawTabs as string[]).map((tabName) => ({
        name: tabName,
        filter: tabSettings[tabName]?.filter || null,
        limit: tabSettings[tabName]?.limit || 8
      }));
    }
    return (rawTabs as Array<{ name: string; filter: any; limit?: number }>) || [];
  }, [rawTabs, tabSettings]);

  const updateTabName = (idx: number, name: string) => {
    const newTabs = [...tabs];
    newTabs[idx] = { ...newTabs[idx], name };
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  const updateTabField = (idx: number, field: string, value: any) => {
    const newTabs = [...tabs];
    newTabs[idx] = { ...newTabs[idx], [field]: value };
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  const addTab = () => {
    const newTabs = [
      ...tabs,
      {
        name: "New Tab Name",
        filter: null,
        limit: 8
      }
    ];
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  const removeTab = (idx: number) => {
    const newTabs = tabs.filter((_, i) => i !== idx);
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Cloth Today's Top Picks Settings
      </Typography>

      <TextField
        label="Section Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Section Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
        Dynamic Tabs Rules Configurator
      </Typography>

      {tabs.map((tab, tabIdx) => {
        return (
          <Stack key={tabIdx} spacing={2.5} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <TextField
                label="Tab Name"
                size="small"
                value={tab.name || ""}
                onChange={(e) => updateTabName(tabIdx, e.target.value)}
                sx={{ flexGrow: 1, mr: 2 }}
              />
              {tabs.length > 1 && (
                <IconButton size="small" color="error" onClick={() => removeTab(tabIdx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <DynamicFilterPicker
              label="Select Filter Option"
              value={tab.filter || null}
              onChange={(filterVal) => updateTabField(tabIdx, "filter", filterVal)}
            />

            <TextField
              label="Limit (Products count)"
              type="number"
              size="small"
              fullWidth
              value={tab.limit || 8}
              onChange={(e) => updateTabField(tabIdx, "limit", parseInt(e.target.value) || 8)}
            />
          </Stack>
        );
      })}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addTab} sx={{ mt: 1, borderRadius: 2 }}>
        Add Tab Category
      </Button>

      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Bottom Action
      </Typography>

      <Stack direction="row" spacing={2}>
        <TextField
          label="CTA Text"
          fullWidth
          size="small"
          value={data.ctaText || ""}
          onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
        />
        <TextField
          label="CTA Link"
          fullWidth
          size="small"
          value={data.ctaLink || ""}
          onChange={(e) => onChange({ ...data, ctaLink: e.target.value })}
        />
      </Stack>
    </Stack>
  );
};
