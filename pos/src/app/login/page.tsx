"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/authSlice";
import { apiService } from "@/services/api";

const ALLOWED_ROLES = ["pos_user", "admin"];

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.login(email.trim(), password);
      const admin = res.admin;
      if (!admin || !ALLOWED_ROLES.includes(admin.role)) {
        toast.error("This account is not allowed to use the POS.");
        setLoading(false);
        return;
      }
      dispatch(
        loginSuccess({
          user: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
          },
          token: res.token,
        })
      );
      toast.success("Welcome back!");
      router.replace("/billing");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-[0px_2px_12px_rgba(0,0,0,0.06)]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#408dfb] text-xl font-bold text-white">
            F
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-800">Fanostyle POS</h1>
            <p className="text-sm text-slate-400">Sign in to start billing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#408dfb]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-[#f8fafc] px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#408dfb]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center rounded-lg bg-[#408dfb] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
