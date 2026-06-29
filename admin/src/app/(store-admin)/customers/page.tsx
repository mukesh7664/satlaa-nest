"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  TablePagination,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { customersApi, Customer } from "@/services/customers.api";
import { toast } from "sonner";
import QuickUserCreateModal from "@/components/modals/QuickUserCreateModal";
import { useAppSelector } from "@/store/hooks";

export default function UsersPage() {
  const router = useRouter();
  const { admin } = useAppSelector((state) => state.auth);
  const canEdit = true; // both super_admin and store admins should be able to create & edit customers

  const [search, setSearch] = React.useState("");
  const [users, setUsers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customersApi.getCustomers({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setUsers(response.data);
      setTotal(response.pagination.total);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users");
      toast.error(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await customersApi.deleteCustomer(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setPage(0);
  };

  const handleUserCreated = (newUser: any) => {
    toast.success("Customer created successfully");
    fetchUsers();
    setCreateModalOpen(false);
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your customer directory and details.</p>
          </div>
          {canEdit && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{
                textTransform: "none",
                bgcolor: "#0f172a",
                "&:hover": { bgcolor: "#1e293b" },
                fontWeight: 600,
                px: 3,
              }}
            >
              Create Customer
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <TextField
            placeholder="Search customers..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                fontSize: "0.875rem",
                "& fieldset": { border: "none" },
                "& .MuiInputBase-input": { py: 1 },
              },
            }}
            sx={{
              width: 300,
              bgcolor: "slate.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "slate.200",
            }}
          />

          {search && (
            <Button
              startIcon={<CloseIcon />}
              size="small"
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                color: "slate.500",
                borderColor: "slate.300",
                "&:hover": { bgcolor: "slate.50" },
              }}
              variant="outlined"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <CircularProgress size={32} className="text-slate-400" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50">{error}</div>
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
                      Customer
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
                      Contact
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
                      Status
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
                      Joined
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
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ py: 8, color: "#64748b" }}
                      >
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f8fafc" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: "#e2e8f0",
                                color: "#475569",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                              }}
                            >
                              {user.name
                                ? user.name[0].toUpperCase()
                                : user.firstName
                                  ? user.firstName[0].toUpperCase()
                                  : "U"}
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-700 text-sm">
                                {user.name ||
                                  `${user.firstName} ${user.lastName}`}
                              </div>
                              <div className="text-xs text-slate-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            {user.phone
                              ? typeof user.phone === "object"
                                ? `${(user.phone as any).countryCode || ""} ${(user.phone as any).number || ""}`
                                : user.phone
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${user.isActive
                              ? "bg-green-50 text-green-700 border-green-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(`/customers/${user.id}`)
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
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(user.id)}
                                sx={{
                                  color: "#ef4444",
                                  "&:hover": { bgcolor: "#fef2f2" },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
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
              count={total}
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
            Are you sure you want to delete this customer? This action cannot be
            undone.
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

      <QuickUserCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </div>
  );
}
