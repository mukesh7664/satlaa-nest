"use client";
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Switch,
  InputAdornment,
  Chip,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2 as ProductIcon,
  NavigateNext,
  NavigateBefore,
} from "@mui/icons-material";
import { settingsApi } from "@/services/settings.api";
import { getCurrencySymbol } from "@/utils/currencyUtils";

// --- Types ---
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: boolean;
  description?: string;
  hsn_code?: string;
  tax_rate?: number;
}

// --- Mock Data ---
const mockCategories = ["Software", "Accessories", "Services"];

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone (128GB)",
    sku: "SKU-PHN-001",
    category: "Software",
    price: 699,
    stock: 45,
    status: true,
    description: "Latest model smartphone with 128GB storage.",
  },
  {
    id: "2",
    name: "Noise Cancelling Headphones",
    sku: "SKU-ACC-005",
    category: "Accessories",
    price: 199,
    stock: 12,
    status: true,
    description: "Premium wireless headphones.",
  },
  {
    id: "3",
    name: "Web Development License",
    sku: "SKU-SFT-022",
    category: "Software",
    price: 1500,
    stock: 100,
    status: true,
    description: "Annual standardized license key.",
  },
  {
    id: "4",
    name: "USB-C Cable (2m)",
    sku: "SKU-ACC-012",
    category: "Accessories",
    price: 15,
    stock: 0,
    status: false,
    description: "Durable braided cable.",
  },
];

// --- Sub-Components ---

interface ProductWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, "id">) => void;
  initialData?: Product;
  editMode: boolean;
  currencySymbol: string;
}

