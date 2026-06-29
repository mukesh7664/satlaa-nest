"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Switch,
  Stack,
  Tooltip,
  InputBase,
  Select,
  MenuItem,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Article as ArticleIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { blogApi, BlogPost } from "@/services/blog.api";
import { settingsApi } from "@/services/settings.api";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

const inputSx = {
  border: "1.5px solid",
  borderColor: "divider",
  borderRadius: "8px",
  px: 1.5,
  py: 0.5,
  fontSize: "0.875rem",
  bgcolor: "background.paper",
};

export default function BlogPostListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // zero-based for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [storeDomain, setStoreDomain] = useState<string>("http://localhost:3000");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAllPosts({
        page: page + 1,
        limit: rowsPerPage,
        search,
        status: statusFilter,
      });
      setPosts(data.posts || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  // Resolve the storefront base URL (mirrors the product-list logic) so the
  // "view" action opens the post on the live store domain.
  const fetchStoreDomain = useCallback(async () => {
    try {
      const domainsRes = await settingsApi.getDomains().catch(() => []);
      const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
      if (Array.isArray(domainsRes) && domainsRes.length > 0) {
        const customDomain = domainsRes.find((d: any) => d.type === "custom");
        const subDomain = domainsRes.find((d: any) => d.type === "subdomain");
        const protocol = window.location.protocol;

        if (customDomain) {
          if (process.env.NODE_ENV === "development" && window.location.hostname === "localhost") {
            setStoreDomain(`http://${customDomain.domain}`);
          } else {
            setStoreDomain(`${protocol}//${customDomain.domain}`);
          }
        } else if (subDomain) {
          const formattedDomain = subDomain.domain;
          if (process.env.NODE_ENV === "development" && window.location.hostname === "localhost") {
            const prefix = formattedDomain.split(".")[0];
            try {
              const parsedBaseUrl = new URL(baseWebsiteUrl);
              setStoreDomain(`${parsedBaseUrl.protocol}//${prefix}.${parsedBaseUrl.host}`);
            } catch {
              setStoreDomain(`http://${prefix}.localhost:3000`);
            }
          } else {
            setStoreDomain(`${protocol}//${subDomain.domain}`);
          }
        } else {
          setStoreDomain(baseWebsiteUrl);
        }
      } else {
        setStoreDomain(baseWebsiteUrl);
      }
    } catch (error) {
      console.error("Failed to fetch store domain:", error);
      setStoreDomain(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000");
    }
  }, []);

  useEffect(() => {
    fetchStoreDomain();
  }, [fetchStoreDomain]);

  useEffect(() => {
    const t = setTimeout(fetchPosts, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchPosts]);

  const handleToggleStatus = async (post: BlogPost) => {
    try {
      await blogApi.toggleStatus(post.id);
      toast.success("Status updated");
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const executeDelete = async (id: string) => {
    try {
      await blogApi.deletePost(id);
      toast.success("Post deleted");
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    }
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
            Blog Posts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Write and manage articles for your storefront
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/blog/create-post")}
          sx={{
            bgcolor: "var(--primary)",
            "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          Create Post
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} alignItems="center">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ...inputSx, flex: 1, maxWidth: 360 }}>
          <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
          <InputBase
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            placeholder="Search posts..."
            sx={{ fontSize: "0.875rem", flex: 1 }}
          />
        </Box>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
          displayEmpty
          size="small"
          sx={{ minWidth: 150, borderRadius: "8px", fontSize: "0.875rem" }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
        </Select>
      </Stack>

      <Paper sx={{ borderRadius: "12px", overflow: "hidden", border: "1.5px solid", borderColor: "divider" }} elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#fafafa" }}>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>Post</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>Categories</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>Published</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8125rem" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <ArticleIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                    <Typography color="text.secondary" fontSize="0.875rem">
                      No posts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          variant="rounded"
                          src={post.coverImage || undefined}
                          sx={{ width: 44, height: 44, bgcolor: "#f1f5f9" }}
                        >
                          <ArticleIcon sx={{ fontSize: 20, color: "text.disabled" }} />
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>{post.title}</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontFamily: "monospace" }}>
                            /{post.slug}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch
                          size="small"
                          checked={post.status === "published"}
                          onChange={() => handleToggleStatus(post)}
                          color="success"
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: post.status === "published" ? "#16a34a" : "#a16207",
                          }}
                        >
                          {post.status === "published" ? "Published" : "Draft"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {(post.categories || []).slice(0, 3).map((c) => (
                          <Chip
                            key={c.id}
                            label={c.name}
                            size="small"
                            sx={{ height: 20, fontSize: "0.7rem", bgcolor: "#eff6ff", color: "#2563eb" }}
                          />
                        ))}
                        {(post.categories || []).length === 0 && (
                          <Typography sx={{ fontSize: "0.75rem", color: "text.disabled" }}>—</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                        {formatDate(post.publishedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View on store">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`${storeDomain}/blogs/${post.slug}`, "_blank")}
                            sx={{ color: "text.secondary" }}
                          >
                            <VisibilityIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/blog/create-post?id=${post.id}`)}
                            sx={{ color: "info.main" }}
                          >
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setToDeleteId(post.id);
                              setDeleteConfirmOpen(true);
                            }}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <ConfirmationModal
        open={deleteConfirmOpen}
        title="Delete Post"
        message="Are you sure you want to delete this blog post? This cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={() => {
          if (toDeleteId) executeDelete(toDeleteId);
          setDeleteConfirmOpen(false);
          setToDeleteId(null);
        }}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setToDeleteId(null);
        }}
      />
    </Box>
  );
}
