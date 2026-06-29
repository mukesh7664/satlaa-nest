"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { paymentsApi, PaymentConfig } from "@/services/payments.api";
import {
    Save as SaveIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import {
    Button,
    Switch,
    TextField,
    FormControlLabel,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Box,
} from "@mui/material";

export default function PaymentSettingsPage() {
    const keySecretRef = useRef<HTMLInputElement>(null);
    const webhookSecretRef = useRef<HTMLInputElement>(null);

    const [allConfigs, setAllConfigs] = useState<PaymentConfig[]>([]);
    const [config, setConfig] = useState<Partial<PaymentConfig>>({
        provider: 'razorpay',
        keyId: '',
        keySecret: '',
        webhookSecret: '',
        isActive: true,
        isTestMode: false,
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fetchingSecrets, setFetchingSecrets] = useState(false);
    const [showKeySecret, setShowKeySecret] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);
    const [decryptedValues, setDecryptedValues] = useState({ keySecret: '', webhookSecret: '' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [providerToDelete, setProviderToDelete] = useState<{ name: string, id: string } | null>(null);

    useEffect(() => {
        fetchConfig(true);
    }, []);

    const fetchConfig = async (isInitial = false) => {
        try {
            if (isInitial) setFetching(true);
            const data = await paymentsApi.getConfig();
            
            // Sort to put the active one at the top
            const sortedData = [...(data || [])].sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return 0;
            });
            
            setAllConfigs(sortedData);
            
            if (sortedData && sortedData.length > 0) {
                // By default, focus on the active provider
                const activeConfig = sortedData.find(c => c.isActive) || sortedData[0];
                setConfig({
                    ...activeConfig,
                });
            } else {
                // No configs at all, reset to default empty provider
                setConfig({
                    provider: 'razorpay',
                    keyId: '',
                    keySecret: '',
                    webhookSecret: '',
                    isActive: true,
                    isTestMode: false,
                });
            }
        } catch (err) {
            console.error("Failed to fetch payment config:", err);
            toast.error("Failed to load payment settings");
        } finally {
            if (isInitial) setFetching(false);
        }
    };

    const fetchSecrets = async (specificField: 'keySecret' | 'webhookSecret') => {
        try {
            setFetchingSecrets(true);
            const data = await paymentsApi.getDecryptedConfig();
            if (data && data.length > 0) {
                const providerToFind = config.provider || 'razorpay';
                const providerConfig = data.find(c => c.provider === providerToFind) || data[0];

                // Update decrypted values WITHOUT touching the masked config state
                setDecryptedValues({
                    keySecret: providerConfig.keySecret || '',
                    webhookSecret: providerConfig.webhookSecret || '',
                });

                if (specificField === 'keySecret') setShowKeySecret(true);
                if (specificField === 'webhookSecret') setShowWebhookSecret(true);

                toast.success(`${specificField === 'keySecret' ? 'Key' : 'Webhook'} Secret revealed`);

                // Auto hide after 10 seconds
                setTimeout(() => {
                    handleHideSecrets();
                }, 10000);
            }
        } catch (err) {
            console.error("Failed to fetch secrets:", err);
            toast.error("Failed to decrypt secrets (Admin only)");
        } finally {
            setFetchingSecrets(false);
        }
    };

    const handleHideSecrets = () => {
        setShowKeySecret(false);
        setShowWebhookSecret(false);
    };

    const toggleSecretVisibility = (fieldName: 'keySecret' | 'webhookSecret') => {
        const isShowing = fieldName === 'keySecret' ? showKeySecret : showWebhookSecret;
        if (!isShowing) {
            // If we don't have decrypted data yet, fetch it
            if (!decryptedValues[fieldName]) {
                fetchSecrets(fieldName);
            } else {
                if (fieldName === 'keySecret') setShowKeySecret(true);
                else setShowWebhookSecret(true);
            }
        } else {
            if (fieldName === 'keySecret') setShowKeySecret(false);
            else setShowWebhookSecret(false);
        }
    };

    const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (value && value.startsWith('********')) {
            setConfig(prev => ({ ...prev, [name]: '' }));
            toast.info(`Enter new ${config.provider === 'stripe' ? (name === 'keySecret' ? 'Secret Key' : 'Webhook Secret') : (name === 'keySecret' ? 'Key Secret' : 'Webhook Secret')} or click eye icon to see current`, {
                duration: 5000
            });
        }
    };

    const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (value === '') {
            fetchConfig();
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        
        if (name === 'provider') {
            handleHideSecrets();
            setDecryptedValues({ keySecret: '', webhookSecret: '' });
            
            // Switch current config based on what we have in allConfigs
            const savedConfig = allConfigs.find(c => c.provider === value);
            if (savedConfig) {
                setConfig(savedConfig);
            } else {
                setConfig({
                    provider: value,
                    keyId: '',
                    keySecret: '',
                    webhookSecret: '',
                    isActive: true,
                    isTestMode: false,
                });
            }
        } else {
            setConfig((prev) => ({ ...prev, [name]: value }));
            if (name === 'keySecret' && showKeySecret) {
                setDecryptedValues(prev => ({ ...prev, keySecret: value }));
            }
            if (name === 'webhookSecret' && showWebhookSecret) {
                setDecryptedValues(prev => ({ ...prev, webhookSecret: value }));
            }
        }
    };

    const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setConfig((prev) => ({ ...prev, isActive: checked }));
    };

    const handleTestModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setConfig((prev) => ({ ...prev, isTestMode: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                provider: config.provider,
                keyId: config.keyId,
                keySecret: config.keySecret,
                webhookSecret: config.webhookSecret,
                isActive: config.isActive,
                isTestMode: config.isTestMode,
            };
            await paymentsApi.upsertConfig(payload);
            toast.success("Payment settings updated successfully");
            fetchConfig();
            setShowKeySecret(false);
            setShowWebhookSecret(false);
            setDecryptedValues({ keySecret: '', webhookSecret: '' }); // Reset decrypted cache
        } catch (err) {
            console.error("Save failed:", err);
            toast.error("Failed to save payment settings");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (savedConfig: PaymentConfig) => {
        handleHideSecrets();
        setDecryptedValues({ keySecret: '', webhookSecret: '' });
        setConfig({
            ...savedConfig,
        });
        toast.info(`Editing ${savedConfig.provider === 'stripe' ? 'Stripe' : 'Razorpay'} settings`);
    };

    const handleDeleteClick = (provider: string, configId?: string) => {
        if (!configId) {
            toast.error("No configuration saved for this provider");
            return;
        }
        setProviderToDelete({ name: provider, id: configId });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!providerToDelete) return;

        const providerName = providerToDelete.name;
        setLoading(true);
        setDeleteDialogOpen(false);
        
        try {
            await paymentsApi.deleteConfig(providerName);
            toast.success(`${providerName === 'stripe' ? 'Stripe' : 'Razorpay'} settings removed`);
            
            // If we are currently editing this provider, reset the form
            if (config.provider === providerName) {
                const newConfig = {
                    provider: providerName,
                    keyId: '',
                    keySecret: '',
                    webhookSecret: '',
                    isActive: true,
                    isTestMode: false,
                };
                setConfig(newConfig);
                handleHideSecrets();
                setDecryptedValues({ keySecret: '', webhookSecret: '' });
            }
            
            // Update allConfigs
            setAllConfigs(prev => prev.filter(c => c.provider !== providerName));
            setProviderToDelete(null);
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to remove payment settings");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProviderToDelete(null);
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center py-20">
                <CircularProgress />
            </div>
        );
    }

    const isStripe = config.provider === 'stripe';

    return (
        <>
        <style>
            {`
                .MuiOutlinedInput-root {
                    border-radius: 8px !important;
                }
            `}
        </style>
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        Payment Settings
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Configure your payment gateway to receive payments directly to your account.
                    </p>
                </div>
            </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6 text-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-4 2xl:space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3 2xl:pb-4">
                            <h2 className="text-sm 2xl:text-xl font-bold text-slate-800 flex items-center gap-2">
                                <PaymentIcon className="text-slate-400" sx={{ fontSize: { xs: 18, '2xl': 24 } }} />
                                Gateway Configuration
                            </h2>
                            <div className="flex gap-3">
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    size="small"
                                    startIcon={loading ? undefined : <SaveIcon sx={{ fontSize: { xs: 14, '2xl': 18 } }} />}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        px: { xs: 2, '2xl': 5 },
                                        py: { xs: 0.8, '2xl': 1.5 },
                                        fontSize: { xs: 12, '2xl': 14 },
                                        fontWeight: 700,
                                        bgcolor: "#408dfb",
                                        '&:hover': {
                                            bgcolor: "#357abd",
                                        }
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={18} color="inherit" />
                                    ) : (
                                        "Save Configuration"
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-8">
                            <div className="space-y-1">
                                <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                                    Payment Provider
                                </label>
                                <FormControl fullWidth size="small">
                                    <Select
                                        name="provider"
                                        value={config.provider}
                                        onChange={handleChange}
                                        sx={{ 
                                            borderRadius: '8px',
                                            bgcolor: 'slate.50',
                                            fontSize: { xs: 12, '2xl': 14 }
                                        }}
                                    >
                                        <MenuItem value="razorpay">Razorpay</MenuItem>
                                        <MenuItem value="stripe">Stripe</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="flex items-center gap-6 pt-5">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={config.isActive}
                                            onChange={handleActiveChange}
                                            color="primary"
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-xs 2xl:text-sm font-bold text-slate-700">
                                        {config.isActive ? "Provider Active" : "Provider Inactive"}
                                    </span>}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={config.isTestMode}
                                            onChange={handleTestModeChange}
                                            color="warning"
                                            size="small"
                                        />
                                    }
                                    label={<span className="text-xs 2xl:text-sm font-bold text-slate-700">
                                        Sandbox Mode
                                    </span>}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6 pt-4 border-t border-slate-50">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                                    {isStripe ? "Publishable Key" : "Key ID"}
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="keyId"
                                    value={config.keyId}
                                    onChange={handleChange}
                                    placeholder={isStripe ? "pk_test_..." : "rzp_test_..."}
                                    sx={{ 
                                        bgcolor: "white",
                                        '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } }
                                    }}
                                />
                                <p className="text-[10px] 2xl:text-[11px] text-slate-400 font-medium">
                                    Your {isStripe ? "Stripe Publishable Key" : "Razorpay Key ID"} from the Dashboard
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                                    {isStripe ? "Secret Key" : "Key Secret"}
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="keySecret"
                                    inputRef={keySecretRef}
                                    type="text"
                                    value={showKeySecret ? decryptedValues.keySecret : config.keySecret}
                                    onChange={handleChange}
                                    onFocus={handleFieldFocus}
                                    onBlur={handleFieldBlur}
                                    placeholder="Enter new secret to update"
                                    sx={{ 
                                        bgcolor: "white",
                                        '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => toggleSecretVisibility('keySecret')}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showKeySecret ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <p className="text-[10px] 2xl:text-[11px] text-slate-400 font-medium">
                                    Leave empty or keep masked to preserve existing {isStripe ? "secret key" : "key secret"}.
                                </p>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-[11px] 2xl:text-xs font-bold text-slate-500">
                                    Webhook Secret
                                </label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="webhookSecret"
                                    inputRef={webhookSecretRef}
                                    type="text"
                                    value={showWebhookSecret ? decryptedValues.webhookSecret : config.webhookSecret}
                                    onChange={handleChange}
                                    onFocus={handleFieldFocus}
                                    onBlur={handleFieldBlur}
                                    placeholder={isStripe ? "whsec_..." : "Enter webhook secret"}
                                    sx={{ 
                                        bgcolor: "white",
                                        '& .MuiInputBase-input': { fontSize: { xs: 12, '2xl': 14 } }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => toggleSecretVisibility('webhookSecret')}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showWebhookSecret ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <p className="text-[10px] 2xl:text-[11px] text-slate-400 font-medium">
                                    Used to verify webhook events from {isStripe ? "Stripe" : "Razorpay"}.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-6">
                            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-tight mb-2">How it works</h3>
                            <ul className="text-[11px] text-blue-700 space-y-2 list-disc pl-4">
                                <li>All payments from your customers will be processed using these credentials.</li>
                                <li>Funds will be settled directly into your linked bank account via {isStripe ? "Stripe" : "Razorpay"}.</li>
                                <li>Ensure you have configured the webhook URL in your {isStripe ? "Stripe" : "Razorpay"} Dashboard to receive payment status updates.</li>

                            </ul>
                        </div>
                    </form>
                </div>

                {allConfigs.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-base 2xl:text-xl font-bold text-slate-800 flex items-center gap-2 mt-4 2xl:mt-10">
                            <CheckCircleIcon className="text-emerald-500" sx={{ fontSize: { xs: 18, '2xl': 24 } }} />
                            Active Configurations
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 2xl:gap-6">
                            {allConfigs.map((cfg) => (
                                <div key={cfg.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 2xl:p-6 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 2xl:p-2 rounded-lg ${cfg.provider === 'stripe' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                <PaymentIcon sx={{ fontSize: { xs: 16, '2xl': 20 } }} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm 2xl:text-base font-bold text-slate-800 capitalize">
                                                    {cfg.provider}
                                                </h3>
                                                <p className="text-[10px] 2xl:text-xs text-slate-400 font-medium">
                                                    ID: {cfg.keyId.length > 15 ? `${cfg.keyId.substring(0, 15)}...` : cfg.keyId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <IconButton size="small" onClick={() => handleEdit(cfg)} className="text-slate-400 hover:text-blue-600">
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteClick(cfg.provider, cfg.id)} className="text-slate-400 hover:text-red-600">
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                        <div className="flex gap-2">
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {cfg.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                            {cfg.isTestMode && (
                                                <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                                                    Sandbox
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                PaperProps={{
                    sx: { borderRadius: "12px", p: 1 }
                }}
            >
                <DialogTitle className="font-bold text-slate-800">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="text-slate-600">
                        Are you sure you want to completely remove all settings for 
                        <span className="font-bold text-slate-800 mx-1 capitalize">
                            {providerToDelete?.name}
                        </span>? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseDeleteDialog} 
                        sx={{ textTransform: "none", color: "slate.500" }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        color="error"
                        variant="contained" 
                        autoFocus
                        disabled={loading}
                        sx={{ textTransform: "none", borderRadius: "8px", px: 3 }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Delete Configuration"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
