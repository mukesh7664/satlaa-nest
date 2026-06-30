"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { adminApi, CreateAdminData } from "@/services/admin.api";
import { toast } from "sonner";
import PermissionSelector from "@/components/PermissionSelector";
import { useAppSelector } from "@/store/hooks";

export default function NewAdminPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const isSuperAdmin = admin?.role === "admin";
  const isStoreAdmin = admin?.role === "admin";

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateAdminData>({
    name: "",
    email: "",
    password: "",
    role: "sub_admin",
    adminType: isStoreAdmin ? "admin" : "store_owner",
    customType: "",
    phone: "",
    permissions: [],
  } as CreateAdminData);

  // Automatic permission mapping based on Admin Type
  React.useEffect(() => {
    if (!formData.adminType || formData.adminType === "custom" || formData.adminType === "store_owner") return;

    const rolePermissions: Record<string, string[]> = {
      order_manager: [
        "dashboard.view",
        "orders.view",
        "orders.edit",
        "estimates.view",
        "estimates.edit",
        "invoices.view",
        "invoices.edit",
        "inquiries.view",
        "inquiries.edit",
      ],
      product_manager: [
        "dashboard.view",
        "products.view",
        "products.create",
        "products.edit",
        "brands.manage",
        "collections.manage",
        "products.manage",
        "tags.manage",
      ],
      support_agent: [
        "dashboard.view",
        "customers.view",
        "customers.edit",
        "inquiries.view",
        "inquiries.edit",
      ],
      marketing_expert: [
        "dashboard.view",
        "pages.view",
        "pages.edit",
        "sections.view",
        "sections.edit",
        "settings.seo",
        "marketing.view",
      ],
      delivery_staff: [
        "orders.view",
      ],
      admin: [
        "dashboard.view",
        "pages.view",
        "pages.edit",
        "sections.view",
        "sections.edit",
        "media.view",
        "media.edit",
        "settings.general",
        "settings.domain",
        "settings.theme",
        "settings.seo",
        "settings.email",
      ]
    };

    const newPermissions = rolePermissions[formData.adminType] || [];

    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  }, [formData.adminType]);

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      setLoading(true);
      const dataToSave = {
        ...formData,
        adminType: formData.adminType === "custom" ? formData.customType : formData.adminType
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { customType, ...finalData } = dataToSave as any;
      
      await adminApi.createAdmin(finalData);
      toast.success("Admin created successfully");
      router.push("/admin-list");
    } catch (error: any) {
      toast.error(error.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex items-center gap-4 mb-6">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin-list")}
          sx={{ color: "text.secondary" }}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-800">
          {isStoreAdmin ? "Add New Sub-Admin" : "Add New Admin"}
        </h1>
      </div>

      <div className="">
        <Card
          sx={{
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            borderRadius: "12px",
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Name *</label>
                  <TextField
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, name: e.target.value }))
                    }
                    fullWidth
                    size="small"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Email *</label>
                  <TextField
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, email: e.target.value }))
                    }
                    fullWidth
                    size="small"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Admin Type</label>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.adminType || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          adminType: e.target.value,
                          customType: e.target.value === "custom" ? "" : prev.customType
                        }))
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      {isSuperAdmin && (
                        <MenuItem value="store_owner">Store Owner</MenuItem>
                      )}
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
                      value={formData.role}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          role: e.target.value as any,
                        }))
                      }
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="sub_admin">Sub Admin</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                {formData.adminType === "custom" && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Enter Custom Type</label>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.customType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customType: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Password *</label>
                  <TextField
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((d) => ({ ...d, password: e.target.value }))
                    }
                    fullWidth
                    size="small"
                    helperText="Minimum 8 characters"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-bold block mb-1.5 uppercase tracking-wide">Phone Number (Optional)</label>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              {formData.role !== "admin" && (
                <div className="border-t pt-6">
                  <PermissionSelector
                    selectedPermissions={formData.permissions || []}
                    onChange={(permissions) =>
                      setFormData((d) => ({ ...d, permissions }))
                    }
                    variant="minimal"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  onClick={() => router.push("/admin-list")}
                  sx={{ color: "slate.500", textTransform: "none" }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    bgcolor: "var(--primary)",
                    "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                    textTransform: "none",
                    minWidth: "120px",
                  }}
                >
                  {loading ? "Creating..." : isStoreAdmin ? "Create Sub-Admin" : "Create Admin"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
