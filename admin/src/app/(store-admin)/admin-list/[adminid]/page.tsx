"use client";
import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Button,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { adminApi, Admin, UpdateAdminData } from "@/services/admin.api";
import { toast } from "sonner";
import PermissionSelector from "@/components/PermissionSelector";
import { useAppSelector } from "@/store/hooks";

export default function AdminDetailsPage() {
  const { adminid } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { admin: loggedInAdmin } = useAppSelector((state) => state.auth);
  const isSuperAdmin = loggedInAdmin?.role === "admin";
  const isStoreAdmin = loggedInAdmin?.role === "admin";
  const isEdit = searchParams.get("edit") === "true";

  const [admin, setAdmin] = React.useState<Admin | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(isEdit);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editData, setEditData] = React.useState<UpdateAdminData>({
    name: "",
    email: "",
    password: "",
    role: "admin",
    adminType: "admin",
    customType: "",
    phone: "",
    permissions: [],
  } as UpdateAdminData);

  React.useEffect(() => {
    if (adminid) {
      fetchAdmin();
    }
  }, [adminid]);

  React.useEffect(() => {
    if (admin) {
      const isPredefined = ["store_owner", "order_manager", "product_manager", "support_agent", "marketing_expert", "delivery_staff", "admin"].includes(admin.adminType || "");
      setEditData({
        name: admin.name,
        email: admin.email,
        password: "",
        role: admin.role,
        adminType: (isPredefined ? admin.adminType : "custom") as any,
        customType: isPredefined ? "" : admin.adminType || "",
        phone: admin.phone || "",
        permissions: admin.permissions || [],
      });
    }
  }, [admin]);

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdminById(adminid as string);
      setAdmin(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...editData,
        adminType: editData.adminType === "custom" ? editData.customType : editData.adminType
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { customType, ...finalData } = dataToSave as any;

      if (!finalData.password) {
        delete finalData.password;
      }

      await adminApi.updateAdmin(adminid as string, finalData);
      toast.success("Admin updated successfully");
      setEditMode(false);
      setEditData(d => ({ ...d, password: "" }));
      fetchAdmin();
    } catch (error: any) {
      toast.error(error.message || "Failed to update admin");
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteAdmin(adminid as string);
      toast.success("Admin deleted successfully");
      setDeleteDialogOpen(false);
      setTimeout(() => router.push("/admin-list"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete admin");
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Admin",
      sub_admin: "Sub-Admin",
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size={32} className="text-slate-400" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-slate-500">Admin not found</p>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin-list")}
        >
          Back to Admin List
        </Button>
      </div>
    );
  }

  const isOwner = admin.adminType === "store_owner";

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push("/admin-list")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Admin Details
              {!editMode && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wide ${
                    admin.role === "admin"
                      ? "bg-blue-50 text-blue-700 border-blue-100"
                      : "bg-purple-50 text-purple-700 border-purple-100"
                  }`}
                >
                  {getRoleLabel(admin.role)}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Admin Type: <span className="font-medium text-slate-700">{admin.adminType?.replace("_", " ") || "N/A"}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ID: {admin.id} • Created {new Date(admin.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editMode && (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                size="small"
                sx={{
                  bgcolor: "var(--primary)",
                  "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                  textTransform: "none",
                }}
              >
                Edit
              </Button>
              <Tooltip title={isOwner ? "Store Owner cannot be deleted" : "Delete Admin"}>
                <span>
                  <IconButton
                    onClick={() => setDeleteDialogOpen(true)}
                    size="small"
                    disabled={isOwner}
                    sx={{
                      color: isOwner ? "#e2e8f0" : "#ef4444",
                      "&:hover": { bgcolor: isOwner ? "transparent" : "#fef2f2" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className="">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <PersonIcon fontSize="small" className="text-slate-400" />
              Profile Information
            </h2>
          </div>

          <div className="p-6">
            {editMode ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Name</label>
                    <TextField
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, name: e.target.value }))
                      }
                      fullWidth
                      size="small"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Email</label>
                    <TextField
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, email: e.target.value }))
                      }
                      fullWidth
                      size="small"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Phone</label>
                    <TextField
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, phone: e.target.value }))
                      }
                      fullWidth
                      size="small"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">New Password</label>
                    <TextField
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={editData.password}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, password: e.target.value }))
                      }
                      fullWidth
                      size="small"
                      helperText="Only fill if you want to change the password"
                    />
                  </div>
                  {!isOwner && (
                    <>
                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Admin Type</label>
                        <FormControl fullWidth size="small">
                          <Select
                            value={editData.adminType || ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                adminType: e.target.value,
                                customType: e.target.value === "custom" ? "" : prev.customType
                              }))
                            }
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            {isSuperAdmin && <MenuItem value="store_owner">Store Owner</MenuItem>}
                            <MenuItem value="order_manager">Order Manager (Sales)</MenuItem>
                            <MenuItem value="product_manager">Inventory/Product Manager</MenuItem>
                            <MenuItem value="support_agent">Support Agent</MenuItem>
                            <MenuItem value="marketing_expert">Marketing Expert</MenuItem>
                            <MenuItem value="delivery_staff">Delivery Staff</MenuItem>
                            <MenuItem value="custom">Other / Custom</MenuItem>
                          </Select>
                        </FormControl>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Role</label>
                        <FormControl fullWidth size="small">
                          <Select
                            value={editData.role}
                            onChange={(e) =>
                              setEditData((d) => ({
                                ...d,
                                role: e.target.value as any,
                              }))
                            }
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="sub_admin">Sub-Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                    </>
                  )}

                  {editData.adminType === "custom" && !isOwner && (
                    <div className="md:col-span-2">
                      <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Enter Custom Type</label>
                      <TextField
                        fullWidth
                        size="small"
                        value={editData.customType}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            customType: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                {!isOwner && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
                      Assign Permissions
                    </p>
                    <PermissionSelector
                      selectedPermissions={editData.permissions || []}
                      onChange={(permissions) =>
                        setEditData((d) => ({ ...d, permissions }))
                      }
                      disabled={false}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setEditMode(false);
                      if (admin) {
                        const isPredefined = ["store_owner", "order_manager", "product_manager", "support_agent", "marketing_expert", "delivery_staff", "admin"].includes(admin.adminType || "");
                        setEditData({
                          name: admin.name,
                          email: admin.email,
                          password: "",
                          role: admin.role,
                          adminType: (isPredefined ? admin.adminType : "custom") as any,
                          customType: isPredefined ? "" : admin.adminType || "",
                          phone: admin.phone || "",
                          permissions: admin.permissions || [],
                        });
                      }
                    }}
                    sx={{ color: "slate.500", textTransform: "none" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    sx={{
                      bgcolor: "#10b981",
                      "&:hover": { bgcolor: "#059669" },
                      textTransform: "none",
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                      Full Name
                    </p>
                    <p className="text-base font-medium text-slate-800">
                      {admin.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                      Role
                    </p>
                    <p className="text-base text-slate-800 capitalize">
                      {getRoleLabel(admin.role)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
                      <EmailIcon fontSize="inherit" /> Email
                    </p>
                    <p className="text-base text-slate-800">{admin.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
                      <PhoneIcon fontSize="inherit" /> Phone
                    </p>
                    <p className="text-base text-slate-800">
                      {admin.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {!isOwner && (
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3">
                      Permissions
                    </p>
                    {admin.role === "admin" ? (
                      <p className="text-sm text-slate-600 italic">
                        Admin has all permissions.
                      </p>
                    ) : (
                      <div className="opacity-75 pointer-events-none">
                        <PermissionSelector
                          selectedPermissions={admin.permissions || []}
                          onChange={() => {}}
                          disabled={true}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
                      <EventIcon fontSize="inherit" /> Created At
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(admin.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1 flex items-center gap-1">
                      <EventIcon fontSize="inherit" /> Last Updated
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(admin.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <div className="text-sm text-slate-600">
            Are you sure you want to delete this admin user{" "}
            <strong>{admin.name}</strong>? This action cannot be undone.
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            size="small"
            sx={{ color: "slate.500" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            size="small"
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
