"use client";

import { Avatar as MuiAvatar } from "@mui/material";
import { useAppSelector } from "@/store/hooks";

export default function ProfilePage() {
  const { admin } = useAppSelector((state) => state.auth);

  if (!admin) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // Split name for UI if possible
  const nameParts = admin.name?.split(" ") || ["Admin"];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Profile Card Header */}
        <div className="border-b border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <MuiAvatar
              src={admin.avatar || ""}
              sx={{
                width: 64,
                height: 64,
                bgcolor: "#408dfb",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              {admin.name?.charAt(0).toUpperCase()}
            </MuiAvatar>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{admin.name}</h2>
              <p className="text-gray-500 text-sm">
                {admin.role?.replace("_", " ").toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
            <div>
              <p className="text-gray-400 font-medium mb-1">First Name</p>
              <p className="font-semibold text-slate-700">{firstName}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Last Name</p>
              <p className="font-semibold text-slate-700">{lastName || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Email address</p>
              <p className="font-semibold text-slate-700">{admin.email}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Phone</p>
              <p className="font-semibold text-slate-700">{admin.phone || "Not provided"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-400 font-medium mb-1">Bio</p>
              <p className="font-semibold text-slate-700">
                {admin.adminType === "store_owner" ? "Store Administrator and Platform Owner." : "SaaS Platform Staff."}
              </p>
            </div>
          </div>
        </div>

        {/* Address Section - Placeholder as admins table doesn't have these yet */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Account Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
            <div>
              <p className="text-gray-400 font-medium mb-1">Role Type</p>
              <p className="font-semibold text-slate-700 capitalize">{admin.role?.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Account Created</p>
              <p className="font-semibold text-slate-700">
                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Just now"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Status</p>
              <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-medium mb-1">Permissions</p>
              <p className="font-semibold text-slate-700">
                {admin.permissions?.includes("*") ? "Full Access" : `${admin.permissions?.length || 0} Modules`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
