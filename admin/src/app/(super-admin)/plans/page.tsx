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
    InputAdornment,
    Checkbox,
    Grid,
    Divider,
} from "@mui/material";
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    RemoveCircleOutline as RemoveIcon,
} from "@mui/icons-material";
import { apiService } from "@/services/api";

const ADMIN_PAGES = [
  {
    group: "Dashboard",
    pages: [
      { key: "dashboard", label: "Dashboard" },
    ]
  },
  {
    group: "Sales",
    pages: [
      { key: "orders", label: "Orders" },
      { key: "estimates", label: "Estimates" },
      { key: "invoices", label: "Invoices" },
      { key: "inquiries", label: "Inquiries" },
      { key: "reports", label: "Reports" },
    ]
  },
  {
    group: "People",
    pages: [
      { key: "customers", label: "Customers" },
      { key: "admin-list", label: "Admin List" },
    ]
  },
  {
    group: "Inventory",
    pages: [
      { key: "manage-products/product-list", label: "Products" },
      { key: "manage-products", label: "Manage Products" },
      { key: "tags-flags", label: "Tags & Flags" },
    ]
  },
  {
    group: "Website",
    pages: [
      { key: "sections", label: "Sections Library" },
      { key: "pages", label: "Pages" },
      { key: "blog", label: "Blog" },
      { key: "themes", label: "Themes" },
      { key: "media", label: "Media" },
    ]
  },
  {
    group: "Settings",
    pages: [
      { key: "settings/general-settings", label: "General Settings" },
      { key: "settings/domain-management", label: "Domain Management" },
      { key: "settings/theme-settings", label: "Theme Settings" },
      { key: "settings/payment-settings", label: "Payment Settings" },
      { key: "settings/shipping-settings", label: "Shipping Settings" },
      { key: "settings/manage-subscription", label: "Manage Subscription" },
      { key: "settings/seo-settings", label: "SEO Settings" },
      { key: "settings/advertisement", label: "Promo Popups" },
      { key: "settings/email-config/settings", label: "Email Settings" },
      { key: "settings/email-config/template", label: "Email Template" },
      { key: "settings/audit-logs", label: "Audit Logs" },
    ]
  }
];

interface Plan {
    id: string;
    name: string;
    category: 'page_builder' | 'ecommerce';
    monthlyPrice: number | string;
    yearlyPrice: number | string;
    pageLimit: number;
    productLimit: number;
    storageMb: number;
    customDomainLimit: number;
    features: any;
    allowedPages?: string[];
    isActive: boolean;
    createdAt: string;
}

