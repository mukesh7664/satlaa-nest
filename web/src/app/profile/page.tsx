"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock, Mail, Phone, Globe, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PasswordInputProps {
  id: string;
  label: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  showPassword,
  toggleShowPassword,
  value,
  onChange,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</Label>
    <div className="relative group">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        className="h-14 rounded-xl border-slate-100 bg-slate-50/50 pr-12 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20"
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-blue-600 transition-colors"
        onClick={toggleShowPassword}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, updateProfile, changePassword, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });

  useEffect(() => {
    if (user) {
      const nameParts = ((user as any).name || "").trim().split(" ");
      const firstName = nameParts[0] || (user as any).firstName || "";
      const lastName = nameParts.slice(1).join(" ") || (user as any).lastName || "";
      let phoneNum = (user as any).phone || "";
      let countryCode = "+91";

      if (typeof phoneNum === "string" && phoneNum.startsWith("+")) {
        const parts = phoneNum.split(/[\s-]/);
        if (parts.length > 1) {
          countryCode = parts[0];
          phoneNum = parts.slice(1).join("");
        }
      } else if (typeof phoneNum === "object" && phoneNum?.number) {
        phoneNum = phoneNum.number;
        countryCode = phoneNum.countryCode || "+91";
      }

      setFormData({ firstName, lastName, email: user.email || "", phone: phoneNum, countryCode });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    let key = id === "first-name" ? "firstName" : id === "last-name" ? "lastName" : id === "country-code" ? "countryCode" : id;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: { countryCode: formData.countryCode, number: formData.phone },
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-900">Personal Info</h1>
        <p className="text-slate-500 font-medium">Manage your profile details and security settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Personal Details Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Basic Details</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Information</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                  <Input
                    id="first-name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="h-14 rounded-xl border-slate-100 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                  <Input
                    id="last-name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="h-14 rounded-xl border-slate-100 bg-slate-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                  <div className="relative">
                    <Input id="email" value={formData.email} disabled className="h-14 rounded-xl border-slate-100 bg-slate-100/50 cursor-not-allowed pl-12" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                  <div className="flex gap-2">
                    <select
                      id="country-code"
                      className="w-24 rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm font-bold text-slate-700 focus:outline-none"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <div className="relative flex-1">
                      <Input id="phone" type="tel" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 pl-12 transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20" value={formData.phone} onChange={handleInputChange} />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700 px-10 py-6 font-black border-none shadow-md shadow-blue-200" disabled={isLoading}>
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Security Settings</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password Management</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handlePasswordChange} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PasswordInput id="current-password" label="Current Password" showPassword={showCurrentPassword} toggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <PasswordInput id="new-password" label="New Password" showPassword={showNewPassword} toggleShowPassword={() => setShowNewPassword(!showNewPassword)} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="max-w-md">
                <PasswordInput id="confirm-password" label="Confirm New Password" showPassword={showConfirmPassword} toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <div className="pt-4">
                <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700 px-10 py-6 font-black border-none shadow-md shadow-blue-200" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
