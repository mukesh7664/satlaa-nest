"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert
} from "@mui/material";
import {
    People as PeopleIcon,
    Store as StoreIcon,
    Payment as RevenueIcon,
    CardMembership as PlansIcon,
    Domain as DomainIcon,
    History as SubscriptionsIcon
} from "@mui/icons-material";
import { apiService } from "@/services/api";
import { useAppSelector } from "@/store/hooks";

interface SaasStats {
    superAdminCount: number;
    adminCount: number;
    activeStores: number;
    expiredStores: number;
    totalPlans: number;
    domainManagement: number;
    totalSubscriptions: number;
    recentSubscriptions: any[];
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<SaasStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { token } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const data = await apiService.getSaaSSummary(token);
                setStats(data);
            } catch (err) {
                console.error("Dashboard error:", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const StatCard = ({ title, value, icon, color, subtitle }: any) => (
        <Card sx={{ height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', borderRadius: 3 }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${color}.lighter`,
                        color: `${color}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" fontWeight="bold">
                            {loading ? <CircularProgress size={24} /> : value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );

    if (loading && !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Platform Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Real-time metrics for your SaaS platform management.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Super Admins"
                    value={stats?.superAdminCount || 0}
                    icon={<PeopleIcon />}
                    color="primary"
                    subtitle="Platform Super Administrators"
                />
                <StatCard
                    title="Admins"
                    value={stats?.adminCount || 0}
                    icon={<PeopleIcon />}
                    color="info"
                    subtitle="Store Administrators"
                />
                <StatCard
                    title="Active Stores"
                    value={stats?.activeStores || 0}
                    icon={<StoreIcon />}
                    color="success"
                    subtitle={`${stats?.expiredStores || 0} expired stores`}
                />
                <StatCard
                    title="Subscription Plans"
                    value={stats?.totalPlans || 0}
                    icon={<PlansIcon />}
                    color="info"
                />
                <StatCard
                    title="Custom Domains"
                    value={stats?.domainManagement || 0}
                    icon={<DomainIcon />}
                    color="secondary"
                    subtitle="Connected by store owners"
                />
                <StatCard
                    title="Total Subscriptions"
                    value={stats?.totalSubscriptions || 0}
                    icon={<SubscriptionsIcon />}
                    color="error"
                    subtitle="Total active & inactive"
                />
            </Box>

            <Box mt={6}>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    Recent Subscriptions
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="recent subscriptions">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Expires</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats?.recentSubscriptions.map((sub: any) => (
                                <TableRow key={sub.id} hover>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {sub.store?.name || 'Unknown Store'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Store ID: {sub.store?.id?.substring(0, 8)}...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sub.plan?.name}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={sub.status}
                                            size="small"
                                            color={sub.status === 'active' ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(sub.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString() : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {stats?.recentSubscriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No recent subscriptions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
