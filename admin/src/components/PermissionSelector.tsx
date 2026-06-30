import React from "react";
import {
  FormControlLabel,
  Checkbox,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface PermissionGroup {
  label: string;
  items: {
    label: string;
    key: string;
  }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "DASHBOARD",
    items: [
      { label: "View Dashboard (Stats/Graphs)", key: "dashboard.view" },
    ],
  },
  {
    label: "SALES",
    items: [
      { label: "View Inquiries (Contact Leads)", key: "inquiries.view" },
      { label: "Manage Inquiries (Reply/Delete)", key: "inquiries.edit" },
      { label: "View Reports (Sales Stats)", key: "reports.view" },
      { label: "View Payments (Transactions)", key: "payments.view" },
      { label: "Manage Payments (Status/Refunds)", key: "payments.edit" },
      { label: "View Orders", key: "orders.view" },
      { label: "Manage Orders (Edit/Status)", key: "orders.edit" },
      { label: "View Estimates", key: "estimates.view" },
      { label: "Manage Estimates", key: "estimates.edit" },
      { label: "View Invoices", key: "invoices.view" },
      { label: "Manage Invoices", key: "invoices.edit" },
    ],
  },
  {
    label: "PEOPLE",
    items: [
      { label: "View Customers", key: "customers.view" },
      { label: "Manage Customers", key: "customers.edit" },
      { label: "View Admin List (Staff)", key: "admins.view" },
      { label: "Manage Admin List (Staff)", key: "admins.edit" },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { label: "View Products (Product List)", key: "products.view" },
      { label: "Manage Products (Create/Edit/Delete)", key: "products.edit" },
      { label: "Manage Inventory (Stock/Settings)", key: "products.manage" },
      { label: "Manage Tags & Flags", key: "tags.manage" },
    ],
  },
  {
    label: "WEBSITE",
    items: [
      { label: "View Pages", key: "pages.view" },
      { label: "Manage Pages", key: "pages.edit" },
      { label: "View Media", key: "media.view" },
      { label: "Manage Media", key: "media.edit" },
      { label: "View Sections Library", key: "sections.view" },
      { label: "Manage Sections Library", key: "sections.edit" },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { label: "View General Settings", key: "settings.general.view" },
      { label: "Manage General Settings", key: "settings.general" },
      { label: "View Domain Management", key: "settings.domain.view" },
      { label: "Manage Domain Management", key: "settings.domain" },
      { label: "View Theme Settings", key: "settings.theme.view" },
      { label: "Manage Theme Settings", key: "settings.theme" },
      { label: "View Payment Settings", key: "settings.payment.view" },
      { label: "Manage Payment Settings (Sensitive)", key: "settings.payment" },
      { label: "View SEO Settings", key: "settings.seo.view" },
      { label: "Manage SEO Settings", key: "settings.seo" },
      { label: "View Promo Popups", key: "marketing.view" },
      { label: "View Email Configuration", key: "settings.email.view" },
      { label: "Manage Email Configuration", key: "settings.email" },
      { label: "View Audit Logs", key: "audit_logs.view" },
    ],
  },
];

const PERMISSION_PAGE_MAPPING: Record<string, string | string[]> = {
  // DASHBOARD
  "dashboard.view": "dashboard",

  // SALES
  "inquiries.view": "inquiries",
  "inquiries.edit": "inquiries",
  "reports.view": "reports",
  "payments.view": "orders",
  "payments.edit": "orders",
  "orders.view": "orders",
  "orders.edit": "orders",
  "estimates.view": "estimates",
  "estimates.edit": "estimates",
  "invoices.view": "invoices",
  "invoices.edit": "invoices",

  // PEOPLE
  "customers.view": "customers",
  "customers.edit": "customers",
  "admins.view": "admin-list",
  "admins.edit": "admin-list",

  // INVENTORY
  "products.view": ["manage-products/product-list", "manage-products"],
  "products.edit": ["manage-products/product-list", "manage-products"],
  "products.manage": "manage-products",
  "tags.manage": "tags-flags",

  // WEBSITE
  "pages.view": "pages",
  "pages.edit": "pages",
  "media.view": "media",
  "media.edit": "media",
  "sections.view": "sections",
  "sections.edit": "sections",

  // SETTINGS
  "settings.general.view": "settings/general-settings",
  "settings.general": "settings/general-settings",
  "settings.domain.view": "settings/domain-management",
  "settings.domain": "settings/domain-management",
  "settings.theme.view": "settings/theme-settings",
  "settings.theme": "settings/theme-settings",
  "settings.payment.view": "settings/payment-settings",
  "settings.payment": "settings/payment-settings",
  "settings.seo.view": "settings/seo-settings",
  "settings.seo": "settings/seo-settings",
  "marketing.view": "settings/advertisement",
  "settings.email.view": "settings/email-config/settings",
  "settings.email": "settings/email-config/settings",
  "audit_logs.view": "settings/audit-logs",
};

