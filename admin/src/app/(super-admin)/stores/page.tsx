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
    Chip,
    CircularProgress,
    Link,
    IconButton,
} from "@mui/material";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert,
    TablePagination,
} from "@mui/material";
import { Add as AddIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { apiService } from "@/services/api";

interface Store {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    createdAt: string;
    owner: {
        id: string;
        email: string;
        name?: string;
    } | null;
    primaryDomain: string | null;
    customDomain: string | null;
    subscription: {
        id: string;
        expiry_date: string;
        plan: {
            name: string;
            category: string;
        } | null;
    } | null;
}

export default function StoresManagementPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const api = apiService;
    const router = useRouter();

    const [openAdd, setOpenAdd] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        storeName: '',
        name: '',
        email: '',
        password: '',
        planId: '',
        billingCycle: 'monthly'
    });
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStores();
    }, [page, rowsPerPage]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans");
            // The API might return { data: [...] } or just [...]
            const plansData = response.data?.data || response.data || response || [];
            if (Array.isArray(plansData)) {
                setPlans(plansData);
            } else {
                setPlans([]);
            }
        } catch (err) {
            console.error("Failed to fetch plans:", err);
            setPlans([]);
        }
    };

    const handleAddSubmit = async () => {
        try {
            setSubmitting(true);
            setSubmitError('');
            await api.post("/subscriptions/manual-provision", formData);
            setOpenAdd(false);
            fetchStores();
            setFormData({ storeName: '', name: '', email: '', password: '', planId: '', billingCycle: 'monthly' });
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || err.message || 'Failed to create store');
        } finally {
            setSubmitting(false);
        }
    };

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/stores?page=${page + 1}&limit=${rowsPerPage}`);
            // API returns { data: [], total: ..., totalPages: ... }
            setStores(response.data || []);
            setTotalItems(response.total || 0);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Stores Management</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAdd(true)}
                >
                    Add Store
                </Button>
            </Box>


            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Store Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Expiry Date</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Domains</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="bold">{store.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {store.owner?.name || 'Unknown Admin'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {store.owner ? (
                                        <Typography variant="body2">{store.owner.email}</Typography>
                                    ) : (
                                        <Typography variant="body2" color="error">No Owner Found</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {store.subscription?.plan ? (
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {store.subscription.plan.name}
                                            </Typography>
                                            <Chip 
                                                label={store.subscription.plan.category?.replace('_', ' ')} 
                                                size="small" 
                                                sx={{ 
                                                    height: 18, 
                                                    fontSize: '0.65rem', 
                                                    mt: 0.5,
                                                    bgcolor: store.subscription.plan.category === 'ecommerce' ? 'indigo.50' : 'blue.50',
                                                    color: store.subscription.plan.category === 'ecommerce' ? 'indigo.700' : 'blue.700',
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">Free Trial / No Plan</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {store.subscription?.expiry_date ? (
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: new Date(store.subscription.expiry_date) < new Date() ? 'error.main' : 'text.primary',
                                                fontWeight: new Date(store.subscription.expiry_date) < new Date() ? 600 : 400
                                            }}
                                        >
                                            {new Date(store.subscription.expiry_date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                            {new Date(store.subscription.expiry_date) < new Date() && (
                                                <Typography variant="caption" sx={{ display: 'block', color: 'error.main', fontSize: '0.6rem', fontWeight: 700 }}>
                                                    EXPIRED
                                                </Typography>
                                            )}
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">N/A</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {store.primaryDomain && (
                                            <Chip
                                                label={`Subdomain: ${store.primaryDomain}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        )}
                                        {store.customDomain && (
                                            <Chip
                                                label={`Custom: ${store.customDomain}`}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        )}
                                        {!store.primaryDomain && !store.customDomain && (
                                            <Typography variant="caption" color="text.secondary">No domains linked</Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => router.push(`/stores/${store.id}`)}
                                        size="small"
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={totalItems}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid rgba(224, 224, 224, 1)' }}
                />
            </TableContainer>

            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Store</DialogTitle>
                <DialogContent dividers>
                    {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                    <Box display="grid" gap={2}>
                        <TextField
                            label="Store Name"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Owner Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Owner Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Initial Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Subscription Plan</InputLabel>
                            <Select
                                value={formData.planId}
                                label="Subscription Plan"
                                onChange={(e) => setFormData({ ...formData, planId: e.target.value as string })}
                            >
                                {plans.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Billing Cycle</InputLabel>
                            <Select
                                value={formData.billingCycle}
                                label="Billing Cycle"
                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as string })}
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)} disabled={submitting}>Cancel</Button>
                    <Button onClick={handleAddSubmit} variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
