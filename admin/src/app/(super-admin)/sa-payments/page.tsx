"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { apiService } from "@/services/api";

interface PaymentAttempt {
    id: string;
    store_name: string;
    amount: number;
    currency: string;
    payment_status: string;
    created_at: string;
    admin?: {
        name: string;
        email: string;
    };
    plan?: {
        name: string;
    };
    registration_data?: {
        name: string;
        email: string;
        phone?: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id: string;
    status: string;
    paid_at: string;
    created_at: string;
    store?: {
        name: string;
    };
}

export default function PaymentsPage() {
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const endpoint = tab === 0 ? "/admin/payments" : "/admin/payment-attempts";
            const response = await apiService.get(endpoint, {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                }
            });
            setData(response.data || []);
            setTotal(response.pagination?.total || 0);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tab, page, rowsPerPage]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        setPage(0);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box p={3}>
            <Typography variant="h4" fontWeight="bold" mb={3}>Payments Management</Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
                    <Tab label="Successful Payments" />
                    <Tab label="Payment Attempts" />
                </Tabs>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                                {tab === 0 ? (
                                    <>
                                        <TableCell sx={{ fontWeight: "bold" }}>Store</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Method</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Transaction ID</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ fontWeight: "bold" }}>Store Name</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Plan</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <CircularProgress size={24} />
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No data found</TableCell>
                                </TableRow>
                            ) : (
                                data.map((item: any) => (
                                    <TableRow key={item.id} hover>
                                        {tab === 0 ? (
                                            <>
                                                <TableCell>{item.store?.name || 'N/A'}</TableCell>
                                                <TableCell>{item.amount} {item.currency}</TableCell>
                                                <TableCell>{item.payment_method}</TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{item.transaction_id}</TableCell>
                                                <TableCell>{new Date(item.paid_at || item.created_at).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={item.status} 
                                                        color={item.status === 'success' ? 'success' : 'default'} 
                                                        size="small" 
                                                    />
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{item.store_name}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2">{item.admin?.name || item.registration_data?.name || 'N/A'}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{item.admin?.email || item.registration_data?.email || ''}</Typography>
                                                        {item.registration_data?.phone && !item.admin && (
                                                            <Typography variant="caption" color="text.secondary" display="block">{item.registration_data.phone}</Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{item.plan?.name || 'N/A'}</TableCell>
                                                <TableCell>{item.amount} {item.currency}</TableCell>
                                                <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={item.payment_status} 
                                                        color={
                                                            item.payment_status === 'success' ? 'success' : 
                                                            item.payment_status === 'failed' ? 'error' : 'warning'
                                                        } 
                                                        size="small" 
                                                    />
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
