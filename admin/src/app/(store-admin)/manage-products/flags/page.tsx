"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ColorLens as ColorIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { flagsApi, Flag } from "@/services/flags.api";

export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
  const [formData, setFormData] = useState<{ name: string; color: string }>({
    name: "",
    color: "#667eea",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFlags = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await flagsApi.getAllFlags({
        search: searchTerm,
      });
      setFlags(response.flags || []);
    } catch (error) {
      console.error("Failed to fetch flags:", error);
      toast.error("Failed to load flags");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleOpenDialog = (flag?: Flag) => {
    if (flag) {
      setEditingFlag(flag);
      setFormData({ name: flag.name, color: flag.color || "#667eea" });
    } else {
      setEditingFlag(null);
      setFormData({ name: "", color: "#667eea" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingFlag(null);
    setFormData({ name: "", color: "#667eea" });
  };

  const handleSubmit = async () => {
    try {
      if (editingFlag) {
        await flagsApi.updateFlag(
          editingFlag.id,
          formData.name,
          formData.color
        );
        toast.success("Flag updated successfully");
      } else {
        await flagsApi.createFlag(formData.name, formData.color);
        toast.success("Flag created successfully");
      }

      handleCloseDialog();
      fetchFlags();
    } catch (error: any) {
      console.error("Failed to save flag:", error);
      toast.error(error.message || "Failed to save flag");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flag?")) return;

    try {
      await flagsApi.deleteFlag(id);
      toast.success("Flag deleted successfully");
      fetchFlags();
    } catch (error: any) {
      console.error("Failed to delete flag:", error);
      toast.error(error.message || "Failed to delete flag");
    }
  };

  // Pagination logic (client-side for now as API returns all flags)
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredFlags = flags; // Search is handled by API
  const paginatedFlags = filteredFlags.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Flags</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage flags and labels for your products
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "var(--primary)",
            "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
          }}
        >
          Add Flag
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <TextField
          placeholder="Search flags..."
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-slate-400" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              "& fieldset": { borderColor: "#e2e8f0" },
              "&:hover fieldset": { borderColor: "#cbd5e1" },
              "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
            },
          }}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Color
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Slug
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, color: "#475569" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : paginatedFlags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">
                        No flags found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your search or add a new flag
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFlags.map((flag) => (
                  <TableRow
                    key={flag.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full border border-slate-200"
                        style={{ backgroundColor: flag.color || "#667eea" }}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {flag.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {flag.slug}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(flag)}
                          sx={{ color: "#3b82f6" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(flag.id)}
                          sx={{ color: "#ef4444" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredFlags.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid #e2e8f0" }}
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingFlag ? "Edit Flag" : "Add Flag"}
        </DialogTitle>
        <DialogContent>
          <div className="mt-4 flex flex-col gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Flag Name <span className="text-red-500">*</span>
              </label>
              <TextField
                placeholder="Enter flag name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                fullWidth
                autoFocus
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                  },
                }}
              />
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Color (Hex Code)
                </label>
                <TextField
                  placeholder="#000000"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ColorIcon sx={{ color: formData.color }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Example: #FF0000"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      "& fieldset": { borderColor: "#e2e8f0" },
                      "&:hover fieldset": { borderColor: "#cbd5e1" },
                      "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
                    },
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 pt-8">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-10 w-16 cursor-pointer rounded border border-slate-300 p-1"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  Pick a color
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: "text.secondary", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
            sx={{
              bgcolor: "var(--primary)",
              "&:hover": {
                bgcolor: "var(--primary)",
                filter: "brightness(0.9)",
              },
              textTransform: "none",
            }}
          >
            {editingFlag ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
