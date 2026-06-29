"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  BarChart2,
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  RotateCcw,
  GitCompare,
  ChevronDown,
  Download,
  Calendar,
} from "lucide-react";
import ColumnSelectionModal from "@/components/Reports/ColumnSelectionModal";
import OverviewTab from "./components/tabs/OverviewTab";
import SalesTab from "./components/tabs/SalesTab";
import ProductsTab from "./components/tabs/ProductsTab";
import CustomersTab from "./components/tabs/CustomersTab";
import FinanceTab from "./components/tabs/FinanceTab";
import OperationsTab from "./components/tabs/OperationsTab";
import ExportTab from "./components/tabs/ExportTab";

// Legacy Report types for Export card mappings
const reportTypes = [
  {
    key: "products",
    label: "Products Report",
    icon: <ShoppingBag className="w-5 h-5 text-blue-500" />,
    description: "Export product details including stock, price, and contribution rates.",
  },
  {
    key: "customers",
    label: "Users Report",
    icon: <Users className="w-5 h-5 text-green-500" />,
    description: "Export customer details including email, purchase count, and spent.",
  },
  {
    key: "orders",
    label: "Orders Report",
    icon: <BarChart2 className="w-5 h-5 text-purple-500" />,
    description: "Export order details including customer, totals, and fulfillment status.",
  },
  {
    key: "invoices",
    label: "Invoices Report",
    icon: <CreditCard className="w-5 h-5 text-orange-500" />,
    description: "Export transaction invoice details including payment channels and GST taxes.",
  },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [globalPreset, setGlobalPreset] = useState<string>("30D");
  const [compareEnabled, setCompareEnabled] = useState<boolean>(true);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Tab Data States
  const [salesData, setSalesData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any>(null);
  const [customersData, setCustomersData] = useState<any>(null);
  const [financeData, setFinanceData] = useState<any>(null);
  const [operationsData, setOperationsData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);

  // Legacy Card Download States
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<{ key: string; label: string } | null>(null);
  const [dateRanges, setDateRanges] = useState<{
    [key: string]: { startDate: string; endDate: string; activePreset: string };
  }>({});

  // Setup Date Presets
  const applyPreset = (preset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "7D":
        start.setDate(today.getDate() - 7);
        break;
      case "30D":
        start.setDate(today.getDate() - 30);
        break;
      case "90D":
        start.setDate(today.getDate() - 90);
        break;
      case "YTD":
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        break;
    }

    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    setDateRange({
      startDate: startDateStr,
      endDate: endDateStr,
    });
  };

  useEffect(() => {
    applyPreset("30D");

    // Initialize legacy report dates
    const initialRanges: any = {};
    reportTypes.forEach((report) => {
      const today = new Date();
      const first = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
      initialRanges[report.key] = {
        startDate: first,
        endDate: last,
        activePreset: "month",
      };
    });
    setDateRanges(initialRanges);
  }, []);

  const handleGlobalDateChange = (field: "startDate" | "endDate", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setGlobalPreset("Custom");
  };

  // Format currency helper
  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Fetch API handler
  const fetchTabData = async (tabIndex: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const { startDate, endDate } = dateRange;
    const urlBase = `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/analytics`;

    try {
      if (tabIndex === 0) {
        // Overview loads all data in parallel to feed sub-sections
        const [salesRes, productsRes, customersRes, operationsRes, inventoryRes] = await Promise.all([
          axios.get(`${urlBase}/sales?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${urlBase}/products?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${urlBase}/customers?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${urlBase}/operations?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${urlBase}/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setSalesData(salesRes.data);
        setProductsData(productsRes.data);
        setCustomersData(customersRes.data);
        setOperationsData(operationsRes.data);
        setInventoryData(inventoryRes.data);
      } else if (tabIndex === 1) {
        // Sales
        const res = await axios.get(`${urlBase}/sales?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesData(res.data);
      } else if (tabIndex === 2) {
        // Products
        const [prodRes, invRes] = await Promise.all([
          axios.get(`${urlBase}/products?startDate=${startDate}&endDate=${endDate}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${urlBase}/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProductsData(prodRes.data);
        setInventoryData(invRes.data);
      } else if (tabIndex === 3) {
        // Customers
        const res = await axios.get(`${urlBase}/customers?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomersData(res.data);
      } else if (tabIndex === 4) {
        // Finance
        const res = await axios.get(`${urlBase}/finance?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFinanceData(res.data);
      } else if (tabIndex === 5) {
        // Operations
        const res = await axios.get(`${urlBase}/operations?startDate=${startDate}&endDate=${endDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOperationsData(res.data);
      }
    } catch (error) {
      console.error("Error fetching analytics tab data:", error);
      toast.error("Failed to load analytics details.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when Tab or Date Changes
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate && activeTab !== 6) {
      fetchTabData(activeTab);
    }
  }, [activeTab, dateRange.startDate, dateRange.endDate]);

  // Legacy Card Date triggers
  const handleLegacyPreset = (key: string, preset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "week":
        const firstDayOfWeek = today.getDate() - today.getDay();
        start = new Date(today.setDate(firstDayOfWeek));
        end = new Date();
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        break;
    }

    setDateRanges((prev) => ({
      ...prev,
      [key]: {
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        activePreset: preset,
      },
    }));
  };

  const handleLegacyDateChange = (key: string, field: "startDate" | "endDate", value: string) => {
    setDateRanges((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value, activePreset: "custom" },
    }));
  };

  const openDownloadModal = (key: string, label: string) => {
    setCurrentReport({ key, label });
    setModalOpen(true);
  };

  const handleDownload = async (columns: string[], format: string) => {
    if (!currentReport) return;

    const key = currentReport.key;
    const range = dateRanges[key];

    setDownloading(key);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/reports/export/${key}`,
        {
          columns,
          format,
          startDate: range?.startDate,
          endDate: range?.endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
          withCredentials: true,
        }
      );

      const extension = format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : format === "json" ? "json" : "csv";
      const filename = `${key}_report_${new Date().getTime()}.${extension}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${currentReport.label} downloaded successfully.`);
      setModalOpen(false);
    } catch (error) {
      console.error(`Error exporting ${key} report:`, error);
      toast.error("Failed to export report.");
    } finally {
      setDownloading(null);
    }
  };

  // Define Primary Nav Tabs list
  const tabsList = [
    { key: 0, label: "Overview", icon: BarChart2 },
    { key: 1, label: "Sales", icon: TrendingUp },
    { key: 2, label: "Products", icon: ShoppingBag },
    { key: 3, label: "Customers", icon: Users },
    { key: 4, label: "Finance", icon: CreditCard },
    { key: 5, label: "Operations", icon: RotateCcw },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* 1. Global Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor store conversion rates, sales reconciliation, and operational backlogs
          </p>
        </div>

        {/* Global Date & Compare picker */}
        {activeTab !== 6 && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Compare Toggle */}
            <button
              onClick={() => setCompareEnabled(!compareEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-sm ${
                compareEnabled
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <GitCompare size={13} />
              Compare: {compareEnabled ? "vs Last Month" : "Off"}
            </button>

            {/* Presets segment */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-0.5 shadow-sm">
              {["7D", "30D", "90D", "YTD", "Custom"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setGlobalPreset(preset);
                    if (preset !== "Custom") {
                      applyPreset(preset);
                    }
                  }}
                  className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                    globalPreset === preset ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Range calendars */}
            {globalPreset === "Custom" && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleGlobalDateChange("startDate", e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none w-28"
                />
                <span className="text-gray-400 text-[10px] font-bold">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleGlobalDateChange("endDate", e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none w-28"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Primary Tabs Menu Navigation */}
      <div className="flex items-center justify-between bg-gray-100/60 p-1 rounded-2xl mb-2 flex-wrap gap-2 shadow-sm border border-gray-100/40">
        <div className="flex items-center gap-1 flex-wrap">
          {tabsList.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setActiveTab(6)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
            activeTab === 6 ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          <Download size={13} />
          Export Reports
        </button>
      </div>

      {/* 3. Render Active Tab Component */}
      <div className="min-h-[500px]">
        {activeTab === 0 && (
          <OverviewTab
            salesData={salesData}
            productsData={productsData}
            customersData={customersData}
            operationsData={operationsData}
            inventoryData={inventoryData}
            formatCurrency={formatCurrency}
            loading={loading}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            compareEnabled={compareEnabled}
          />
        )}

        {activeTab === 1 && (
          <SalesTab
            salesData={salesData}
            formatCurrency={formatCurrency}
            loading={loading}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            compareEnabled={compareEnabled}
          />
        )}

        {activeTab === 2 && (
          <ProductsTab productsData={productsData} formatCurrency={formatCurrency} loading={loading} />
        )}

        {activeTab === 3 && (
          <CustomersTab customersData={customersData} formatCurrency={formatCurrency} loading={loading} />
        )}

        {activeTab === 4 && (
          <FinanceTab financeData={financeData} formatCurrency={formatCurrency} loading={loading} />
        )}

        {activeTab === 5 && <OperationsTab operationsData={operationsData} loading={loading} />}

        {activeTab === 6 && (
          <ExportTab
            reportTypes={reportTypes}
            dateRanges={dateRanges}
            handleLegacyPreset={handleLegacyPreset}
            handleLegacyDateChange={handleLegacyDateChange}
            openDownloadModal={openDownloadModal}
            downloading={downloading}
          />
        )}
      </div>

      {/* Legacy Selection Modal */}
      {currentReport && (
        <ColumnSelectionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          reportType={currentReport.key}
          reportLabel={currentReport.label}
          onDownload={handleDownload}
          loading={downloading !== null}
        />
      )}
    </div>
  );
};

export default ReportsPage;
