"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Button,
    CircularProgress,
    Chip,
    Card,
    CardContent,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Email as EmailIcon, Download as DownloadIcon, LocalOffer as CouponIcon } from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";

interface StoreDetail {
    id: string;
    name: string;
    description: string;
    slug: string;
    owner_id: string;
    createdAt: string;
    owner: {
        id: string;
        email: string;
        name?: string;
        phone?: string;
    } | null;
    domains: Array<{
        id: string;
        domain: string;
        type: string;
        is_primary: boolean;
        status: string;
    }>;
        subscription?: {
        id: string;
        status: string;
        expiry_date: string;
        plan: {
            name: string;
            category: string;
            productLimit: number;
            pageLimit: number;
            storageMb: number;
            adminLimit: number;
            customDomainLimit: number;
        };
    };
    usage?: {
        products: number;
        pages: number;
        admins: number;
        storageMb: number;
        customDomainCount: number;
    };
    payments: Array<{
        id: string;
        amount: number;
        currency: string;
        payment_method: string;
        transaction_id: string;
        status: string;
        paid_at: string;
        created_at: string;
        applied_coupon_code: string | null;
        original_amount: number | null;
        discount_amount: number | null;
    }>;
}

export default function StoreDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [store, setStore] = useState<StoreDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [plans, setPlans] = useState<any[]>([]);
    const [openChangePlanDialog, setOpenChangePlanDialog] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [selectedBillingCycle, setSelectedBillingCycle] = useState("monthly");
    const [updatingPlan, setUpdatingPlan] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error", message: string } | null>(null);

    const [invoices, setInvoices] = useState<any[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [resendingInvoiceId, setResendingInvoiceId] = useState<string | null>(null);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    const fetchInvoices = async () => {
        try {
            setLoadingInvoices(true);
            const response = await apiService.get(`/subscriptions/invoices?storeId=${id}`);
            setInvoices(response.data?.data || response.data || []);
        } catch (err) {
            console.error("Failed to fetch store invoices:", err);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleResendInvoice = async (invoiceId: string) => {
        try {
            setResendingInvoiceId(invoiceId);
            await apiService.post(`/subscriptions/invoices/${invoiceId}/resend`, {});
            setFeedback({ type: "success", message: "Invoice email resent successfully!" });
        } catch (err: any) {
            console.error("Failed to resend invoice:", err);
            setFeedback({ type: "error", message: err.response?.data?.message || "Failed to resend invoice email" });
        } finally {
            setResendingInvoiceId(null);
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            setGeneratingInvoice(true);
            await apiService.post(`/subscriptions/invoices/generate/${id}`, {});
            setFeedback({ type: "success", message: "Active subscription invoice generated successfully!" });
            await fetchInvoices();
        } catch (err: any) {
            console.error("Failed to generate invoice:", err);
            setFeedback({ type: "error", message: err.response?.data?.message || "Failed to generate active subscription invoice" });
        } finally {
            setGeneratingInvoice(false);
        }
    };

    const fetchStoreDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.get(`/admin/stores/${id}`);
            setStore(response.data || response);
        } catch (err: any) {
            console.error("Failed to fetch store details:", err);
            setError(err.response?.data?.message || err.message || "Failed to load store details");
        } finally {
            setLoading(false);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await apiService.getPlans();
            const planList = Array.isArray(response) ? response : [];
            setPlans(planList);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        }
    };

    useEffect(() => {
        if (id) {
            fetchStoreDetails();
            fetchPlans();
            fetchInvoices();
        }
    }, [id]);

    const handleOpenDialog = () => {
        if (store?.subscription?.plan) {
            const matchingPlan = plans.find(p => p.name === store?.subscription?.plan?.name);
            if (matchingPlan) {
                setSelectedPlanId(matchingPlan.id);
            }
        }
        setOpenChangePlanDialog(true);
    };

    const handleUpdatePlan = async () => {
        if (!selectedPlanId) {
            setFeedback({ type: "error", message: "Please select a plan" });
            return;
        }

        try {
            setUpdatingPlan(true);
            await apiService.post("/subscriptions/manual-update", {
                storeId: id,
                planId: selectedPlanId,
                billingCycle: selectedBillingCycle
            });
            setFeedback({ type: "success", message: "Store plan updated successfully!" });
            setOpenChangePlanDialog(false);
            // Refresh details
            await fetchStoreDetails();
            await fetchInvoices();
        } catch (err: any) {
            console.error("Failed to update store plan:", err);
            setFeedback({ 
                type: "error", 
                message: err.message || "Failed to update store plan. Please try again." 
            });
        } finally {
            setUpdatingPlan(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !store) {
        return (
            <Box p={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>Back to Stores</Button>
                <Typography color="error" variant="h6" mt={2}>
                    {error || "Store not found"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold">Store Details: {store.name}</Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Info Stack */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={3}>
                        {/* Basic Information */}
                        <Card elevation={3} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>General Information</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box display="flex" flexDirection="column" gap={1.5}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="bold">Store Name:</Typography>
                                        <Typography variant="body2">{store.name}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="bold">Slug / Subdomain:</Typography>
                                        <Typography variant="body2">{store.slug}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="bold">Created At:</Typography>
                                        <Typography variant="body2">{new Date(store.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body2" fontWeight="bold">Description:</Typography>
                                        <Typography variant="body2" align="right">{store.description || 'No description provided'}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Owner Information */}
                        <Card elevation={3} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>Owner Information</Typography>
                                <Divider sx={{ mb: 2 }} />
                                {store.owner ? (
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">Name:</Typography>
                                            <Typography variant="body2">{store.owner.name || 'N/A'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">Email:</Typography>
                                            <Typography variant="body2">{store.owner.email}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">Phone:</Typography>
                                            <Typography variant="body2">{store.owner.phone || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary">No owner information found</Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Domains Information */}
                        <Card elevation={3} sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>Domains</Typography>
                                <Divider sx={{ mb: 2 }} />
                                {store.domains && store.domains.length > 0 ? (
                                    <Box display="flex" flexDirection="column" gap={1.5}>
                                        {store.domains.map((domain) => (
                                            <Box key={domain.id} p={1.5} sx={{ bgcolor: 'grey.50', borderRadius: 1.5, border: '1px solid', borderColor: 'grey.200' }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" fontWeight="bold">{domain.domain}</Typography>
                                                    <Chip
                                                        label={domain.type}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                        color={domain.type === 'subdomain' ? 'primary' : 'secondary'}
                                                    />
                                                </Box>
                                                <Box mt={1} display="flex" gap={1}>
                                                    {domain.is_primary && <Chip label="Primary" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem' }} />}
                                                    <Chip label={domain.status} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography color="text.secondary" variant="body2">No domains associated with this store</Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coupon / Discount Info */}
                        {(() => {
                            const couponPayment = store.payments?.find(p => p.applied_coupon_code);
                            if (!couponPayment) return null;
                            const isFree = couponPayment.payment_method === 'coupon_free';
                            const discountPct = couponPayment.original_amount && couponPayment.discount_amount
                                ? Math.round((couponPayment.discount_amount / couponPayment.original_amount) * 100)
                                : null;
                            return (
                                <Card elevation={3} sx={{ borderRadius: 2, border: '1.5px solid', borderColor: 'success.light' }}>
                                    <CardContent>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <CouponIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                            <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>Coupon Applied at Registration</Typography>
                                        </Box>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" fontWeight="bold">Coupon Code:</Typography>
                                                <Chip
                                                    label={couponPayment.applied_coupon_code}
                                                    size="small"
                                                    color="success"
                                                    icon={<CouponIcon sx={{ fontSize: '14px !important' }} />}
                                                    sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                                                />
                                            </Box>
                                            {couponPayment.original_amount != null && (
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body2" fontWeight="bold">Original Price:</Typography>
                                                    <Typography variant="body2">₹{Number(couponPayment.original_amount).toFixed(2)}</Typography>
                                                </Box>
                                            )}
                                            {couponPayment.discount_amount != null && (
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="body2" fontWeight="bold">Discount Given:</Typography>
                                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                                        -₹{Number(couponPayment.discount_amount).toFixed(2)}
                                                        {discountPct !== null && ` (${discountPct}%)`}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" fontWeight="bold">Amount Paid:</Typography>
                                                <Typography variant="body2" fontWeight="bold" color={isFree ? 'success.main' : 'primary.main'}>
                                                    {isFree ? 'FREE (₹0)' : `₹${Number(couponPayment.amount).toFixed(2)}`}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="body2" fontWeight="bold">Payment Method:</Typography>
                                                <Chip
                                                    label={isFree ? '100% Coupon – No Payment' : 'Razorpay (Discounted)'}
                                                    size="small"
                                                    variant="outlined"
                                                    color={isFree ? 'success' : 'primary'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })()}
                    </Stack>
                </Grid>

                {/* Right Column: Subscription & Usage Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>Subscription & Usage</Typography>
                                {store.subscription?.plan.category && (
                                    <Chip 
                                        label={store.subscription.plan.category === 'page_builder' ? 'Page Builder' : 'E-commerce'} 
                                        color="secondary" 
                                        size="small" 
                                        variant="outlined"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                )}
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {store.subscription ? (
                                <Box display="flex" flexDirection="column" gap={3} sx={{ flexGrow: 1 }}>
                                    {/* Plan Info */}
                                    <Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Typography variant="body2" fontWeight="bold">Current Plan:</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body1" color="primary" fontWeight="bold">
                                                    {store.subscription.plan.name}
                                                </Typography>
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color="primary"
                                                    onClick={handleOpenDialog}
                                                    sx={{ py: 0.25, px: 1, fontSize: '0.75rem', borderRadius: 1.5 }}
                                                >
                                                    Change Plan
                                                </Button>
                                            </Stack>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1.5}>
                                            <Typography variant="body2" fontWeight="bold">Status:</Typography>
                                            <Chip 
                                                label={store.subscription.status} 
                                                color={store.subscription.status === 'active' ? 'success' : 'error'} 
                                                size="small" 
                                            />
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">Expiry Date:</Typography>
                                            <Typography variant="body2">{new Date(store.subscription.expiry_date).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider />

                                    {/* Resource Usage */}
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>Resource Usage & Limits</Typography>
                                        
                                        <Box display="flex" flexDirection="column" gap={1}>
                                            <UsageRow 
                                                label="Products" 
                                                used={store.usage?.products || 0} 
                                                limit={store.subscription.plan.productLimit} 
                                            />
                                            <UsageRow 
                                                label="Pages" 
                                                used={store.usage?.pages || 0} 
                                                limit={store.subscription.plan.pageLimit} 
                                            />
                                            <UsageRow 
                                                label="Admins / Staff" 
                                                used={store.usage?.admins || 0} 
                                                limit={store.subscription.plan.adminLimit} 
                                            />
                                            <UsageRow 
                                                label="Custom Domains" 
                                                used={store.usage?.customDomainCount || 0} 
                                                limit={store.subscription.plan.customDomainLimit} 
                                            />
                                            <UsageRow 
                                                label="Storage (MB)" 
                                                used={store.usage?.storageMb || 0} 
                                                limit={store.subscription.plan.storageMb} 
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box display="flex" flexDirection="column" gap={2} alignItems="center" justifyContent="center" sx={{ flexGrow: 1, py: 4 }}>
                                    <Typography color="text.secondary">No active subscription found</Typography>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => setOpenChangePlanDialog(true)}
                                        sx={{ borderRadius: 1.5 }}
                                    >
                                        Add Subscription Plan
                                    </Button>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment History - Full Width */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>Payment History</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {store.payments && store.payments.length > 0 ? (
                                <Box overflow="auto">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Original</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Discount</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Paid</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Coupon</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Method</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {store.payments.map((payment) => {
                                                const isFree = payment.payment_method === 'coupon_free';
                                                return (
                                                    <TableRow key={payment.id} hover sx={payment.applied_coupon_code ? { bgcolor: 'success.50' } : {}}>
                                                        <TableCell sx={{ py: 1.5 }}>{new Date(payment.paid_at || payment.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>
                                                            {payment.original_amount != null ? `₹${Number(payment.original_amount).toFixed(0)}` : `₹${Number(payment.amount).toFixed(0)}`}
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.5 }}>
                                                            {payment.discount_amount != null && Number(payment.discount_amount) > 0 ? (
                                                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                                                    -₹{Number(payment.discount_amount).toFixed(0)}
                                                                </Typography>
                                                            ) : <Typography variant="body2" color="text.disabled">—</Typography>}
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.5, fontWeight: 700 }}>
                                                            {isFree
                                                                ? <Chip label="FREE" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} />
                                                                : `₹${Number(payment.amount).toFixed(0)} ${payment.currency}`
                                                            }
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.5 }}>
                                                            {payment.applied_coupon_code
                                                                ? <Chip label={payment.applied_coupon_code} size="small" color="success" icon={<CouponIcon sx={{ fontSize: '13px !important' }} />} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }} />
                                                                : <Typography variant="body2" color="text.disabled">—</Typography>
                                                            }
                                                        </TableCell>
                                                        <TableCell sx={{ py: 1.5 }}>{payment.payment_method}</TableCell>
                                                        <TableCell sx={{ py: 1.5 }}>
                                                            <Chip
                                                                label={payment.status}
                                                                size="small"
                                                                color={payment.status === 'success' ? 'success' : 'default'}
                                                                variant="outlined"
                                                                sx={{ height: 22, fontSize: '0.7rem' }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">No payment history found</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* SaaS Subscription Invoices - Full Width */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>SaaS Subscription Invoices</Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        onClick={handleGenerateInvoice}
                                        disabled={generatingInvoice || !store?.subscription}
                                        sx={{ borderRadius: 1.5, fontWeight: 'bold', fontSize: '0.75rem', py: 0.5, px: 2 }}
                                    >
                                        {generatingInvoice ? <CircularProgress size={16} color="inherit" /> : 'Generate Active Invoice'}
                                    </Button>
                                    {loadingInvoices && <CircularProgress size={20} />}
                                </Stack>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {invoices && invoices.length > 0 ? (
                                <Box overflow="auto">
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Invoice Number</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Plan Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Billing Cycle</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Amount</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', py: 1.5, textAlign: 'right' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {invoices.map((inv) => (
                                                <TableRow key={inv.id} hover>
                                                    <TableCell sx={{ py: 1.5, fontWeight: 500 }}>{inv.invoiceNumber}</TableCell>
                                                    <TableCell sx={{ py: 1.5 }}>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                                                    <TableCell sx={{ py: 1.5 }}>{inv.plan?.name || 'SaaS Plan'}</TableCell>
                                                    <TableCell sx={{ py: 1.5, textTransform: 'capitalize' }}>{inv.billing_cycle}</TableCell>
                                                    <TableCell sx={{ py: 1.5, fontWeight: 600 }}>{inv.currency} {Number(inv.amount).toFixed(2)}</TableCell>
                                                    <TableCell sx={{ py: 1.5 }}>
                                                        <Chip 
                                                            label={inv.status.toUpperCase()} 
                                                            size="small" 
                                                            color={inv.status === 'paid' ? 'success' : 'warning'} 
                                                            variant="filled"
                                                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            {inv.pdf_url && (
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    startIcon={<DownloadIcon />}
                                                                    href={inv.pdf_url.startsWith('http') ? inv.pdf_url : `http://localhost:3000${inv.pdf_url}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{ borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                                                                >
                                                                    Download
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="secondary"
                                                                startIcon={resendingInvoiceId === inv.id ? <CircularProgress size={12} color="inherit" /> : <EmailIcon />}
                                                                onClick={() => handleResendInvoice(inv.id)}
                                                                disabled={resendingInvoiceId !== null}
                                                                sx={{ borderRadius: 1.5, fontSize: '0.75rem', py: 0.25 }}
                                                            >
                                                                Resend Email
                                                            </Button>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">No invoices found for this store</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Change Plan Dialog */}
            <Dialog 
                open={openChangePlanDialog} 
                onClose={() => !updatingPlan && setOpenChangePlanDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                    Change Store Plan
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Manually upgrade or downgrade the plan for <strong>{store.name}</strong>. This will deactivate the current active subscription and establish a new manual subscription.
                    </Typography>
                    
                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel id="plan-select-label">New Plan</InputLabel>
                            <Select
                                labelId="plan-select-label"
                                value={selectedPlanId}
                                label="New Plan"
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                            >
                                {plans.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>
                                        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                                            <Typography variant="body2" fontWeight="medium">{p.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                {p.category === 'page_builder' ? 'Page Builder' : 'E-commerce'} • ₹{selectedBillingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice}/{selectedBillingCycle === 'yearly' ? 'yr' : 'mo'}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="billing-cycle-label">Billing Cycle</InputLabel>
                            <Select
                                labelId="billing-cycle-label"
                                value={selectedBillingCycle}
                                label="Billing Cycle"
                                onChange={(e) => setSelectedBillingCycle(e.target.value)}
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={() => setOpenChangePlanDialog(false)} 
                        disabled={updatingPlan}
                        variant="text"
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpdatePlan} 
                        disabled={updatingPlan || !selectedPlanId}
                        variant="contained"
                        color="primary"
                        startIcon={updatingPlan && <CircularProgress size={16} color="inherit" />}
                    >
                        {updatingPlan ? "Updating..." : "Update Plan"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Feedback Snackbar */}
            <Snackbar 
                open={!!feedback} 
                autoHideDuration={6000} 
                onClose={() => setFeedback(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                {feedback ? (
                    <Alert onClose={() => setFeedback(null)} severity={feedback.type} sx={{ width: '100%', borderRadius: 2 }}>
                        {feedback.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
    const isUnlimited = limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const color = percentage > 90 ? 'error' : percentage > 70 ? 'warning' : 'primary';

    return (
        <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="caption" fontWeight="bold">
                    {used} / {isUnlimited ? '∞' : limit}
                </Typography>
            </Box>
            <Box 
                sx={{ 
                    height: 8, 
                    width: '100%', 
                    bgcolor: 'grey.100', 
                    borderRadius: 4,
                    overflow: 'hidden'
                }}
            >
                <Box 
                    sx={{ 
                        height: '100%', 
                        width: `${isUnlimited ? (used > 0 ? 10 : 0) : percentage}%`, 
                        bgcolor: `${color}.main`,
                        borderRadius: 4,
                        transition: 'width 0.5s ease-in-out'
                    }} 
                />
            </Box>
        </Box>
    );
}
