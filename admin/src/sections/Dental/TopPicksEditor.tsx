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
  const tabs = data.tabs || [];

  const updateTabCategory = (idx: number, category: string) => {
    const newTabs = [...tabs];
    newTabs[idx] = { ...newTabs[idx], category };
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
        category: "New Tab Category",
        filter: null,
        limitFilter: 8
      }
    ];
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  const removeTab = (idx: number) => {
    const newTabs = tabs.filter((_: any, i: number) => i !== idx);
    onChange({ ...data, tabs: newTabs, productsSource: "dynamic" });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" color="primary" fontWeight="bold">
        Dental Top Picks Catalog Settings
      </Typography>

      <TextField
        label="Title"
        fullWidth
        size="small"
        value={data.title || ""}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
      />

      <TextField
        label="Subtitle"
        fullWidth
        size="small"
        value={data.subtitle || ""}
        onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
      />

      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
        Catalog Tab Rules
      </Typography>

      {tabs.map((tab: any, tabIdx: number) => (
        <Stack key={tabIdx} spacing={2.5} sx={{ p: 2, border: "1px solid #eaeaea", borderRadius: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <TextField
              label="Tab Category Name"
              size="small"
              value={tab.category || ""}
              onChange={(e) => updateTabCategory(tabIdx, e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }}
            />
            {tabs.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeTab(tabIdx)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <DynamicFilterPicker
            label="Select Dynamic Filter Rule"
            value={tab.filter || null}
            onChange={(filterVal) => updateTabField(tabIdx, "filter", filterVal)}
          />

          <TextField
            label="Limit (Products count)"
            type="number"
            size="small"
            fullWidth
            value={tab.limitFilter || 8}
            onChange={(e) => updateTabField(tabIdx, "limitFilter", parseInt(e.target.value) || 8)}
          />
        </Stack>
      ))}

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addTab} sx={{ mt: 1, borderRadius: 2 }}>
        Add Tab Category
      </Button>
    </Stack>
  );
};
