import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Box,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
} from "@mui/material";
import axios from "axios";
import { toast } from "sonner";

interface Column {
  key: string;
  label: string;
}

interface ColumnSelectionModalProps {
  open: boolean;
  onClose: () => void;
  reportType: string;
  reportLabel: string;
  onDownload: (columns: string[], format: string) => void;
  loading: boolean;
}

const ColumnSelectionModal: React.FC<ColumnSelectionModalProps> = ({
  open,
  onClose,
  reportType,
  reportLabel,
  onDownload,
  loading,
}) => {
  const [availableColumns, setAvailableColumns] = useState<Column[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [format, setFormat] = useState<string>("csv");
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (open && reportType) {
      fetchColumns();
    }
  }, [open, reportType]);

  const fetchColumns = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/columns/${reportType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAvailableColumns(response.data);
      setSelectedColumns(response.data.map((col: Column) => col.key)); // Select all by default
    } catch (error) {
      console.error("Error fetching columns:", error);
      toast.error("Failed to fetch report configuration.");
    } finally {
      setFetching(false);
    }
  };

  const handleToggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedColumns(availableColumns.map((col) => col.key));
    } else {
      setSelectedColumns([]);
    }
  };

  const handleDownloadClick = () => {
    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column.");
      return;
    }
    onDownload(selectedColumns, format);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" className="font-bold">
          Download {reportLabel}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {fetching ? (
          <Box className="flex justify-center p-8">
            <CircularProgress />
          </Box>
        ) : (
          <Box className="flex flex-col gap-6">
            <Box>
              <FormLabel component="legend" className="mb-2 font-semibold text-slate-700">
                1. Select Format
              </FormLabel>
              <RadioGroup
                row
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                <FormControlLabel value="xlsx" control={<Radio />} label="Excel (.xlsx)" />
                <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                <FormControlLabel value="json" control={<Radio />} label="JSON" />
              </RadioGroup>
            </Box>

            <Divider />

            <Box>
              <Box className="flex justify-between items-center mb-2">
                <FormLabel component="legend" className="font-semibold text-slate-700">
                  2. Select Columns
                </FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedColumns.length === availableColumns.length && availableColumns.length > 0}
                      indeterminate={selectedColumns.length > 0 && selectedColumns.length < availableColumns.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">Select All</Typography>}
                />
              </Box>
              <FormGroup className="grid grid-cols-2 gap-x-4">
                {availableColumns.map((col) => (
                  <FormControlLabel
                    key={col.key}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedColumns.includes(col.key)}
                        onChange={() => handleToggleColumn(col.key)}
                      />
                    }
                    label={<Typography variant="body2">{col.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions className="p-4 bg-slate-50">
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleDownloadClick}
          variant="contained"
          disabled={loading || fetching}
          className="bg-slate-800 hover:bg-slate-900 normal-case px-6"
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" className="mr-2" />
          ) : null}
          Download report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnSelectionModal;
