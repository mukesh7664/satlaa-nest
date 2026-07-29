import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Stack,
  Tooltip,
  Pagination,
  Checkbox,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { sectionApi, ISectionType } from "@/services/section.api";

interface SectionPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (sections: ISectionType | ISectionType[]) => void;
  category?: string;
  storeId?: string;
}

export default function SectionPicker({
  open,
  onClose,
  onSelect,
  category,
  storeId,
}: SectionPickerProps) {
  const [sections, setSections] = useState<ISectionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState<ISectionType[]>([]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await sectionApi.getAll({
        search,
        category,
        storeId,
        page,
        limit: 10
      });
      setSections(response.data);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSections();
    }
  }, [open, search, category, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handlePreview = (thumbnail: string) => {
    setPreviewImage(thumbnail);
    setPreviewOpen(true);
  };

  const handleToggleSelection = (section: ISectionType) => {
    const currentIndex = selectedSections.findIndex((s) => s.id === section.id);
    const newSelected = [...selectedSections];
    if (currentIndex === -1) {
      newSelected.push(section);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedSections(newSelected);
  };

  const handleConfirmSelection = () => {
    if (selectedSections.length > 0) {
      onSelect(selectedSections);
      setSelectedSections([]);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Select {category === "header" ? "a Header" : category === "footer" ? "a Footer" : "a Section"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2, mt: 1 }}
          />

          <Box sx={{ minHeight: 450, position: "relative", mt: 1 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 450,
                  gap: 2
                }}
              >
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">
                  Loading sections...
                </Typography>
              </Box>
            ) : sections.length === 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
                <Typography color="text.secondary">
                  No sections found.
                </Typography>
              </Box>
            ) : (
              <List sx={{ pb: 0 }}>
                {sections.map((section) => (
                  <ListItem
                    key={section.id}
                    sx={{
                      border: "1px solid #eee",
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {section.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {section.type}
                          </Typography>
                        </Stack>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {section.thumbnail && (
                          <Tooltip title="View Preview">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handlePreview(section.thumbnail!)}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            onSelect(section);
                            onClose();
                          }}
                          sx={{
                            boxShadow: "none",
                            px: 2,
                            "&:hover": { boxShadow: "none" },
                          }}
                        >
                          SELECT
                        </Button>
                        <Checkbox
                          edge="end"
                          checked={selectedSections.some((s) => s.id === section.id)}
                          onChange={() => handleToggleSelection(section)}
                        />
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSelectedSections([]);
            onClose();
          }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSelection}
            disabled={selectedSections.length === 0}
          >
            Add Selected ({selectedSections.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Section Preview
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Section Preview"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                display: "block",
                mx: "auto",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