const ProductWizardModal: React.FC<ProductWizardModalProps> = ({
  open,
  onClose,
  onSave,
  initialData,
  editMode,
  currencySymbol,
}) => {
  const steps = ["Basic Info", "Inventory & Price", "Review"];
  const [activeStep, setActiveStep] = React.useState(0);
  const initialFormState: Omit<Product, "id"> = {
    name: "",
    sku: "",
    category: "",
    price: 0,
    stock: 0,
    status: true,
    description: "",
    hsn_code: "",
    tax_rate: 0,
  };
  const [formData, setFormData] = React.useState(initialFormState);

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData(initialFormState);
      }
      setActiveStep(0);
    }
  }, [open, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    // @ts-ignore
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSave(formData);
      onClose(); // Close modal after saving
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, padding: 1 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex justify-between items-center">
          <Typography variant="h6" fontWeight="bold">
            {editMode ? "Edit Product" : "Create New Product"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </div>
      </DialogTitle>

      <Box sx={{ width: "100%", mb: 3, mt: 1, px: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ minHeight: "300px", px: 4, py: 2 }}>
        {activeStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g. SKU-001"
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g. 8517"
              />
            </div>
            <div>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  {mockCategories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="col-span-1 md:col-span-2">
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <TextField
                fullWidth
                label={`Price (${currencySymbol})`}
                type="number"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currencySymbol}</InputAdornment>
                  ),
                }}
              />
            </div>
            <div>
              <FormControl fullWidth>
                <InputLabel>GST Rate (%)</InputLabel>
                <Select
                  name="tax_rate"
                  value={formData.tax_rate || 0}
                  label="GST Rate (%)"
                  onChange={handleSelectChange}
                >
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <MenuItem key={rate} value={rate}>
                      {rate}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <TextField
                fullWidth
                label="Final Sale Price (Incl. GST)"
                value={(Number(formData.price || 0) * (1 + Number(formData.tax_rate || 0) / 100)).toFixed(2)}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currencySymbol}</InputAdornment>
                  ),
                }}
              />
            </div>
            <div>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Typography variant="subtitle2">Product Status</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.status
                      ? "Product is visible to customers"
                      : "Product is hidden from store"}
                  </Typography>
                </div>
                <Switch
                  checked={formData.status}
                  name="status"
                  onChange={handleSwitchChange}
                  color="success"
                />
              </Paper>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formData.name}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    SKU
                  </Typography>
                  <Typography variant="body2">{formData.sku}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2">{formData.category}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body2">{currencySymbol}{formData.price}</Typography>
                </div>
                <div className="col-span-2">
                  <Divider sx={{ my: 1 }} />
                </div>
                <div className="col-span-2 flex justify-between items-center">
                  <Typography variant="body2" color="text.secondary">
                    Availability
                  </Typography>
                  <Chip
                    label={
                      formData.stock > 0
                        ? `${formData.stock} in stock`
                        : "Out of stock"
                    }
                    color={formData.stock > 0 ? "success" : "error"}
                    size="small"
                    variant="outlined"
                  />
                </div>
              </div>
            </Paper>
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "blue.50",
                borderRadius: 2,
                color: "blue.800",
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography variant="body2">
                Ready to {editMode ? "update" : "create"} this product? It will
                be immediately available in your inventory.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<NavigateBefore />}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={
            activeStep === steps.length - 1 ? undefined : <NavigateNext />
          }
          color="primary"
          sx={{}}
        >
          {activeStep === steps.length - 1
            ? editMode
              ? "Update Product"
              : "Create Product"
            : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this product? This action cannot be
        undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// --- Main Page ---

export default function ManageProductsPage() {
  // State: Data
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [storeSettings, setStoreSettings] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsApi.getSettings();
        setStoreSettings(settings);
      } catch (error) {
        console.error("Failed to fetch store settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const currencySymbol = getCurrencySymbol(storeSettings?.defaultCurrency || "INR");

  // State: UI & Filters
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  // State: Modals
  const [openWizard, setOpenWizard] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | undefined>(
    undefined
  );
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // --- Handlers ---
  const handleOpenAdd = () => {
    setEditProduct(undefined);
    setOpenWizard(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditProduct(product);
    setOpenWizard(true);
  };

  const handleCloseWizard = () => {
    setOpenWizard(false);
  };

  const handleSaveProduct = (formData: Omit<Product, "id">) => {
    if (editProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id ? { ...formData, id: editProduct.id } : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { ...formData, id: Date.now().toString() },
      ]);
    }
    // The modal will be closed by ProductWizardModal's internal logic after onSave
  };

  const handleDelete = () => {
    if (deleteId) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  // --- Logic: Filtering ---
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter
      ? p.category === categoryFilter
      : true;
    const matchesStatus =
      statusFilter === ""
        ? true
        : statusFilter === "active"
          ? p.status
          : !p.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 space-y-4 font-sans">
      <ProductWizardModal
        open={openWizard}
        onClose={handleCloseWizard}
        onSave={handleSaveProduct}
        initialData={editProduct}
        editMode={!!editProduct}
        currencySymbol={currencySymbol}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ProductIcon sx={{ color: "#7B3FF2", fontSize: 32 }} /> Products
            Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-10">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            py: 1,
          }}
        >
          Create Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <TextField
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flexGrow: 1,
              maxWidth: 350,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#7B3FF2" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {mockCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              color: "slate.600",
              borderColor: "slate.200",
            }}
            onClick={() => {
              setSearch("");
              setCategoryFilter("");
              setStatusFilter("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ bgcolor: "transparent" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8F9FA" }}>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Product Name
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    SKU
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Category
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Price
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Stock
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Status
                  </span>
                </TableCell>
                <TableCell align="right">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    Actions
                  </span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-400"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{ "&:hover": { bgcolor: "#f9f9f9" } }}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {p.description || "No description"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.sku}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          fontSize: "11px",
                          height: "20px",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {p.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800">
                        {currencySymbol}{p.price.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm ${p.stock < 10
                          ? "text-orange-600 font-medium"
                          : "text-slate-600"
                          }`}
                      >
                        {p.stock} units
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border ${p.status
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                          }`}
                      >
                        {p.status ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex justify-end gap-1">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(p)}
                          sx={{
                            color: "primary.main",
                            bgcolor: "primary.50",
                            "&:hover": { bgcolor: "primary.100" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(p.id)}
                          sx={{
                            color: "error.main",
                            bgcolor: "error.50",
                            "&:hover": { bgcolor: "error.100" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>


      <DeleteConfirmationDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