export default function SuperAdminPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        category: "page_builder",
        monthlyPrice: "",
        yearlyPrice: "",
        pageLimit: 0,
        productLimit: 0,
        storageMb: 500,
        customDomainLimit: 0,
        isActive: true,
        features: {} as Record<string, string>,
        allowedPages: [] as string[],
    });
    const [featureKey, setFeatureKey] = useState("");
    const [featureValue, setFeatureValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const api = apiService;

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get("/plans");
            setPlans(Array.isArray(response) ? response : response.data || []);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
            setError("Failed to load subscription plans.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({
                name: plan.name,
                category: plan.category || "page_builder",
                monthlyPrice: plan.monthlyPrice?.toString() || "",
                yearlyPrice: plan.yearlyPrice?.toString() || "",
                pageLimit: plan.pageLimit ?? 0,
                productLimit: plan.productLimit ?? 0,
                storageMb: plan.storageMb ?? 500,
                customDomainLimit: plan.customDomainLimit ?? 0,
                isActive: plan.isActive,
                features: (plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)) 
                    ? plan.features 
                    : {},
                allowedPages: plan.allowedPages || [],
            });
        } else {
            setEditingPlan(null);
            setFormData({
                name: "",
                category: "page_builder",
                monthlyPrice: "",
                yearlyPrice: "",
                pageLimit: 0,
                productLimit: 0,
                storageMb: 500,
                customDomainLimit: 0,
                isActive: true,
                features: {},
                allowedPages: [],
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setError(null);
    };

    const handleTogglePage = (key: string) => {
        const current = formData.allowedPages || [];
        const updated = current.includes(key)
            ? current.filter(k => k !== key)
            : [...current, key];
        setFormData({ ...formData, allowedPages: updated });
    };

    const handleSelectAllPages = () => {
        const allKeys = ADMIN_PAGES.flatMap(g => g.pages.map(p => p.key));
        setFormData({ ...formData, allowedPages: allKeys });
    };

    const handleDeselectAllPages = () => {
        setFormData({ ...formData, allowedPages: [] });
    };

    const handleLimitChange = (field: string, value: string | boolean) => {
        setFormData({
            ...formData,
            [field]: typeof value === 'boolean' ? value : (parseInt(value as string) || 0)
        });
    };

    const addFeature = () => {
        if (!featureKey.trim() || !featureValue.trim()) return;
        setFormData((prev) => ({
            ...prev,
            features: {
                ...prev.features,
                [featureKey.trim()]: featureValue.trim()
            }
        }));
        setFeatureKey("");
        setFeatureValue("");
    };

    const removeFeature = (key: string) => {
        setFormData((prev) => {
            const newFeatures = { ...prev.features };
            delete newFeatures[key];
            return {
                ...prev,
                features: newFeatures
            };
        });
    };



    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.monthlyPrice || !formData.yearlyPrice) {
                setError("Name, Monthly Price, and Yearly Price are required.");
                return;
            }

            const payload = {
                name: formData.name,
                category: formData.category,
                monthlyPrice: parseFloat(formData.monthlyPrice),
                yearlyPrice: parseFloat(formData.yearlyPrice),
                pageLimit: formData.pageLimit,
                productLimit: formData.productLimit,
                storageMb: formData.storageMb,
                customDomainLimit: formData.customDomainLimit,
                isActive: formData.isActive,
                features: formData.features,
                allowedPages: formData.allowedPages,
            };

            if (editingPlan) {
                await api.put(`/plans/${editingPlan.id}`, payload);
            } else {
                await api.post("/plans", payload);
            }
            fetchPlans();
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to save plan.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this plan? This may affect existing subscriptions.")) {
            try {
                await api.delete(`/plans/${id}`);
                fetchPlans();
            } catch (err: any) {
                console.error("Delete failed:", err);
                alert(err.message || "Failed to delete plan.");
            }
        }
    };

    const toggleStatus = async (plan: Plan) => {
        try {
            await api.put(`/plans/${plan.id}`, { isActive: !plan.isActive });
            fetchPlans();
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Subscription Plans</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    color="primary"
                >
                    Create New Plan
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montly Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Yearly Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Limits</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Allowed Modules</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Created At</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell sx={{ fontWeight: 'medium' }}>{plan.name}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={plan.category === 'ecommerce' ? 'E-commerce' : 'Page Builder'} 
                                        size="small" 
                                        color={plan.category === 'ecommerce' ? 'primary' : 'secondary'} 
                                        variant="outlined" 
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>₹{plan.monthlyPrice}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>₹{plan.yearlyPrice}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Products: <b>{plan.productLimit === -1 ? 'Unlimited' : plan.productLimit ?? 0}</b>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Pages: <b>{plan.pageLimit === -1 ? 'Unlimited' : plan.pageLimit ?? 0}</b>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Storage: <b>{plan.storageMb ?? 0} MB</b>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Custom Domain: <b>{plan.customDomainLimit === -1 ? 'Unlimited' : plan.customDomainLimit ?? 0}</b>
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 220 }}>
                                        {plan.allowedPages && plan.allowedPages.length > 0 ? (
                                            plan.allowedPages.map((key) => {
                                                const label = ADMIN_PAGES.flatMap(g => g.pages).find(p => p.key === key)?.label || key;
                                                const shortLabel = label.split(' (')[0];
                                                return <Chip key={key} label={shortLabel} size="small" variant="outlined" sx={{ fontSize: '10px' }} />;
                                            })
                                        ) : (
                                            <Chip label="All Pages (Legacy)" size="small" color="default" sx={{ fontSize: '10px', fontStyle: 'italic' }} />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={plan.isActive}
                                        onChange={() => toggleStatus(plan)}
                                        color="success"
                                        size="small"
                                    />
                                    <Chip
                                        label={plan.isActive ? "Active" : "Archived"}
                                        size="small"
                                        color={plan.isActive ? "success" : "default"}
                                    />
                                </TableCell>
                                <TableCell>{new Date(plan.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleOpen(plan)} color="primary" size="small">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(plan.id)} color="error" size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {plans.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                    No plans found. Start by creating one.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Plan Name</label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g. Pro Plan, Enterprise"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    SelectProps={{ native: true }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="page_builder">Page Builder</option>
                                    <option value="ecommerce">E-commerce</option>
                                </TextField>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Monthly Price</label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.monthlyPrice}
                                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Yearly Price</label>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.yearlyPrice}
                                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Feature Limits (-1 for Unlimited)</Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Products Limit</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.productLimit}
                                        onChange={(e) => handleLimitChange('productLimit', e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Pages Limit</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.pageLimit}
                                        onChange={(e) => handleLimitChange('pageLimit', e.target.value)}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Storage (MB)</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.storageMb}
                                        onChange={(e) => handleLimitChange('storageMb', e.target.value)}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Domain Limit</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={formData.customDomainLimit}
                                        onChange={(e) => handleLimitChange('customDomainLimit', e.target.value)}
                                        helperText="-1 for unlimited"
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />
                        
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                                    Allowed Modules / Pages
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" variant="text" sx={{ py: 0, fontSize: '11px' }} onClick={handleSelectAllPages}>
                                        Select All
                                    </Button>
                                    <Button size="small" variant="text" sx={{ py: 0, fontSize: '11px' }} color="error" onClick={handleDeselectAllPages}>
                                        Deselect All
                                    </Button>
                                </Box>
                            </Box>
                             <Box sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, p: 2, maxHeight: 300, overflowY: 'auto' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {ADMIN_PAGES.map((group) => (
                                        <Box key={group.group}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {group.group}
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                                                {group.pages.map((page) => {
                                                    const isChecked = (formData.allowedPages || []).includes(page.key);
                                                    return (
                                                        <FormControlLabel
                                                            key={page.key}
                                                            control={
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={isChecked}
                                                                    onChange={() => handleTogglePage(page.key)}
                                                                    color="primary"
                                                                />
                                                            }
                                                            label={
                                                                <Typography variant="body2" sx={{ fontSize: '12.5px', color: isChecked ? 'text.primary' : 'text.secondary' }}>
                                                                    {page.label}
                                                                </Typography>
                                                            }
                                                            sx={{ m: 0, width: '100%' }}
                                                        />
                                                    );
                                                })}
                                            </Box>
                                            <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Active (Visible to users)"
                        />

                        <Box sx={{ mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 'bold' }}>Plan Features (Key-Value)</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 48px', gap: 2, alignItems: 'end', mb: 2 }}>
                                <Box>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Feature Name</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. seo, support"
                                        value={featureKey}
                                        onChange={(e) => setFeatureKey(e.target.value)}
                                    />
                                </Box>
                                <Box>
                                    <label className="text-xs font-bold text-slate-600 block mb-1">Value</label>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="e.g. basic, 24/7"
                                        value={featureValue}
                                        onChange={(e) => setFeatureValue(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addFeature();
                                            }
                                        }}
                                    />
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    onClick={addFeature}
                                    sx={{ minWidth: 48, px: 0, height: 40 }}
                                >
                                    <AddIcon />
                                </Button>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {Object.entries(formData.features).map(([key, value]) => (
                                    <Box 
                                        key={key}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between',
                                            p: 1,
                                            pl: 1.5,
                                            bgcolor: 'grey.50',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'grey.200'
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1 }}>{key}</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                                        </Box>
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => removeFeature(key)}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                                {Object.keys(formData.features).length === 0 && (
                                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>
                                        No features added yet.
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!formData.name || !formData.monthlyPrice || !formData.yearlyPrice}
                    >
                        Save Plan
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
