"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    Tooltip,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { apiService } from "@/services/api";

interface GatewayConfig {
    id: string;
    provider: string;
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
    isActive: boolean;
    isTestMode: boolean;
    createdAt: string;
}

interface GatewayFormData {
    provider: string;
    keyId: string;
    keySecret: string;
    webhookSecret?: string;
    isActive: boolean;
    isTestMode: boolean;
}

export default function SystemGatewayConfigPage() {
    const [configs, setConfigs] = useState<GatewayConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<GatewayConfig | null>(null);
    const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
    
    const [formData, setFormData] = useState<GatewayFormData>({
        provider: "razorpay",
        keyId: "",
        keySecret: "",
        webhookSecret: "",
        isActive: true,
        isTestMode: false,
    });
    
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const api = apiService;

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/system-gateway-configs");
            setConfigs(response.data || []);
        } catch (err) {
            console.error("Failed to fetch configs:", err);
            setError("Failed to load gateway configurations.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (config?: GatewayConfig) => {
        if (config) {
            setEditingConfig(config);
            setFormData({
                provider: config.provider,
                keyId: config.keyId,
                keySecret: config.keySecret,
                webhookSecret: config.webhookSecret || "",
                isActive: config.isActive,
                isTestMode: config.isTestMode,
            });
        } else {
            setEditingConfig(null);
            setFormData({
                provider: "razorpay",
                keyId: "",
                keySecret: "",
                webhookSecret: "",
                isActive: true,
                isTestMode: false,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
    };

    const handleSubmit = async () => {
        try {
            // Check if we have values, but allow masked values for updates
            if (!formData.provider || !formData.keyId || !formData.keySecret) {
                setError("Provider, Key ID, and Key Secret are required.");
                return;
            }

            const payload = { ...formData };
            // Optional: Webhook secret can be empty or null
            if (!payload.webhookSecret) {
               delete payload.webhookSecret;
            }

            if (editingConfig) {
                await api.put(`/admin/system-gateway-configs/${editingConfig.id}`, payload);
                setSuccess("Configuration updated successfully.");
            } else {
                await api.post("/admin/system-gateway-configs", payload);
                setSuccess("Configuration created successfully.");
            }
            fetchConfigs();
            handleClose();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to save configuration.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this configuration? This will stop payments for this provider.")) {
            try {
                await api.delete(`/admin/system-gateway-configs/${id}`);
                setSuccess("Configuration deleted.");
                fetchConfigs();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err: any) {
                console.error("Delete failed:", err);
                setError(err.message || "Failed to delete configuration.");
            }
        }
    };

    const toggleShowSecret = async (id: string) => {
        if (!showSecrets[id]) {
            try {
                // Fetch decrypted version
                const response = await api.get(`/admin/system-gateway-configs/${id}/decrypted`);
                const decryptedData = response.data;
                
                // Update the config in the list so the UI shows the real value
                setConfigs(prev => prev.map(c => c.id === id ? { 
                    ...c, 
                    keySecret: decryptedData.keySecret,
                    webhookSecret: decryptedData.webhookSecret 
                } : c));
                
                setShowSecrets(prev => ({ ...prev, [id]: true }));
            } catch (err) {
                console.error("Failed to decrypt secret:", err);
                setError("Failed to decrypt secret. Please try again.");
            }
        } else {
            setShowSecrets(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">System Gateway Config</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    color="primary"
                >
                    Add Gateway
                </Button>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {error && !open && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Provider</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Key ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Key Secret</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mode</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {configs.map((config) => (
                            <TableRow key={config.id} hover>
                                <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {config.provider}
                                </TableCell>
                                <TableCell>{config.keyId}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {showSecrets[config.id] ? config.keySecret : "••••••••••••••••"}
                                        </Typography>
                                        <IconButton size="small" onClick={() => toggleShowSecret(config.id)}>
                                            {showSecrets[config.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={config.isTestMode ? "Test" : "Live"} 
                                        size="small" 
                                        color={config.isTestMode ? "warning" : "error"} 
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={config.isActive ? "Active" : "Inactive"}
                                        size="small"
                                        color={config.isActive ? "success" : "default"}
                                    />
                                </TableCell>
                                <TableCell>{new Date(config.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(config)} color="primary" size="small">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(config.id)} color="error" size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {configs.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No configurations found. Add one to enable platform payments.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>{editingConfig ? "Edit Gateway" : "Add Gateway"}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label="Provider"
                            fullWidth
                            size="small"
                            disabled={!!editingConfig}
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value.toLowerCase() })}
                            placeholder="e.g. razorpay"
                        />
                        <TextField
                            label="Key ID"
                            fullWidth
                            size="small"
                            value={formData.keyId}
                            onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                        />
                        <TextField
                            label="Key Secret"
                            fullWidth
                            size="small"
                            type="password"
                            value={formData.keySecret}
                            onChange={(e) => setFormData({ ...formData, keySecret: e.target.value })}
                        />
                        <TextField
                            label="Webhook Secret (Optional)"
                            fullWidth
                            size="small"
                            value={formData.webhookSecret}
                            onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                        />
                        
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isTestMode}
                                        onChange={(e) => setFormData({ ...formData, isTestMode: e.target.checked })}
                                        color="warning"
                                    />
                                }
                                label="Test Mode"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        color="success"
                                    />
                                }
                                label="Active"
                            />
                        </Box>
                        {formData.isActive && (
                            <Alert severity="info">
                                Activating this will primary payments for this provider.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!formData.provider || !formData.keyId || !formData.keySecret}
                    >
                        Save Configuration
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
