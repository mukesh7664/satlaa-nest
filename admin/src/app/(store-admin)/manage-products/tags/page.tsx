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
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { tagsApi, Tag } from "@/services/tags.api";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<{ name: string }>({
    name: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTags = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await tagsApi.getAllTags({
        search: searchTerm,
      });
      setTags(response.tags || []);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({ name: tag.name });
    } else {
      setEditingTag(null);
      setFormData({ name: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTag(null);
    setFormData({ name: "" });
  };

  const handleSubmit = async () => {
    try {
      if (editingTag) {
        await tagsApi.updateTag(editingTag.id, formData.name);
        toast.success("Tag updated successfully");
      } else {
        await tagsApi.createTag(formData.name);
        toast.success("Tag created successfully");
      }

      handleCloseDialog();
      fetchTags();
    } catch (error: any) {
      console.error("Failed to save tag:", error);
      toast.error(error.message || "Failed to save tag");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;

    try {
      await tagsApi.deleteTag(id);
      toast.success("Tag deleted successfully");
      fetchTags();
    } catch (error: any) {
      console.error("Failed to delete tag:", error);
      toast.error(error.message || "Failed to delete tag");
    }
  };

  // Pagination logic (client-side for now as API returns all tags)
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredTags = tags; // Search is handled by API
  const paginatedTags = filteredTags.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Product Tags</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage tags for your products
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
          Add Tag
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <TextField
          placeholder="Search tags..."
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
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : paginatedTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-slate-500 font-medium">
                        No tags found
                      </p>
                      <p className="text-slate-400 text-sm">
                        Try adjusting your search or add a new tag
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTags.map((tag) => (
                  <TableRow
                    key={tag.id}
                    hover
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell>
                      <span className="font-medium text-slate-700">
                        {tag.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {tag.slug}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(tag)}
                          sx={{ color: "#3b82f6" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(tag.id)}
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
          count={filteredTags.length}
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
          {editingTag ? "Edit Tag" : "Add Tag"}
        </DialogTitle>
        <DialogContent>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Tag Name <span className="text-red-500">*</span>
            </label>
            <TextField
              placeholder="Enter tag name"
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
              "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
              textTransform: "none",
            }}
          >
            {editingTag ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
