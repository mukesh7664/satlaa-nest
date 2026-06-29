"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { CircularProgress } from "@mui/material";
import SuperAdminLayoutWrapper from "@/components/super-admin/SuperAdminLayoutWrapper";
import { isTokenExpired } from "@/utils/auth";
import { logout } from "@/store/slices/authSlice";

export default function SuperAdminLayoutGroup({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, admin, token, loading } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (!loading) {
            const isExpired = token && isTokenExpired(token);
            if (isExpired) {
                dispatch(logout());
                router.push("/login");
            } else if (!isAuthenticated) {
                router.push("/login");
            } else if (admin?.role !== "super_admin") {
                router.push("/dashboard"); // Kick regular admins out
            }
        }
    }, [isAuthenticated, admin, loading, router, token, dispatch]);

    const isExpired = token && isTokenExpired(token);

    if (loading || !isAuthenticated || isExpired || admin?.role !== "super_admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return <SuperAdminLayoutWrapper>{children}</SuperAdminLayoutWrapper>;
}
