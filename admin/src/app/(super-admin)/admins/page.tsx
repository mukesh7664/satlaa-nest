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
    Button,
    CircularProgress,
    TablePagination,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    MenuItem,
} from "@mui/material";
import { 
    Visibility as VisibilityIcon, 
    Edit as EditIcon,
} from "@mui/icons-material";
import { useAppSelector } from "@/store/hooks";
import { apiService } from "@/services/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserData {
    id: string;
    _id?: string; // Support for the _id returned by some endpoints
    email: string;
    name: string;
    role: string;
    adminType?: string;
    isActive: boolean;
    phone: string | null;
    createdAt: string;
}

export default function SuperAdminAdminsPage() {
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // View/Edit state
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<UserData | null>(null);
    const [editData, setEditData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
        adminType: "",
    });
    const [updating, setUpdating] = useState(false);
    const { token } = useAppSelector((state) => state.auth);

    const api = apiService;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/admins-list?page=${page + 1}&limit=${rowsPerPage}&type=super`);
            // API returns { data: [], pagination: { ... } }
            setUsers(response.data || []);
            setTotalItems(response.pagination?.total || 0);
        } catch (err: any) {
            setError(err.message);
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

    const handleEditClick = (admin: UserData) => {
        setSelectedAdmin(admin);
        setEditData({
            name: admin.name || "",
            email: admin.email || "",
            phone: admin.phone || "",
            role: admin.role || "super_admin",
            adminType: admin.adminType || "admin",
        });
        setEditOpen(true);
    };

    const handleViewClick = (admin: UserData) => {
        setSelectedAdmin(admin);
        setViewOpen(true);
    };

    const handleUpdateAdmin = async () => {
        if (!selectedAdmin) return;
        setUpdating(true);
        try {
            const adminId = selectedAdmin.id || selectedAdmin._id;
            await api.put(`/admin/admins-list/${adminId}`, editData);
            toast.success("Administrator updated successfully");
            setEditOpen(false);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message || "Failed to update administrator");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token, page, rowsPerPage]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Platform Administrators
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push('/admins/new')}
                    sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
                >
                    Add Platform Admin
                </Button>
            </Box>

            {error && (
                <Typography color="error" mb={2}>
                    Error: {error}
                </Typography>
            )}

            <TableContainer component={Paper} elevation={1} sx={{ mt: 3, borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'secondary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone Number</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id || user._id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {user.name || 'N/A'}
                                        </Typography>
                                        <Box display="flex" gap={1} mt={0.5}>
                                            <Chip 
                                                label={user.role?.replace('_', ' ').toUpperCase()} 
                                                size="small" 
                                                color={user.role === 'super_admin' ? 'secondary' : 'default'}
                                                sx={{ fontSize: '0.65rem', height: 20 }}
                                            />
                                            {user.adminType && (
                                                <Chip 
                                                    label={user.adminType.toUpperCase()} 
                                                    size="small" 
                                                    variant="outlined"
                                                    color="primary"
                                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        {user.phone || (
                                            <Typography variant="body2" color="text.secondary">
                                                N/A
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                            <IconButton 
                                                size="small" 
                                                color="primary"
                                                onClick={() => handleViewClick(user)}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="info"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
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

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Administrator Details</DialogTitle>
                <DialogContent dividers>
                    {selectedAdmin && (
                        <Stack spacing={2} py={1}>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Name</Typography>
                                <Typography variant="body1" fontWeight="medium">{selectedAdmin.name}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                <Typography variant="body1" fontWeight="medium">{selectedAdmin.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                <Box mt={0.5}>
                                    <Chip 
                                        label={selectedAdmin.role?.replace('_', ' ').toUpperCase()} 
                                        color={selectedAdmin.role === 'super_admin' ? 'secondary' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Admin Type</Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>{selectedAdmin.adminType?.toUpperCase() || 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                                <Typography variant="body1">{selectedAdmin.phone || 'N/A'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary">Joined Date</Typography>
                                <Typography variant="body1">
                                    {new Date(selectedAdmin.createdAt).toLocaleDateString()} {new Date(selectedAdmin.createdAt).toLocaleTimeString()}
                                </Typography>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Administrator</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} py={2}>
                        <TextField
                            label="Full Name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Email Address"
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            fullWidth
                            variant="outlined"
                        />
                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                            <TextField
                                label="Role"
                                select
                                value={editData.role}
                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                                <MenuItem value="super_sub_admin">Super Sub Admin</MenuItem>
                            </TextField>
                            <TextField
                                label="Admin Type"
                                select
                                value={editData.adminType}
                                onChange={(e) => setEditData({ ...editData, adminType: e.target.value })}
                                fullWidth
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="support">Support</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                            </TextField>
                        </Box>
                        <TextField
                            label="Phone Number"
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            fullWidth
                            variant="outlined"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3 }}>
                    <Button onClick={() => setEditOpen(false)} disabled={updating}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleUpdateAdmin}
                        disabled={updating}
                        startIcon={updating && <CircularProgress size={20} color="inherit" />}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