interface PermissionSelectorProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
  variant?: "default" | "minimal";
  planCategory?: string;
  allowedPages?: string[];
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  selectedPermissions,
  onChange,
  disabled = false,
  variant = "default",
  allowedPages: propAllowedPages,
}) => {
  // Use prop allowedPages if provided; otherwise no restriction (single-store ecommerce).
  const allowedPages = propAllowedPages;

  const filteredGroups = React.useMemo(() => {
    return PERMISSION_GROUPS
      .map((group) => {
        const allowedItems = group.items.filter((item) => {
          if (!allowedPages) return true;
          const mappedPages = PERMISSION_PAGE_MAPPING[item.key];
          if (!mappedPages) return true;
          if (Array.isArray(mappedPages)) {
            return mappedPages.some((page) => allowedPages.includes(page));
          }
          return allowedPages.includes(mappedPages);
        });
        return {
          ...group,
          items: allowedItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [allowedPages]);

  const handleToggle = (key: string) => {
    if (selectedPermissions.includes(key)) {
      onChange(selectedPermissions.filter((p) => p !== key));
    } else {
      onChange([...selectedPermissions, key]);
    }
  };

  const handleSelectGroup = (group: PermissionGroup) => {
    const groupKeys = group.items.map((i) => i.key);
    const uniqueKeys = new Set([...selectedPermissions, ...groupKeys]);
    onChange(Array.from(uniqueKeys));
  };

  const handleDeselectGroup = (group: PermissionGroup) => {
    const groupKeys = group.items.map((i) => i.key);
    onChange(selectedPermissions.filter((p) => !groupKeys.includes(p)));
  };

  const isGroupSelected = (group: PermissionGroup) => {
    return group.items.every((i) => selectedPermissions.includes(i.key));
  };

  const handleSelectAll = () => {
    const allKeys = filteredGroups.flatMap((g) => g.items.map((i) => i.key));
    onChange(allKeys);
  };

  const handleDeselectAll = () => {
    const activeKeys = filteredGroups.flatMap((g) => g.items.map((i) => i.key));
    onChange(selectedPermissions.filter((p) => !activeKeys.includes(p)));
  };

  const containerClasses =
    variant === "minimal"
      ? "flex flex-col gap-2" // No border, no scroll, no specific bg
      : "flex flex-col gap-2 border rounded-lg p-3 bg-white max-h-96 overflow-y-auto";

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-2 sticky top-0 bg-white z-10 p-1 border-b">
        <Typography variant="subtitle2" className="text-slate-700 font-bold">
          Granular Permissions
        </Typography>
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={handleSelectAll}
            disabled={disabled}
            sx={{ fontSize: "0.7rem" }}
          >
            Select All
          </Button>
          <Button
            size="small"
            color="error"
            onClick={handleDeselectAll}
            disabled={disabled}
            sx={{ fontSize: "0.7rem" }}
          >
            Clear
          </Button>
        </div>
      </div>

      {filteredGroups.map((group) => (
        <div key={group.label} className="mb-2">
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-t border-b border-slate-100">
            <Typography
              variant="caption"
              className="font-bold text-slate-600 uppercase tracking-wider"
            >
              {group.label}
            </Typography>
            <div>
              <Button
                size="small"
                onClick={() =>
                  isGroupSelected(group)
                    ? handleDeselectGroup(group)
                    : handleSelectGroup(group)
                }
                disabled={disabled}
                sx={{ minWidth: "auto", padding: "0 8px", fontSize: "0.65rem" }}
              >
                {isGroupSelected(group) ? "None" : "All"}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-1 p-2 border border-t-0 rounded-b">
            {group.items.map((item) => (
              <FormControlLabel
                key={item.key}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedPermissions.includes(item.key)}
                    onChange={() => handleToggle(item.key)}
                    disabled={disabled}
                    sx={{ padding: "4px" }}
                  />
                }
                label={
                  <span className="text-xs text-slate-700">{item.label}</span>
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionSelector;
