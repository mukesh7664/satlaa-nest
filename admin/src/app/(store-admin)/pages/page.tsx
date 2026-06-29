"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Public as PublicIcon,
  PublicOff as PublicOffIcon,
  Home as HomeIcon,
  FileDownload as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { pagesApi, Page } from "@/services/pages.api";
import { settingsApi } from "@/services/settings.api";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";

export default function PagesSection() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [defaultHomepageId, setDefaultHomepageId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageLoading, setNewPageLoading] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [storeDomain, setStoreDomain] = useState<string>("localhost:3000");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputFullThemeRef = React.useRef<HTMLInputElement>(null);
  const { limits, subscription, usage, loading: limitsLoading } = usePlanLimits();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pagesRes, settingsRes, domainsRes] = await Promise.all([
        pagesApi.getAllPages(),
        settingsApi.getSettings(),
        settingsApi.getDomains().catch(() => []), // Gracefully handle domain fetch failure
      ]);

      const data = Array.isArray(pagesRes)
        ? pagesRes
        : (pagesRes as any).data || (pagesRes as any).pages || [];
      
      setPages(data);

      const homepage = data.find((p: Page) => p.is_homepage);
      if (homepage) {
        setDefaultHomepageId(homepage.id || null);
      } else {
        setDefaultHomepageId(null);
      }

      // Determine the active store domain
      if (Array.isArray(domainsRes) && domainsRes.length > 0) {
        const customDomain = domainsRes.find((d: any) => d.type === "custom");
        const subDomain = domainsRes.find((d: any) => d.type === "subdomain");

        let protocol = window.location.protocol;
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        // Priority: Custom domain > Subdomain > Fallback
        if (customDomain) {
          // If custom domain is set (e.g., test-new.prefyn.com), use it with the correct protocol
          if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
            setStoreDomain(`http://${customDomain.domain}`);
          } else {
            setStoreDomain(`${protocol}//${customDomain.domain}`);
          }
        } else if (subDomain) {
          // If subdomain is set (e.g., test-new.prefyn.com)
          let formattedDomain = subDomain.domain;

          if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
            // Usually subdomains are saved as "test-new.prefyn.com" or just "test-new"
            // Let's extract the prefix and use it with NEXT_PUBLIC_WEBSITE_URL
            const prefix = formattedDomain.split('.')[0];
            try {
              const parsedBaseUrl = new URL(baseWebsiteUrl);
              setStoreDomain(`${parsedBaseUrl.protocol}//${prefix}.${parsedBaseUrl.host}`);
            } catch (e) {
              setStoreDomain(`http://${prefix}.localhost:3000`);
            }
          } else {
            // Production: use the full domain
            setStoreDomain(`${protocol}//${subDomain.domain}`);
          }
        }
      }

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!selectedPageId) return;

    try {
      await pagesApi.deletePage(selectedPageId);
      setDeleteDialogOpen(false);
      setSelectedPageId(null);
      toast.success("Page deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error("Failed to delete page");
    }
  };

  const handleToggleStatus = async (page: Page) => {
    try {
      const newStatus = !page.isPublished;
      await pagesApi.updatePage(page.id!, { isPublished: newStatus });
      setPages(
        pages.map((p) =>
          p.id === page.id ? { ...p, isPublished: newStatus } : p
        )
      );
      toast.success(newStatus ? "Page published" : "Page unpublished");
    } catch (error) {
      console.error("Failed to update page status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSetDefaultHomepage = async (pageId: string) => {
    try {
      await pagesApi.updatePage(pageId, { is_homepage: true });
      setDefaultHomepageId(pageId);
      setPages(prevPages =>
        prevPages.map(p => ({
          ...p,
          is_homepage: p.id === pageId
        }))
      );
      toast.success("Default homepage updated successfully");
    } catch (error) {
      console.error("Failed to set default homepage:", error);
      toast.error("Failed to set default homepage");
    }
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error("Page title is required");
      return;
    }

    try {
      setNewPageLoading(true);
      // Generate slug from title
      const slug = newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const res = await pagesApi.createPage({
        title: newPageTitle,
        slug: slug || "new-page",
        isPublished: false,
      });

      toast.success("Page created successfully");
      setAddDialogOpen(false);
      setNewPageTitle('');

      // Navigate to the edit page
      if (res.page?.id || (res.page as any)?._id) {
        router.push(`/pages/${res.page.id || (res.page as any)?._id}`);
      } else {
        fetchData();
      }

    } catch (error: any) {
      console.error("Failed to create page:", error);
      const message = error.response?.data?.message || "Failed to create page";
      toast.error(message);
    } finally {
      setNewPageLoading(false);
    }
  };

  const handleDownloadFullTheme = async () => {
    try {
      setThemeLoading(true);
      toast.info("Preparing full store theme export...");

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

      // 1. Fetch Header/Footer and Settings
      const [headerRes, footerRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/admin/header-sections`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch(`${API_URL}/admin/footer-sections`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        settingsApi.getSettings(),
      ]);

      // 2. Fetch All Pages
      const allPages = await pagesApi.getAllPages();
      
      // 3. Hydrate each page with its full section data
      const hydratedPages = await Promise.all(
        allPages.map(async (p) => {
          const { page: fullPage } = await pagesApi.getPageById(p.id!);
          return {
            title: fullPage.title,
            slug: fullPage.slug,
            is_homepage: fullPage.is_homepage || false,
            description: fullPage.description,
            metaTitle: fullPage.metaTitle,
            metaDescription: fullPage.metaDescription,
            sections: fullPage.sections || [],
          };
        })
      );

      // 4. Bundle everything
      const themeExport = {
        themeType: "full-store-export",
        exportedAt: new Date().toISOString(),
        global: {
          header: headerRes.data || headerRes.sections || [],
          footer: footerRes.data || footerRes.sections || [],
        },
        pages: hydratedPages,
        settings: {
          themeColors: settingsRes?.themeColors || { primary: "#000000", secondary: "#ffffff" },
          fonts: settingsRes?.fonts || {},
        },
      };

      // 5. Download
      const blob = new Blob([JSON.stringify(themeExport, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `full-theme-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Full theme exported successfully");
    } catch (error) {
      console.error("Failed to export theme:", error);
      toast.error("Failed to export full store theme");
    } finally {
      setThemeLoading(false);
    }
  };

  const handleFullThemeFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setThemeLoading(true);
      toast.info("Reading full store theme file...");

      const content = await file.text();
      const data = JSON.parse(content);

      // Validate structure
      if (data.themeType !== "full-store-export" || !data.global || !data.pages) {
        throw new Error("Invalid theme setup file format. Please upload a valid exported store JSON.");
      }

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

      toast.info("Hydrating global sections (Header & Footer)...");

      // 1. Update Header/Footer
      await Promise.all([
        fetch(`${API_URL}/admin/header-sections`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(data.global.header),
        }),
        fetch(`${API_URL}/admin/footer-sections`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(data.global.footer),
        }),
      ]);

      toast.info("Creating store pages from theme...");

      // 2. Hydrate Settings if available
      if (data.settings) {
        try {
          await settingsApi.updateSettings({
            themeColors: data.settings.themeColors,
            fonts: data.settings.fonts
          });
        } catch (err) {
          console.warn("Failed to hydrate theme settings:", err);
        }
      }

      // 3. Create All Pages
      // Using sequential processing to avoid plan limit races/overwhelming backend
      for (const pageData of data.pages) {
        try {
          await pagesApi.createPage(pageData);
        } catch (err: any) {
          console.warn(`Skipped page ${pageData.title}:`, err.response?.data?.message || err.message);
        }
      }

      toast.success("Store theme hydrated successfully!");
      fetchData();
    } catch (error: any) {
      console.error("Failed to upload store theme:", error);
      toast.error(error.message || "Failed to upload store theme");
    } finally {
      setThemeLoading(false);
      if (fileInputFullThemeRef.current) fileInputFullThemeRef.current.value = "";
    }
  };

  const handleDownloadPageJson = async (page: Page) => {
    try {
      toast.info(`Preparing download for ${page.title}...`);
      const { page: fullPage } = await pagesApi.getPageById(page.id!);

      // Structure the data as a "Theme Setup" compatible object
      const downloadData = {
        themeType: "single-page-export",
        exportedAt: new Date().toISOString(),
        page: {
          title: fullPage.title,
          slug: fullPage.slug,
          description: fullPage.description,
          metaTitle: fullPage.metaTitle,
          metaDescription: fullPage.metaDescription,
          sections: fullPage.sections || [],
        },
      };

      const blob = new Blob([JSON.stringify(downloadData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fullPage.slug || "page"}-theme.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Page setup downloaded successfully");
    } catch (error) {
      console.error("Failed to download page JSON:", error);
      toast.error("Failed to download page data");
    }
  };
  
  const handlePageFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setNewPageLoading(true);
      toast.info("Reading page setup file...");

      const content = await file.text();
      const data = JSON.parse(content);

      // Validate structure
      if (data.themeType !== "single-page-export" || !data.page) {
        throw new Error("Invalid page setup file format. Please upload a valid exported page JSON.");
      }

      toast.info("Rehydrating page into your store...");
      
      // Create the page using the data from the JSON
      // The backend handles section creation automatically if sections array is present
      const res = await pagesApi.createPage(data.page);

      toast.success("Page imported successfully!");
      setAddDialogOpen(false);
      
      // Navigate to the edit page
      if (res.page?.id || (res.page as any)?._id) {
        router.push(`/pages/${res.page.id || (res.page as any)?._id}`);
      } else {
        fetchData();
      }
    } catch (error: any) {
      console.error("Failed to upload page setup:", error);
      toast.error(error.message || "Failed to upload page setup");
    } finally {
      setNewPageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Pages
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            {(!subscription || limitsLoading) ? (
              "Loading plan information..."
            ) : (
              <>
                <span className={limits.pages !== -1 && (usage?.pages?.used || pages.length) >= (usage?.pages?.limit || limits.pages) ? "text-red-500 font-bold" : ""}>
                  Plan: {subscription.plan?.name} ({(usage?.pages?.used || pages.length)} / {(usage?.pages?.limit || limits.pages) === -1 ? "Unlimited" : (usage?.pages?.limit || limits.pages)} used)
                </span>
                {(usage?.pages?.limit || limits.pages) !== -1 && (usage?.pages?.used || pages.length) >= (usage?.pages?.limit || limits.pages) && (
                  <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => router.push('/manage-subscription')}
                    sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 'bold', minWidth: 0, p: 0 }}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </>
            )}
          </p>
        </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputFullThemeRef}
              className="hidden"
              accept=".json"
              onChange={handleFullThemeFileUpload}
            />
            <Button
              onClick={() => fileInputFullThemeRef.current?.click()}
              variant="outlined"
              color="info"
              className="border-dashed"
              startIcon={themeLoading ? <CircularProgress size={16} /> : <CloudUploadIcon fontSize="small" />}
              disabled={themeLoading || limitsLoading}
              sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
              }}
            >
              {themeLoading ? "Hydrating..." : "Upload Full Theme"}
            </Button>
            <Button
              onClick={handleDownloadFullTheme}
              variant="outlined"
              startIcon={themeLoading ? <CircularProgress size={16} /> : <DownloadIcon fontSize="small" />}
              disabled={themeLoading || limitsLoading}
              sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
              }}
            >
              {themeLoading ? "Exporting..." : "Download Full Theme"}
            </Button>
            <Button
              onClick={() => {
                setAddDialogOpen(true);
              }}
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              disabled={limitsLoading}
              sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  bgcolor: "var(--primary)",
                  "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                  px: 3,
              }}
            >
              Add Page
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <TextField
            size="small"
            fullWidth
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "white" }}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Title
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Slug
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr key="loading">
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <CircularProgress />
                      </div>
                    </td>
                  </tr>
                ) : filteredPages.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-slate-500 font-medium">
                          No pages found
                        </p>
                        <p className="text-slate-400 text-sm">
                          Try adjusting your search or add a new page
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((page) => (
                    <tr
                      key={page.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {page.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        /{page.slug}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${page.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            onClick={() => handleSetDefaultHomepage(page.id!)}
                            disabled={defaultHomepageId === page.id}
                            color={defaultHomepageId === page.id ? "warning" : "default"}
                            size="small"
                            title={
                              defaultHomepageId === page.id
                                ? "Current Homepage"
                                : "Make Default Homepage"
                            }
                          >
                            <HomeIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            href={`${storeDomain}/pages/${page.slug || (page as any).id || page.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ color: "text.secondary" }}
                            title={
                              page.slug ? "View Live" : "View by ID (Missing Slug)"
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => router.push(`/pages/${(page as any).id || page.id}`)}
                            color="primary"
                            size="small"
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleToggleStatus(page)}
                            color={page.isPublished ? "warning" : "success"}
                            size="small"
                            title={page.isPublished ? "Unpublish" : "Publish"}
                          >
                            {page.isPublished ? (
                              <PublicOffIcon fontSize="small" />
                            ) : (
                              <PublicIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={() => handleDownloadPageJson(page)}
                            color="info"
                            size="small"
                            title="Download Setup (JSON)"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setSelectedPageId(page.id!);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                            size="small"
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          className: "rounded-xl",
        }}
      >
        <DialogTitle className="font-semibold">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this page? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4">
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            className="text-slate-600 hover:bg-slate-50 normal-case"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            className="bg-red-600 hover:bg-red-700 normal-case shadow-none"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={() => !newPageLoading && setAddDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className: "rounded-2xl shadow-xl border border-slate-100",
        }}
      >
        <DialogTitle className="font-bold text-xl text-slate-800 pb-2">
          Add Page
        </DialogTitle>
        <DialogContent className="pt-2">
          <div className="space-y-6">
            {/* Manual Option */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Option A: Create New
              </p>
              <div className="flex flex-col gap-3">
                <TextField
                  autoFocus
                  id="title"
                  label="Page Title"
                  placeholder="e.g. Summer Collection"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  disabled={newPageLoading}
                  size="small"
                />
                <Button
                  onClick={handleCreatePage}
                  variant="contained"
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 normal-case shadow-none h-10"
                  disabled={newPageLoading || !newPageTitle.trim()}
                >
                  {newPageLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Blank Page'}
                </Button>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400">OR</span>
              </div>
            </div>

            {/* Upload Option */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Option B: Upload Setup
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handlePageFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon />}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 normal-case h-10 border-dashed border-2"
                disabled={newPageLoading}
              >
                {newPageLoading ? 'Uploading...' : 'Upload Page JSON'}
              </Button>
              <p className="text-[10px] text-center text-slate-400">
                Upload a .json file exported from another store
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 pt-0">
          <Button
            onClick={() => setAddDialogOpen(false)}
            className="text-slate-500 hover:bg-slate-50 normal-case font-medium"
            disabled={newPageLoading}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
