"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { adminApi, Admin } from "@/services/admin.api";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function AdminListPage() {
  const { admin } = useAppSelector((state) => state.auth);
  // Only super_admin or admins.edit can manage admins
  const canEdit =
    admin?.role === "super_admin" ||
    admin?.role === "store_admin" ||
    admin?.permissions?.includes("admins.edit");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [adminToDelete, setAdminToDelete] = React.useState<string | null>(null);
  const router = useRouter();
  const { subscription, usage, limits, loading: limitsLoading } = usePlanLimits();
  
  const adminUsed = usage?.users?.used || admins.length;
  const adminLimit = usage?.users?.limit || limits.users;
  const isLimitReached = adminLimit !== -1 && adminUsed >= adminLimit;
  
  const storeOwner = admins.find((a) => a.role === "store_admin");
  const subAdmins = admins.filter((a) => a.role !== "store_admin");

  const paginatedSubAdmins = subAdmins.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Fetch admins on mount
  React.useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAdminToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    try {
      await adminApi.deleteAdmin(adminToDelete);
      toast.success("Admin deleted successfully");
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete admin");
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      super_sub_admin: "Super Sub-Admin",
      store_admin: "Store Admin",
      store_sub_admin: "Store Sub-Admin",
    };
    return roleMap[role] || role;
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Admin Users</h1>
          <div className="flex items-center gap-4">
            {subscription && !limitsLoading && (
              <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${isLimitReached ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                ADMINS: {adminUsed} / {adminLimit === -1 ? 'Unlimited' : adminLimit}
              </div>
            )}
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push("/admin-list/new")}
                disabled={isLimitReached}
                sx={{
                  bgcolor: "var(--primary)",
                  "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                }}
              >
                {admin?.role === "store_admin" ? "Add Sub-Admin" : "Add Admin"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {storeOwner && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Store Owner</h2>
          <div className="bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden border-l-4 border-l-amber-400">
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                     <TableCell sx={{ width: '20%', py: 1.5 }}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {storeOwner.name}
                          </span>
                          <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-wider">
                            Owner
                          </span>
                        </div>
                     </TableCell>
                     <TableCell sx={{ width: '15%' }}>
                        <span className="text-sm text-slate-600 font-medium">
                          {storeOwner.adminType || "store_owner"}
                        </span>
                     </TableCell>
                     <TableCell sx={{ width: '15%' }}>
                        <span className="text-sm text-slate-500">
                          {storeOwner.createdAt ? new Date(storeOwner.createdAt).toLocaleDateString() : "-"}
                        </span>
                     </TableCell>
                     <TableCell>
                        <span className="text-sm text-slate-600">
                          {storeOwner.email}
                        </span>
                     </TableCell>
                     <TableCell>
                        <span className="text-sm text-slate-600">
                          {storeOwner.phone || "-"}
                        </span>
                     </TableCell>
                     <TableCell>
                        <span className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-medium whitespace-nowrap">
                          {getRoleLabel(storeOwner.role)}
                        </span>
                     </TableCell>
                     <TableCell align="right">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin-list/${storeOwner.id || storeOwner._id}?edit=true`)}
                            sx={{ color: "var(--primary)", "&:hover": { bgcolor: "#eff6ff" } }}
                            title="Edit Profile"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </div>
                     </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      )}

      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sub-Admins</h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <CircularProgress size={32} className="text-slate-400" />
          </div>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Created At
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Phone
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSubAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ py: 8, color: "#64748b" }}
                      >
                        No sub-admins found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSubAdmins.map((admin: any) => (
                      <TableRow
                        key={admin.id || admin._id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700 text-sm">
                              {admin.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {admin.adminType || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {admin.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {admin.phone || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${admin.role === "super_admin"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : admin.role === "store_admin"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : admin.role === "store_sub_admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-100"
                                  : "bg-green-50 text-green-700 border-green-100"
                              }`}
                          >
                            {getRoleLabel(admin.role)}
                          </span>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(`/admin-list/${admin.id || admin._id}`)
                              }
                              sx={{
                                color: "#64748b",
                                "&:hover": {
                                  color: "#0f172a",
                                  bgcolor: "#f1f5f9",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            {canEdit && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    router.push(
                                      `/admin-list/${admin.id || admin._id}?edit=true`
                                    )
                                  }
                                  sx={{
                                    color: "#3b82f6",
                                    "&:hover": { bgcolor: "#eff6ff" },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteClick(admin.id || admin._id)}
                                  disabled={admin.role === "store_admin"}
                                  sx={{
                                    color: admin.role === "store_admin" ? "#e2e8f0" : "#ef4444",
                                    "&:hover": { bgcolor: admin.role === "store_admin" ? "transparent" : "#fef2f2" },
                                  }}
                                  title={admin.role === "store_admin" ? "Store Owner cannot be deleted" : "Delete Admin"}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={subAdmins.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{
                borderTop: "1px solid #e2e8f0",
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.875rem",
                  color: "#64748b",
                },
              }}
            />
          </>
        )}
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
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this admin user? This action cannot
            be undone.
          </p>
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
            onClick={handleDeleteConfirm}
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
