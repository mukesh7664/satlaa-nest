"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@mui/material";
import { toast } from "sonner";
import { themesApi } from "@/services/themes.api";
import PaletteIcon from "@mui/icons-material/Palette";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<any>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const data = await themesApi.getAll();
      setThemes(data || []);
    } catch (error) {
      console.error("Failed to fetch themes:", error);
      toast.error("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };


  const handleInstallConfirm = (theme: any) => {
    setSelectedTheme(theme);
    setConfirmOpen(true);
  };

  const handleInstall = async () => {
    if (!selectedTheme) return;

    try {
      setConfirmOpen(false);
      setInstalling(selectedTheme.id);
      toast.info(`Applying ${selectedTheme.name}... Please wait.`);

      const res = await themesApi.install(selectedTheme.id);
      if (res.success) {
        toast.success("Theme applied successfully! Your home page has been updated.");
      }
    } catch (error) {
      console.error("Failed to apply theme:", error);
      toast.error("Failed to apply theme. Please try again.");
    } finally {
      setInstalling(null);
      setSelectedTheme(null);
    }
  };

  return (
    <div className="p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <PaletteIcon className="text-blue-600" />
              Theme Marketplace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Give your store a professional look with our curated site templates.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <CircularProgress size={40} thickness={4} />
            <p className="text-slate-500 animate-pulse font-medium">Fetching the latest themes...</p>
          </div>
        ) : themes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-24 text-center">
            <Box sx={{ mb: 3 }}>
              <PaletteIcon sx={{ fontSize: 80, color: 'slate.200' }} />
            </Box>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Themes Available</h2>
            <p className="text-slate-500 mb-6">Administrator hasn't added any themes to the marketplace yet.</p>
          </div>
        ) : (
          <Grid container spacing={4}>
            {themes.map((theme) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={theme.id}>
                <Card
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                  }}
                >
                  <Box sx={{ position: 'relative', height: '240px', bgcolor: '#f1f5f9' }}>
                    <CardMedia
                      component="img"
                      image={theme.previewImage}
                      alt={theme.name}
                      sx={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    />
                    {installing === theme.id && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <CircularProgress />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 4 }}>
                    <div className="flex justify-between items-start mb-3">
                      <Typography variant="h5" fontWeight="900" className="text-slate-900 tracking-tight">
                        {theme.name}
                      </Typography>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                        <CheckCircleIcon fontSize="small" sx={{ fontSize: 14 }} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
                      </div>
                    </div>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, height: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {theme.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleInstallConfirm(theme)}
                      disabled={!!installing}
                      sx={{
                        borderRadius: '8px',
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none' }
                      }}
                    >
                      {installing === theme.id ? "Applying..." : "Apply Theme"}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Change Your Site Theme?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Applying the <strong>{selectedTheme?.name}</strong> theme will replace the current sections on your <strong>Home Page</strong> with the theme's preset layout.
            <br /><br />
            Your existing data on other pages will remain safe. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Cancel
          </Button>
          <Button onClick={handleInstall} variant="contained" color="primary" sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', px: 4 }}>
            Apply & Replace
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
