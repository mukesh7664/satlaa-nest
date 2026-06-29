"use client";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  InputBase,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CKEditor from "@/components/CKEditor";
import MediaPickerModal from "@/components/MediaPickerModal";
import { blogApi, BlogTerm, BlogPostPayload } from "@/services/blog.api";

const inputSx = {
  border: "1.5px solid",
  borderColor: "divider",
  borderRadius: "8px",
  px: 1.5,
  py: 0.875,
  fontSize: "0.875rem",
  width: "100%",
  bgcolor: "background.paper",
  "&:hover": { borderColor: "primary.light" },
  "&.Mui-focused": { borderColor: "primary.main", boxShadow: "0 0 0 3px rgba(25,118,210,0.1)" },
};

const LabeledInput = ({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Typography
      component="label"
      sx={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary", mb: 0.75 }}
    >
      {label}
      {required && (
        <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
          *
        </Box>
      )}
    </Typography>
    {children}
    {hint && (
      <Typography fontSize="0.75rem" color="text.disabled" mt={0.5}>
        {hint}
      </Typography>
    )}
  </Box>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography
    fontWeight={700}
    fontSize="0.75rem"
    letterSpacing="0.08em"
    color="text.disabled"
    textTransform="uppercase"
    sx={{ mb: 2 }}
  >
    {children}
  </Typography>
);

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [allCategories, setAllCategories] = useState<BlogTerm[]>([]);
  const [allTags, setAllTags] = useState<BlogTerm[]>([]);

  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    coverImageAlt: "",
    authorName: "",
    status: "draft" as "draft" | "published",
    publishedAt: "",
    metaTitle: "",
    metaDescription: "",
    ogImage: "",
    keywords: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<BlogTerm[]>([]);
  const [selectedTags, setSelectedTags] = useState<BlogTerm[]>([]);

  const setField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadTaxonomies = useCallback(async () => {
    try {
      const [cats, tags] = await Promise.all([blogApi.getCategories(), blogApi.getTags()]);
      setAllCategories(cats || []);
      setAllTags(tags || []);
      return { cats: cats || [], tags: tags || [] };
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories/tags");
      return { cats: [], tags: [] };
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { cats, tags } = await loadTaxonomies();
      if (!editId) return;
      try {
        setLoading(true);
        const post = await blogApi.getPost(editId);
        setForm({
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          coverImage: post.coverImage || "",
          coverImageAlt: post.coverImageAlt || "",
          authorName: post.authorName || "",
          status: post.status || "draft",
          publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : "",
          metaTitle: post.seo?.metaTitle || "",
          metaDescription: post.seo?.metaDescription || "",
          ogImage: post.seo?.ogImage || "",
          keywords: Array.isArray(post.seo?.keywords) ? post.seo.keywords.join(", ") : post.seo?.keywords || "",
        });
        setSlugTouched(true);
        // Match returned terms against the full lists (fall back to the post's own terms)
        const catIds = new Set((post.categories || []).map((c) => c.id));
        const tagIds = new Set((post.tags || []).map((t) => t.id));
        setSelectedCategories(cats.filter((c) => catIds.has(c.id)));
        setSelectedTags(tags.filter((t) => tagIds.has(t.id)));
      } catch (err: any) {
        toast.error(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editId, loadTaxonomies]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }));
  };

  const handleCoverSelect = (media: { url: string; name?: string }) => {
    setField("coverImage", media.url);
    // Pre-fill alt text from the media name if none set yet
    setForm((prev) => ({
      ...prev,
      coverImage: media.url,
      coverImageAlt: prev.coverImageAlt || media.name || "",
    }));
  };

  // Resolve typed-in (free-solo) categories/tags into real ids, creating any new ones.
  const resolveTerms = async (
    selected: BlogTerm[],
    existing: BlogTerm[],
    create: (name: string) => Promise<BlogTerm>,
  ): Promise<string[]> => {
    const ids: string[] = [];
    for (const term of selected) {
      if (term.id) {
        ids.push(term.id);
        continue;
      }
      // Free-solo string entry (no id): reuse a matching existing term or create one.
      const name = term.name?.trim();
      if (!name) continue;
      const match = existing.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (match) {
        ids.push(match.id);
      } else {
        const created = await create(name);
        ids.push(created.id);
      }
    }
    return ids;
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      setSaving(true);

      const categoryIds = await resolveTerms(selectedCategories, allCategories, (name) =>
        blogApi.createCategory({ name })
      );
      const tagIds = await resolveTerms(selectedTags, allTags, (name) => blogApi.createTag({ name }));

      const payload: BlogPostPayload = {
        title: form.title.trim(),
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content || undefined,
        coverImage: form.coverImage || null,
        coverImageAlt: form.coverImageAlt || null,
        authorName: form.authorName || null,
        status: form.status,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        seo: {
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          ogImage: form.ogImage,
          keywords: form.keywords
            ? form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
            : [],
        },
        categoryIds,
        tagIds,
      };

      if (editId) {
        await blogApi.updatePost(editId, payload);
        toast.success("Post updated");
      } else {
        await blogApi.createPost(payload);
        toast.success("Post created");
      }
      router.push("/blog/post-list");
    } catch (err: any) {
      toast.error(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Button
            onClick={() => router.push("/blog/post-list")}
            startIcon={<ArrowBackIcon />}
            sx={{ textTransform: "none", color: "text.secondary" }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {editId ? "Edit Post" : "Create Post"}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            bgcolor: "var(--primary)",
            "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
            textTransform: "none",
            borderRadius: "8px",
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
          }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : editId ? "Update Post" : "Publish Post"}
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
        {/* Main column */}
        <Stack spacing={3} sx={{ flex: 1, width: "100%" }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>Basics</SectionTitle>
            <Stack spacing={2.5}>
              <LabeledInput label="Title" required>
                <InputBase value={form.title} onChange={handleTitleChange} placeholder="Post title" sx={inputSx} />
              </LabeledInput>
              <LabeledInput label="Slug" hint="URL-friendly identifier — auto-generated from title">
                <InputBase
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setField("slug", e.target.value);
                  }}
                  placeholder="post-slug"
                  sx={inputSx}
                />
              </LabeledInput>
              <LabeledInput label="Excerpt" hint="Short summary shown on the blog listing">
                <InputBase
                  value={form.excerpt}
                  onChange={(e) => setField("excerpt", e.target.value)}
                  placeholder="A brief summary..."
                  multiline
                  minRows={2}
                  sx={inputSx}
                />
              </LabeledInput>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>Content</SectionTitle>
            <CKEditor value={form.content} onChange={(data) => setField("content", data)} />
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>SEO</SectionTitle>
            <Stack spacing={2.5}>
              <LabeledInput label="Meta Title">
                <InputBase value={form.metaTitle} onChange={(e) => setField("metaTitle", e.target.value)} sx={inputSx} />
              </LabeledInput>
              <LabeledInput label="Meta Description">
                <InputBase
                  value={form.metaDescription}
                  onChange={(e) => setField("metaDescription", e.target.value)}
                  multiline
                  minRows={2}
                  sx={inputSx}
                />
              </LabeledInput>
              <LabeledInput label="OG Image URL" hint="Image shown when shared on social media">
                <InputBase value={form.ogImage} onChange={(e) => setField("ogImage", e.target.value)} sx={inputSx} />
              </LabeledInput>
              <LabeledInput label="Keywords" hint="Comma-separated">
                <InputBase
                  value={form.keywords}
                  onChange={(e) => setField("keywords", e.target.value)}
                  placeholder="ecommerce, retail, pos"
                  sx={inputSx}
                />
              </LabeledInput>
            </Stack>
          </Paper>
        </Stack>

        {/* Sidebar column */}
        <Stack spacing={3} sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>Publish</SectionTitle>
            <Stack spacing={2.5}>
              <LabeledInput label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ borderRadius: "8px", fontSize: "0.875rem" }}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                </Select>
              </LabeledInput>
              <LabeledInput label="Publish Date" hint="Leave empty to publish immediately. A future date schedules it.">
                <InputBase
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setField("publishedAt", e.target.value)}
                  sx={inputSx}
                />
              </LabeledInput>
              <LabeledInput label="Author Name">
                <InputBase
                  value={form.authorName}
                  onChange={(e) => setField("authorName", e.target.value)}
                  placeholder="Author"
                  sx={inputSx}
                />
              </LabeledInput>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>Cover Image</SectionTitle>
            {form.coverImage ? (
              <Box sx={{ position: "relative", mb: 1.5 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImage}
                  alt={form.coverImageAlt || "cover"}
                  style={{ width: "100%", borderRadius: 8, display: "block" }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setPickerOpen(true)}
                    startIcon={<PhotoLibraryIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: "none", color: "primary.main" }}
                  >
                    Change
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setField("coverImage", "")}
                    startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: "none", color: "error.main" }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setPickerOpen(true)}
                startIcon={<PhotoLibraryIcon />}
                sx={{
                  borderStyle: "dashed",
                  borderRadius: "10px",
                  py: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Select Image
              </Button>
            )}
            <Box sx={{ mt: 2 }}>
              <LabeledInput label="Image Alt Text">
                <InputBase
                  value={form.coverImageAlt}
                  onChange={(e) => setField("coverImageAlt", e.target.value)}
                  placeholder="Describe the image"
                  sx={inputSx}
                />
              </LabeledInput>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: "1.5px solid", borderColor: "divider" }}>
            <SectionTitle>Taxonomy</SectionTitle>
            <Stack spacing={2.5}>
              <LabeledInput label="Categories">
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  options={allCategories}
                  value={selectedCategories}
                  getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  onChange={(_, value) =>
                    setSelectedCategories(
                      value.map((v) => (typeof v === "string" ? ({ id: "", name: v, slug: "" } as BlogTerm) : v))
                    )
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const label = typeof option === "string" ? option : option.name;
                      return <Chip {...getTagProps({ index })} key={index} label={label} size="small" />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Add categories" variant="outlined" size="small" />
                  )}
                />
              </LabeledInput>
              <Divider />
              <LabeledInput label="Tags">
                <Autocomplete
                  multiple
                  freeSolo
                  size="small"
                  options={allTags}
                  value={selectedTags}
                  getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  onChange={(_, value) =>
                    setSelectedTags(
                      value.map((v) => (typeof v === "string" ? ({ id: "", name: v, slug: "" } as BlogTerm) : v))
                    )
                  }
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const label = typeof option === "string" ? option : option.name;
                      return <Chip {...getTagProps({ index })} key={index} label={label} size="small" />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Add tags" variant="outlined" size="small" />
                  )}
                />
              </LabeledInput>
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCoverSelect}
        title="Select Cover Image"
        type="image"
      />
    </Box>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress size={32} />
        </Box>
      }
    >
      <CreatePostForm />
    </Suspense>
  );
}
