"use client";
import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Stack,
    IconButton,
    MenuItem,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { apiService } from "@/services/api";
import { toast } from "sonner";

export default function NewSuperAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { token } = useAppSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "super_admin",
        adminType: "admin",
        customType: "",
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSave = {
                ...formData,
                adminType: formData.adminType === "custom" ? formData.customType : formData.adminType
            };
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { customType, ...finalData } = dataToSave as any;

            await apiService.post("/admin/admins-list", finalData);
            toast.success(`${formData.role === 'super_admin' ? 'Super Admin' : 'Super Sub Admin'} created successfully`);
            router.push("/admins");
        } catch (error: any) {
            toast.error(error.message || "Failed to create administrator");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton onClick={() => router.push("/admins")} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Create Platform Administrator
                </Typography>
            </Box>

            <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", borderRadius: 2, boxShadow: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Role"
                                name="role"
                                select
                                value={formData.role}
                                onChange={handleChange}
                                required
                                fullWidth
                                SelectProps={{ native: false }}
                            >
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                                <MenuItem value="super_sub_admin">Super Sub Admin</MenuItem>
                            </TextField>

                            <TextField
                                label="Admin Type"
                                name="adminType"
                                select
                                value={formData.adminType}
                                onChange={handleChange}
                                required
                                fullWidth
                                SelectProps={{ native: false }}
                            >
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="manager">Manager</MenuItem>
                                <MenuItem value="support">Support</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                                <MenuItem value="custom">Other / Custom</MenuItem>
                            </TextField>
                        </Box>

                        {formData.adminType === "custom" && (
                            <TextField
                                label="Custom Admin Type"
                                name="customType"
                                value={formData.customType}
                                onChange={handleChange}
                                required
                                fullWidth
                                variant="outlined"
                            />
                        )}

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />

                        <Box display="flex" justifyContent="flex-end" mt={2}>
                            <Button
                                type="button"
                                variant="outlined"
                                onClick={() => router.push("/admins")}
                                sx={{ mr: 2 }}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                            >
                                Create {formData.role === 'super_admin' ? 'Super Admin' : 'Super Sub Admin'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}
