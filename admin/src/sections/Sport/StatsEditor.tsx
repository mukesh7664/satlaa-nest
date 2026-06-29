import React from "react";
import {
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

interface SportStatsEditorProps {
  data: any;
  onChange: (data: any) => void;
}

export const SportStatsEditor: React.FC<SportStatsEditorProps> = ({
  data,
  onChange,
}) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addStat = () => {
    const stats = data.stats || [];
    updateField("stats", [...stats, { value: "0", label: "New Stat" }]);
  };

  const removeStat = (index: number) => {
    const stats = [...(data.stats || [])];
    stats.splice(index, 1);
    updateField("stats", stats);
  };

  const updateStat = (index: number, field: string, value: string) => {
    const stats = [...(data.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    updateField("stats", stats);
  };

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Numerical Counters</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addStat}>Add Stat</Button>
        </Stack>
        <Grid container spacing={3}>
          {(data.stats || []).map((stat: any, index: number) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Paper variant="outlined" sx={{ p: 2, position: "relative" }}>
                <IconButton 
                  size="small" 
                  color="error" 
                  sx={{ position: "absolute", top: 8, right: 8 }}
                  onClick={() => removeStat(index)}
                >
                  <DeleteIcon />
                </IconButton>
                <Stack spacing={2}>
                  <TextField
                    label="Value (e.g. 10+)"
                    fullWidth
                    size="small"
                    value={stat.value || ""}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                  />
                  <TextField
                    label="Label"
                    fullWidth
                    size="small"
                    value={stat.label || ""}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                  />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};
