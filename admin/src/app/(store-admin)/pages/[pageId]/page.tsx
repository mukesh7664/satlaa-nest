"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import PublishIcon from "@mui/icons-material/Publish";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import Chip from "@mui/material/Chip";
import { IconButton, Typography, Collapse } from "@mui/material";
import MediaPickerModal from "@/components/MediaPickerModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  ViewStream as SectionIcon,
  Announcement as AnnouncementIcon,
  VerticalSplit as HeaderIcon,
  PowerInput as FooterIcon,
  ChevronRight as ChevronRightIcon,
  DragIndicator as DragIndicatorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { pagesApi, CreatePageDto } from "@/services/pages.api";
import { settingsApi } from "@/services/settings.api";
import { headerMenuApi } from "@/services/headerMenu.api";
import ResourcePicker from "@/components/admin/ResourcePicker";
import { CopyUrlButton } from "@/components/admin/CopyUrlButton";
import { SectionListItem } from "@/components/admin/SectionListItem";
import { GenericSectionEditor } from "@/components/admin/GenericSectionEditor";
import SectionPicker from "../../sections/SectionPicker";
import { SECTION_EDITORS } from "@/sections";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HeaderEditor } from "@/components/admin/HeaderEditor";
import { FooterEditor } from "@/components/admin/FooterEditor";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

// SECTION_EDITORS is the single source of truth for all editor mappings.
// All aliases (AboutUsHero, HardwareHero, ServiceHero, etc.) are registered
// directly in admin/src/sections/index.ts — no local overrides needed here.

// Sortable Item Wrapper
function SortableSectionItem(props: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? ("relative" as const) : ("static" as const),
  };

  return (
    <div ref={setNodeRef} style={style} data-section-index={props.index}>
      <SectionListItem
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

const sidebarVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  }),
};

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageId = params.pageId as string;
  const isAddMode = pageId === "add";

  const [loading, setLoading] = React.useState(!isAddMode);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
  const [storeScope] = React.useState<string>("ecommerce");
  const [pageStoreId, setPageStoreId] = React.useState<string | undefined>(undefined);
  const [storeDomain, setStoreDomain] = React.useState<string>("http://localhost:3000");
  const [showGuide, setShowGuide] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("editor_guide_dismissed") !== "true";
    }
    return true;
  });

  const handleDismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem("editor_guide_dismissed", "true");
  };

  const fetchStoreDomain = async () => {
    try {
      const domainsRes = await settingsApi.getDomains().catch(() => []);
      
      if (Array.isArray(domainsRes) && domainsRes.length > 0) {
        const customDomain = domainsRes.find((d: any) => d.type === "custom");
        const subDomain = domainsRes.find((d: any) => d.type === "subdomain");

        let protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

        if (customDomain) {
          if (process.env.NODE_ENV === 'development' && typeof window !== "undefined" && window.location.hostname === 'localhost') {
            setStoreDomain(`http://${customDomain.domain}`);
          } else {
            setStoreDomain(`${protocol}//${customDomain.domain}`);
          }
        } else if (subDomain) {
          let formattedDomain = subDomain.domain;

          if (process.env.NODE_ENV === 'development' && typeof window !== "undefined" && window.location.hostname === 'localhost') {
            const prefix = formattedDomain.split('.')[0];
            try {
              const parsedBaseUrl = new URL(baseWebsiteUrl);
              setStoreDomain(`${parsedBaseUrl.protocol}//${prefix}.${parsedBaseUrl.host}`);
            } catch (e) {
              setStoreDomain(`http://${prefix}.localhost:3000`);
            }
          } else {
            setStoreDomain(`${protocol}//${subDomain.domain}`);
          }
        }
      } else {
        const baseWebsiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
        setStoreDomain(baseWebsiteUrl);
      }
    } catch (err) {
      console.error("Failed to fetch store domain", err);
    }
  };

  React.useEffect(() => {
    fetchStoreDomain();
  }, []);

  // Modal State
  const [sectionToDeleteIndex, setSectionToDeleteIndex] = React.useState<
    number | null
  >(null);

  const [formData, setFormData] = React.useState<CreatePageDto>({
    title: "",
    slug: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaImage: "",
    template: "custom",
    showInFooter: false,
    showInHeader: false,
    sortOrder: 0,
    sections: [],
  });

  const [sections, setSections] = React.useState<any[]>([]);
  const [keywordInput, setKeywordInput] = React.useState("");
  const [sectionPickerOpen, setSectionPickerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  // Selected Section State for Editor
  const [selectedSectionIndex, setSelectedSectionIndex] = React.useState<
    number | null
  >(null);
  const [lastEditedSectionIndex, setLastEditedSectionIndex] = React.useState<
    number | null
  >(null);
  const [direction, setDirection] = React.useState(0);
  const [addingSectionAt, setAddingSectionAt] = React.useState<"top" | "bottom" | "template" | "header" | "footer">("template");

  // Global Settings State
  const [globalHeaderData, setGlobalHeaderData] = React.useState<any>(null);
  const [globalFooterData, setGlobalFooterData] = React.useState<any>(null);
  const [editingGlobal, setEditingGlobal] = React.useState<"header" | "footer" | null>(
    null
  );
  const [globalModified, setGlobalModified] = React.useState({
    header: false,
    footer: false,
  });

  // Preview Iframe
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = React.useState<boolean | number>(false);
  const [previewDevice, setPreviewDevice] = React.useState<
    "desktop" | "mobile"
  >("desktop");

  const [inlineImageEdit, setInlineImageEdit] = React.useState<{ index: number; fieldPath: string } | null>(null);
  const [inlineMediaPickerOpen, setInlineMediaPickerOpen] = React.useState(false);

  // Scale / Layout State
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [zoom, setZoom] = React.useState(0.7); // Default 0.7 (70%)

  // Listen for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "previewReady") {
        setIframeLoaded(Date.now());
      } else if (event.data?.type === "SECTION_CLICKED") {
        const index = event.data?.index;
        if (typeof index === 'number') {
          setDirection(1);
          setSelectedSectionIndex(index);
          setLastEditedSectionIndex(index);
          setEditingGlobal(null);
        }
      } else if (event.data?.type === "IMAGE_EDIT_REQUEST") {
        const { index, fieldPath } = event.data;
        if (typeof index === 'number' && fieldPath) {
          setDirection(1);
          setSelectedSectionIndex(index);
          setLastEditedSectionIndex(index);
          setInlineImageEdit({ index, fieldPath });
          setInlineMediaPickerOpen(true);
        }
      } else if (event.data?.type === "INLINE_UPDATE") {
        const { index, fieldPath, value } = event.data;
        if (typeof index === 'number' && fieldPath) {
          setSections(prev => {
            const newSections = [...prev];
            const section = { ...newSections[index] };
            
            // Determine if the section is flattened (data at root) or nested
            const isFlattened = section.type && !section.section;
            const baseData = isFlattened ? section : (section.section?.data || {});
            
            // Deep clone and merge all data sources to preserve original fields
            const data = JSON.parse(JSON.stringify({
              ...baseData,
              ...(section.data || {}),
              ...(section.customData || {})
            }));
            
            // Set nested value
            const keys = fieldPath.split('.');
            let current = data;
            for (let i = 0; i < keys.length - 1; i++) {
              if (current[keys[i]] === undefined) {
                current[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
              }
              current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            
            section.data = data;
            section.customData = data;
            
            if (isFlattened) {
              Object.assign(section, data);
            }
            
            newSections[index] = section;
            
            // Ensure formData stays in sync
            setFormData(fd => ({ ...fd, sections: newSections }));
            return newSections;
          });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Scroll to last edited section when returning to list
  React.useEffect(() => {
    if (selectedSectionIndex === null && lastEditedSectionIndex !== null) {
      // Small timeout to allow the list to render/animate in
      setTimeout(() => {
        const element = document.querySelector(
          `[data-section-index="${lastEditedSectionIndex}"]`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [selectedSectionIndex, lastEditedSectionIndex]);

  const [resourcePickerOpen, setResourcePickerOpen] = React.useState(false);
  const [resourcePickerConfig, setResourcePickerConfig] = React.useState<{
    onSelect: (slug: string) => void;
    type: "product" | "collection" | "page";
  } | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (!isAddMode) {
      fetchPage();
    } else {
      fetchGlobalSectionsOnly();
    }
  }, [pageId, isAddMode]);

  // Preview Syncer
  React.useEffect(() => {
    if (iframeRef.current && iframeLoaded) {
      sendPreviewUpdate();
    }
  }, [formData, sections, iframeLoaded, globalHeaderData, globalFooterData]);

  // Track container width for centering
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    // Re-measure after sidebar transition
    const timer = setTimeout(updateWidth, 350);

    return () => {
      window.removeEventListener("resize", updateWidth);
      clearTimeout(timer);
    };
  }, [direction, previewDevice]);

  const sendPreviewUpdate = async () => {
    if (!iframeRef.current?.contentWindow) return;

    // Use current state for header/footer if available, or fetch (for initial load)
    let headerSettings = globalHeaderData;
    let footerSettings = globalFooterData;
    const token = localStorage.getItem("token");

    // Fetch header settings only if not yet loaded
    if (!headerSettings) {
      try {
        const settingsRes = await settingsApi.getSettings();
        headerSettings = {
          ...(settingsRes.data || settingsRes),
          menus: [],
        };
        setGlobalHeaderData(headerSettings);
      } catch (e) {
        console.error("Failed to fetch header settings for preview", e);
        headerSettings = {
          contactEmail: "",
          contactPhone: "",
          topBar: { isEnabled: false, content: "", backgroundColor: "#ffffff", textColor: "#000000", links: [] },
          menus: [],
        };
        setGlobalHeaderData(headerSettings);
      }
    }

    // Use default footer settings (no dedicated footer-settings API endpoint)
    if (!footerSettings) {
      footerSettings = { contact: { phone: "", email: "", address: "" }, columns: [], socialLinks: [], copyrightText: "", showNewsletter: false };
      setGlobalFooterData(footerSettings);
    }


    const normalizedSections = sections.map((s) => {
      // If it's already flattened (from ID-based fetch)
      if (s.type && !s.section) {
        return s;
      }
      // If it's nested (from legacy/slug-based fetch, or newly added)
      return {
        ...s,
        // Ensure type is at root for SectionRendererClient
        type: s.type || s.section?.type,
        // Ensure data is extended for safety
        data: s.customData || s.data || s.section?.data || {},
      };
    });

    const payload = {
      ...formData,
      storeId: pageStoreId,
      sections: normalizedSections,
      headerSettings: headerSettings,
      footerSettings: footerSettings,
    };
    console.log("Admin sending preview payload:", {
      pageTitle: formData.title,
      sectionsCount: normalizedSections.length,
      hasHeaderMenus: !!headerSettings?.menus,
      hasFooterSocial: !!footerSettings?.socialLinks,
    });

    iframeRef.current.contentWindow.postMessage(
      {
        type: "previewUpdate",
        payload: payload,
      },
      "*"
    );
  };

  const fetchPage = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
        setIframeLoaded(false);
      }
      const isId =
        /^[0-9a-fA-F]{24}$/.test(pageId) ||
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          pageId
        );
      let page;
      if (!isId) {
        const response = await pagesApi.getPageBySlug(pageId);
        page = response.page;
      } else {
        const response = await pagesApi.getPageById(pageId);
        page = response.page;
      }

      if (page?.storeId) {
        setPageStoreId(page.storeId);
      }

      const token = localStorage.getItem("token");
      let globalHeaders = [];
      let globalFooters = [];
      try {
        const [headerRes, footerRes] = await Promise.all([
          fetch(`${API_URL}/admin/header-sections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/footer-sections`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (headerRes.ok) {
          const hData = await headerRes.json();
          globalHeaders = hData.data || [];
        }
        if (footerRes.ok) {
          const fData = await footerRes.json();
          globalFooters = fData.data || [];
        }
      } catch (err) {
        console.error("Failed to fetch global sections", err);
      }
      
      const combinedSections = [...globalHeaders, ...(page.sections || []), ...globalFooters];

      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        metaTitle: page.metaTitle || "",
        metaDescription: page.metaDescription || "",
        metaImage: page.metaImage || "",
        template: page.template,
        showInFooter: page.showInFooter,
        showInHeader: page.showInHeader,
        sortOrder: page.sortOrder,
        sections: combinedSections,
      });
      setSections(combinedSections);
    } catch (err: any) {
      setError(err.message || "Failed to fetch page");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const fetchGlobalSectionsOnly = async () => {
    try {
      setLoading(true);
      setIframeLoaded(false);
      const token = localStorage.getItem("token");
      let globalHeaders = [];
      let globalFooters = [];
      try {
        const [headerRes, footerRes] = await Promise.all([
          fetch(`${API_URL}/admin/header-sections`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/footer-sections`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (headerRes.ok) {
          const hData = await headerRes.json();
          globalHeaders = hData.data || [];
        }
        if (footerRes.ok) {
          const fData = await footerRes.json();
          globalFooters = fData.data || [];
        }
      } catch (err) {
        console.error("Failed to fetch global sections", err);
      }
      
      const combinedSections = [...globalHeaders, ...globalFooters];
      setFormData((prev) => ({ ...prev, sections: combinedSections }));
      setSections(combinedSections);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePageDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && isAddMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // --- Section Logic ---

  const handleSelectSection = (index: number) => {
    setDirection(1);
    setSelectedSectionIndex(index);
    setLastEditedSectionIndex(index);
    setEditingGlobal(null);
  };

  const handleBackToList = () => {
    setDirection(-1);
    setSelectedSectionIndex(null);
    setEditingGlobal(null);
  };

  const handleSelectHeader = () => {
    setDirection(1);
    setEditingGlobal("header");
    setSelectedSectionIndex(null);
  };

  const handleSelectFooter = () => {
    setDirection(1);
    setEditingGlobal("footer");
    setSelectedSectionIndex(null);
  };

  const handleToggleGlobalVisibility = (type: "header" | "footer") => {
    if (type === "header") {
      const newData = { ...globalHeaderData, isEnabled: !globalHeaderData?.isEnabled };
      setGlobalHeaderData(newData);
      setGlobalModified((prev) => ({ ...prev, header: true }));
    } else {
      const newData = { ...globalFooterData, isEnabled: !globalFooterData?.isEnabled };
      setGlobalFooterData(newData);
      setGlobalModified((prev) => ({ ...prev, footer: true }));
    }
  };

  const handleAddSection = (sectionsToAdd: any | any[]) => {
    const sectionsArray = Array.isArray(sectionsToAdd) ? sectionsToAdd : [sectionsToAdd];
    let newSections = [...sections];

    sectionsArray.forEach((section) => {
      const sectionType = section.key || section.type;

      let initialData = section.data || {};
      if (sectionType === "HeaderMain" && (!initialData || Object.keys(initialData).length === 0)) {
        initialData = globalHeaderData || {
          contactEmail: "",
          contactPhone: "",
          topBar: { isEnabled: false, content: "", backgroundColor: "#ffffff", textColor: "#000000", links: [] },
          menus: [],
        };
      } else if (sectionType === "FooterMain" && (!initialData || Object.keys(initialData).length === 0)) {
        initialData = globalFooterData || {
          contact: { phone: "", email: "", address: "" },
          columns: [],
          socialLinks: [],
          copyrightText: "",
          showNewsletter: false,
        };
      }

      const newSection = {
        id: crypto.randomUUID(),
        section: section,
        type: sectionType,
        isEnabled: true,
        group: addingSectionAt,
        sortOrder: newSections.length,
        ...initialData,
        data: initialData,
        customData: initialData,
      };

      if (addingSectionAt === "top" || addingSectionAt === "header") {
        newSections = [newSection, ...newSections];
      } else {
        newSections = [...newSections, newSection];
      }
    });

    setSections(newSections);
    handleInputChange("sections", newSections);
    setSectionPickerOpen(false);

    setDirection(1);
    const newIndex = (addingSectionAt === "top" || addingSectionAt === "header") ? 0 : newSections.length - 1;
    setSelectedSectionIndex(newIndex);
    setLastEditedSectionIndex(newIndex);
  };

  const handleUpdateSection = (index: number, newData: any) => {
    const newSections = [...sections];
    // Spread newData at root AND in customData for compatibility
    newSections[index] = {
      ...newSections[index],
      ...newData,
      customData: newData
    };
    setSections(newSections);
    handleInputChange("sections", newSections);
  };

  const handleToggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].isEnabled = !newSections[index].isEnabled;
    setSections(newSections);
    handleInputChange("sections", newSections);
  };

  const handleRemoveSection = (index: number) => {
    setSectionToDeleteIndex(index);
  };

  const confirmDeleteSection = () => {
    if (sectionToDeleteIndex !== null) {
      const newSections = [...sections];
      newSections.splice(sectionToDeleteIndex, 1);
      setSections(newSections);
      handleInputChange("sections", newSections);

      // If we are currently editing the deleted section, go back to list
      if (selectedSectionIndex === sectionToDeleteIndex) {
        handleBackToList();
      } else if (
        selectedSectionIndex !== null &&
        selectedSectionIndex > sectionToDeleteIndex
      ) {
        // Adjust selected index if we deleted a section above it
        setSelectedSectionIndex(selectedSectionIndex - 1);
      }

      // Clear last edited if we deleted it or shift it
      if (lastEditedSectionIndex === sectionToDeleteIndex) {
        setLastEditedSectionIndex(null);
      } else if (
        lastEditedSectionIndex !== null &&
        lastEditedSectionIndex > sectionToDeleteIndex
      ) {
        setLastEditedSectionIndex(lastEditedSectionIndex - 1);
      }

      setSectionToDeleteIndex(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Use dndId which we attach in render
    const oldIndex = sectionsWithIds.findIndex((s) => s.dndId === active.id);
    const newIndex = sectionsWithIds.findIndex((s) => s.dndId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      handleInputChange("sections", newSections);

      if (selectedSectionIndex === oldIndex) {
        setSelectedSectionIndex(newIndex);
      }

      // Update last edited connection
      if (lastEditedSectionIndex === oldIndex) {
        setLastEditedSectionIndex(newIndex);
      } else if (
        lastEditedSectionIndex !== null &&
        lastEditedSectionIndex >= Math.min(oldIndex, newIndex) &&
        lastEditedSectionIndex <= Math.max(oldIndex, newIndex)
      ) {
        // If the last edited item was in the range of the move, but not the item being moved,
        // it might need index adjustment.
        // Simplification: if we reorder, just trust the new index if we can find it,
        // but since we track by index, it's tricky.
        // Ideally we should track by ID.
        // But for now, let's just reset if it gets too complex, or hope index tracking is enough for simple moves.
        // Actually since we use indices for everything, we should update the index.
        // If we move A(0) to pos 2. A becomes 2. B(1) becomes 0. C(2) becomes 1.
        // arrayMove handles the array. We just need to know where our item went.
        // If lastEdited was oldIndex, it is now newIndex.
        // If lastEdited was NOT oldIndex, we need to find where it went.
        // Valid for simple swap logic, effectively.
        if (lastEditedSectionIndex === oldIndex) {
          setLastEditedSectionIndex(newIndex);
        } else {
          // If we moved an item from above lastEdited to below it, lastEdited decreases.
          if (
            oldIndex < lastEditedSectionIndex &&
            newIndex >= lastEditedSectionIndex
          ) {
            setLastEditedSectionIndex(lastEditedSectionIndex - 1);
          }
          // If we moved an item from below lastEdited to above it, lastEdited increases.
          else if (
            oldIndex > lastEditedSectionIndex &&
            newIndex <= lastEditedSectionIndex
          ) {
            setLastEditedSectionIndex(lastEditedSectionIndex + 1);
          }
        }
      }
    }
  };

  // Submission
  const handleSubmit = async (publish: boolean = false) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!formData.title || !formData.slug) {
        setError("Title and slug are required");
        return;
      }

      const apiSections = (formData.sections || []).map((s: any, index: number) => {
        // Prepare clean settings by picking up updates from root or customData
        const settings = {
          ...(s.section?.data || {}),
          ...s, // Pick up root-level overrides
          ...(s.customData || {}), // Final overrides
        };

        // Remove non-persistent metadata
        delete settings.id;
        delete settings.section;
        delete settings.dndId;
        delete settings.sortOrder;
        delete settings.isEnabled;
        delete settings.customData;
        delete settings.sectionId;
        delete settings.data;
        delete settings.settings;
        delete settings.group;

        return {
          ...s,
          sectionId: s.sectionId || s.section?.id || s.section || s.id,
          sortOrder: index,
          settings: settings, // Explicitly provide settings for CmsService
        };
      });

      const headerSections = apiSections.filter(s => s.group === 'header' || s.group === 'top');
      const footerSections = apiSections.filter(s => s.group === 'footer' || s.group === 'bottom');
      const templateSections = apiSections.filter(s => s.group !== 'header' && s.group !== 'top' && s.group !== 'footer' && s.group !== 'bottom');

      const payload = { ...formData, sections: templateSections };

      // 1. Save global header and footer sections seamlessly first
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/admin/header-sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(headerSections),
      });
      await fetch(`${API_URL}/admin/footer-sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(footerSections),
      });

      // 2. Save Global Settings if modified
      if (globalModified.header && globalHeaderData) {
        const headerPayload: any = { ...globalHeaderData };
        const menusToSave = headerPayload.menus || [];
        delete headerPayload.menus; // Don't save menus back to general settings

        // Save general header settings
        await fetch(`${API_URL}/admin/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(headerPayload),
        });

        // Save Menus
        const updatedMenus: any[] = [];
        for (const menu of menusToSave) {
          try {
            if (menu.id.startsWith("temp-")) {
              const { id, ...createData } = menu;
              const { menu: createdMenu } = await headerMenuApi.createMenu(createData);
              updatedMenus.push(createdMenu);
            } else {
              const { menu: updatedMenu } = await headerMenuApi.updateMenu(menu.id, menu);
              updatedMenus.push(updatedMenu);
            }
          } catch (e) {
            console.error(`Failed to save menu ${menu.name}`, e);
            updatedMenus.push(menu); // Keep original if failed
          }
        }

        // Update globalHeaderData with fresh menu IDs/data to prevent duplication on next save
        setGlobalHeaderData((prev: any) => ({
          ...prev,
          menus: updatedMenus
        }));
        setGlobalModified(prev => ({ ...prev, header: false }));
      }
      setGlobalModified({ header: false, footer: false });

      // 3. Save page entity
      if (isAddMode) {
        const { page } = await pagesApi.createPage(payload);
        const newPageId = (page as any).id || (page as any)._id;

        if (publish && newPageId) {
          await pagesApi.updatePage(newPageId, { ...payload, isPublished: true });
          setSuccess("Page published successfully!");
          await fetchPage(false);
          router.replace(`/pages/${newPageId}`);
        } else {
          setSuccess("Page created successfully!");
          setTimeout(() => router.push("/pages"), 1500);
        }
      } else {
        if (publish) {
          // When publishing an existing page, send full data with isPublished: true
          await pagesApi.updatePage(pageId, { ...payload, isPublished: true });
          setSuccess("Page published and live!");
          await fetchPage(false);
        } else {
          await pagesApi.updatePage(pageId, payload);
          setSuccess("Page updated successfully!");
          setTimeout(() => router.push("/pages"), 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const openResourcePicker = (
    onSelect: (slug: string) => void,
    type: "product" | "collection" | "page" = "product"
  ) => {
    setResourcePickerConfig({ onSelect, type });
    setResourcePickerOpen(true);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    sendPreviewUpdate();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );

  // Editor Resolution
  const selectedSection =
    selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  let editorData = {};
  let sectionType = "";
  let sectionName = "";

  if (selectedSection) {
    // Determine type and data based on whether 'section' is populated object or ID, or if using fallback type
    if (
      selectedSection.section &&
      typeof selectedSection.section === "object"
    ) {
      sectionType = selectedSection.section.type || selectedSection.section.key || "Unknown";
      sectionName = selectedSection.section.name || sectionType;
      // Merge customData over default data
      editorData = {
        ...(selectedSection.section.data || {}),
        ...(selectedSection.customData || {}),
      };
    } else {
      sectionType = selectedSection.type;
      sectionName = selectedSection.type;
      editorData =
        selectedSection.customData ||
        selectedSection.data ||
        // Fallback for flattened hydration where data is at root
        selectedSection;
    }
  }

  // Direct exact-match lookup — no Proxy, no guessing
  const SelectedEditor =
    (sectionType ? SECTION_EDITORS[sectionType] : null) || GenericSectionEditor;

  const isEditing = selectedSectionIndex !== null || editingGlobal !== null;

  // Add IDs for DnD
  const sectionsWithIds = sections.map((s) => ({
    ...s,
    dndId: s.id || crypto.randomUUID(),
  }));

  const effectiveScale =
    zoom === 0
      ? containerWidth
        ? Math.min((containerWidth - 48) / 1440, 1)
        : 1
      : zoom;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ConfirmationModal
        open={sectionToDeleteIndex !== null}
        title="Remove Section"
        message="Are you sure you want to remove this section?"
        onConfirm={confirmDeleteSection}
        onCancel={() => setSectionToDeleteIndex(null)}
        isDestructive
        confirmLabel="Remove"
      />
      {/* Main Workspace (Unified Split View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unified Sidebar (300px) */}
        <div className="w-[300px] flex-none bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden z-30 shadow-lg relative">
          {/* Sidebar Header */}
          <div className="h-14 min-h-[56px] flex items-center justify-between px-4 border-b border-slate-200 bg-white flex-none">
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push("/pages")}
              sx={{ color: "#64748b", textTransform: "none" }}
            >
              Back
            </Button>
            <div className="flex items-center gap-0.5">
              <span className="font-bold text-slate-700 text-sm">
                PAGE EDITOR
              </span>
              <IconButton
                size="small"
                onClick={() => setShowGuide(prev => !prev)}
                title="Toggle Guide"
                sx={{ color: showGuide ? "#3b82f6" : "#94a3b8" }}
              >
                <HelpOutlineIcon style={{ fontSize: 16 }} />
              </IconButton>
            </div>
          </div>

          <AnimatePresence initial={false} custom={direction}>
            {!isEditing ? (
              // --- VIEW: LIST ---
              <motion.div
                key="list"
                custom={direction}
                variants={sidebarVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute top-14 left-0 right-0 bottom-0 bg-white overflow-y-scroll no-scrollbar"
              >
                <div className="flex flex-col gap-6 p-3 pb-3">
                  {showGuide && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-2 relative shadow-sm">
                      <button
                        onClick={handleDismissGuide}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Dismiss guide"
                      >
                        <CloseIcon style={{ fontSize: 14 }} />
                      </button>
                      <div className="font-bold flex items-center gap-1.5 text-blue-950">
                        💡 Quick Editor Guide
                      </div>
                      <p className="leading-relaxed pr-4">
                        <strong>Direct Preview Edit:</strong> Click & type directly on headings or text inside the live preview on the right.
                      </p>
                      <p className="leading-relaxed pr-4">
                        <strong>Sidebar Settings:</strong> Select any section listed below to open the sidebar for editing layouts, colors, images, and lists.
                      </p>
                    </div>
                  )}
                  {/* --- HEADER GROUP --- */}
                  <div className="flex flex-col">
                    <div className="px-2 mb-2">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Header</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={sectionsWithIds.filter(s => s.group === "header" || s.group === "top").map((s) => s.dndId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="divide-y divide-slate-100">
                            {sectionsWithIds.filter(s => s.group === "header" || s.group === "top").map((section: any) => {
                              const actualIndex = sections.findIndex(orig => orig.id === section.id);
                              return (
                                <SortableSectionItem
                                  key={section.dndId}
                                  id={section.dndId}
                                  index={actualIndex}
                                  title={section.section?.name || section.name || section.type}
                                  isActive={selectedSectionIndex === actualIndex}
                                  isLastActive={lastEditedSectionIndex === actualIndex}
                                  isEnabled={section.isEnabled}
                                  onSelect={() => handleSelectSection(actualIndex)}
                                  onToggleEnable={() => handleToggleSection(actualIndex)}
                                  onDelete={() => handleRemoveSection(actualIndex)}
                                  isDynamic={true}
                                />
                              );
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                    <button
                      onClick={() => {
                        setAddingSectionAt("header");
                        setSectionPickerOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 mt-2 p-2 rounded-lg border border-dashed border-slate-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-bold"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      ADD HEADER
                    </button>
                  </div>

                  <div className="h-px bg-slate-300 mx-2" />

                  {/* --- TEMPLATE GROUP --- */}
                  <div className="flex flex-col">
                    <div className="px-2 mb-2">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Template</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={sectionsWithIds.filter(s => s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")).map((s) => s.dndId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="divide-y divide-slate-100">
                            {sectionsWithIds.filter(s => s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")).length === 0 && (
                              <div className="p-8 text-center text-slate-400 text-xs">
                                No sections added.
                              </div>
                            )}
                            {sectionsWithIds.filter(s => s.group === "template" || (!s.group && s.group !== "header" && s.group !== "footer" && s.group !== "top" && s.group !== "bottom")).map((section: any) => {
                              const actualIndex = sections.findIndex(orig => orig.id === section.id);
                              return (
                                <SortableSectionItem
                                  key={section.dndId}
                                  id={section.dndId}
                                  index={actualIndex}
                                  title={section.section?.name || section.name || section.type}
                                  isActive={selectedSectionIndex === actualIndex}
                                  isLastActive={lastEditedSectionIndex === actualIndex}
                                  isEnabled={section.isEnabled}
                                  onSelect={() => handleSelectSection(actualIndex)}
                                  onToggleEnable={() => handleToggleSection(actualIndex)}
                                  onDelete={() => handleRemoveSection(actualIndex)}
                                  isDynamic={true}
                                />
                              );
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                    <button
                      onClick={() => {
                        setAddingSectionAt("template");
                        setSectionPickerOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 mt-2 p-2 rounded-lg border border-dashed border-slate-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-bold"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      ADD SECTION
                    </button>
                  </div>

                  <div className="h-px bg-slate-300 mx-2" />

                  {/* --- FOOTER GROUP --- */}
                  <div className="flex flex-col">
                    <div className="px-2 mb-2">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">Footer</span>
                    </div>
                    <button
                      onClick={() => {
                        setAddingSectionAt("footer");
                        setSectionPickerOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 mb-2 p-2 rounded-lg border border-dashed border-slate-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all text-xs font-bold"
                    >
                      <AddIcon sx={{ fontSize: 16 }} />
                      ADD FOOTER
                    </button>
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={sectionsWithIds.filter(s => s.group === "footer" || s.group === "bottom").map((s) => s.dndId)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="divide-y divide-slate-100">
                            {sectionsWithIds.filter(s => s.group === "footer" || s.group === "bottom").map((section: any) => {
                              const actualIndex = sections.findIndex(orig => orig.id === section.id);
                              return (
                                <SortableSectionItem
                                  key={section.dndId}
                                  id={section.dndId}
                                  index={actualIndex}
                                  title={section.section?.name || section.name || section.type}
                                  isActive={selectedSectionIndex === actualIndex}
                                  isLastActive={lastEditedSectionIndex === actualIndex}
                                  isEnabled={section.isEnabled}
                                  onSelect={() => handleSelectSection(actualIndex)}
                                  onToggleEnable={() => handleToggleSection(actualIndex)}
                                  onDelete={() => handleRemoveSection(actualIndex)}
                                  isDynamic={true}
                                />
                              );
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mx-3 mb-6">
                  <div
                    className="p-3 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <SettingsIcon
                        className="text-slate-400"
                        style={{ fontSize: 18 }}
                      />
                      <span className="text-sm font-bold text-slate-700">
                        PAGE SETTINGS & SEO
                      </span>
                    </div>
                    {settingsOpen ? (
                      <KeyboardArrowUpIcon
                        fontSize="small"
                        className="text-slate-400"
                      />
                    ) : (
                      <KeyboardArrowDownIcon
                        fontSize="small"
                        className="text-slate-400"
                      />
                    )}
                  </div>

                  <Collapse in={settingsOpen}>
                    <div className="p-5 space-y-6 border-t border-slate-200">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                          General
                        </label>
                        <TextField
                          label="Page Title"
                          size="small"
                          fullWidth
                          value={formData.title}
                          sx={{ mb: 2 }}
                          onChange={(e) =>
                            handleInputChange("title", e.target.value)
                          }
                        />
                        <TextField
                          label="URL Slug"
                          size="small"
                          fullWidth
                          value={formData.slug}
                          onChange={(e) =>
                            handleInputChange("slug", e.target.value)
                          }
                          helperText={`/pages/${formData.slug}`}
                        />
                      </div>

                      {/* SEO Settings */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                          <SearchIcon style={{ fontSize: 14 }} /> SEO Metadata
                        </label>
                        <TextField
                          label="Meta Title"
                          size="small"
                          fullWidth
                          value={formData.metaTitle}
                          placeholder={formData.title}
                          onChange={(e) =>
                            handleInputChange("metaTitle", e.target.value)
                          }
                          helperText={`${(formData.metaTitle || "").length
                            }/60 characters`}
                        />
                        <TextField
                          label="Meta Description"
                          size="small"
                          fullWidth
                          multiline
                          rows={3}
                          value={formData.metaDescription}
                          onChange={(e) =>
                            handleInputChange(
                              "metaDescription",
                              e.target.value
                            )
                          }
                          helperText={`${(formData.metaDescription || "").length
                            }/160 characters`}
                        />
                      </div>

                      {/* Share Image */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                          <ImageIcon style={{ fontSize: 14 }} /> Share Image
                        </label>
                        <div className="flex items-start gap-4">
                          {formData.metaImage ? (
                            <div className="relative w-24 h-24 border border-slate-200 rounded-lg overflow-hidden bg-slate-50 group">
                              <img
                                src={formData.metaImage}
                                alt="Share Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  handleInputChange("metaImage", "")
                                }
                                className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <CloseIcon fontSize="small" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setMediaPickerOpen(true)}
                              className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-blue-400 hover:text-blue-500 transition-colors bg-slate-50"
                            >
                              <ImageIcon fontSize="small" />
                              <span className="text-[10px] mt-1">Select</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ImageIcon />}
                              onClick={() => setMediaPickerOpen(true)}
                              sx={{ textTransform: "none" }}
                            >
                              Select Image
                            </Button>
                            <p className="text-xs text-slate-400 mt-2">
                              Recommended: 1200x630px
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Collapse>
                </div>
              </motion.div>
            ) : (
              // --- VIEW: EDITOR ---
              <motion.div
                key="editor"
                custom={direction}
                variants={sidebarVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute top-14 left-0 right-0 bottom-0 flex flex-col bg-white"
              >
                <div className="flex-none p-3 border-b border-slate-100 flex items-center gap-2 bg-white">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-slate-100"
                  >
                    <ChevronLeftIcon fontSize="small" />
                    List
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1"></div>
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {editingGlobal === "header"
                      ? "Website Header"
                      : editingGlobal === "footer"
                        ? "Website Footer"
                        : sectionName}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-0 product-form-container">
                  {editingGlobal === "header" ? (
                    <HeaderEditor
                      data={globalHeaderData}
                      onChange={(newData) => {
                        setGlobalHeaderData(newData);
                        setGlobalModified((prev) => ({ ...prev, header: true }));
                      }}
                    />
                  ) : editingGlobal === "footer" ? (
                    <FooterEditor
                      data={globalFooterData}
                      onChange={(newData) => {
                        setGlobalFooterData(newData);
                        setGlobalModified((prev) => ({ ...prev, footer: true }));
                      }}
                    />
                  ) : selectedSection ? (
                    <div className="p-5">
                      <SelectedEditor
                        data={editorData}
                        onChange={(newData: any) =>
                          handleUpdateSection(selectedSectionIndex!, newData)
                        }
                        openResourcePicker={openResourcePicker}
                        showAdvanced={sectionType === "HardwareHero"}
                        showTrustedBy={sectionType === "Hero"}
                      />
                      <div className="mt-8 pt-4 border-t border-slate-100">
                        <Button
                          color="error"
                          size="small"
                          onClick={() =>
                            handleRemoveSection(selectedSectionIndex!)
                          }
                          startIcon={<CloseIcon />}
                          fullWidth
                          variant="outlined"
                        >
                          Remove Section
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 mt-10 p-5">
                      Section not found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Pane */}
        <div className="flex-1 relative flex flex-col min-w-0 z-10">
          {/* Preview Toolbar */}
          <div className="h-14 min-h-[56px] flex-none bg-white border-b border-slate-200 px-4 flex justify-between items-center z-20 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 hidden md:block">
                {formData.title || "Untitled Page"}
              </h1>
              {formData.slug && (
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs">
                  /{formData.slug}
                </span>
              )}
              {(formData.slug || !isAddMode) && (
                <>
                  <CopyUrlButton
                    url={`${storeDomain}/pages/${formData.slug || pageId || (formData as any).id || (formData as any)._id}`}
                  />
                  <a
                    href={`${storeDomain}/pages/${formData.slug || pageId || (formData as any).id || (formData as any)._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors bg-white text-sm"
                    title="View Live Page"
                  >
                    <VisibilityIcon fontSize="small" />
                    View Live
                  </a>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop"
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                  title="Desktop View"
                >
                  <DesktopWindowsIcon fontSize="small" />
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile"
                    ? "bg-white shadow text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                    }`}
                  title="Mobile View"
                >
                  <SmartphoneIcon fontSize="small" />
                </button>
              </div>

              {previewDevice === "desktop" && (
                <div className="">
                  <Select
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    size="small"
                    sx={{ height: 32, bgcolor: "white" }}
                  >
                    <MenuItem value={0}>Auto Fit</MenuItem>
                    <MenuItem value={0.5}>50%</MenuItem>
                    <MenuItem value={0.7}>70%</MenuItem>
                    <MenuItem value={0.75}>75%</MenuItem>
                    <MenuItem value={0.8}>80%</MenuItem>
                    <MenuItem value={0.9}>90%</MenuItem>
                    <MenuItem value={1}>100%</MenuItem>
                  </Select>
                </div>
              )}

              <Button
                variant="outlined"
                onClick={() => handleSubmit(false)}
                disabled={saving}
                size="small"
                sx={{ minWidth: 80 }}
              >
                Draft
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<PublishIcon />}
                onClick={() => handleSubmit(true)}
                disabled={saving}
                size="small"
                sx={{ bgcolor: "#28a745", "&:hover": { bgcolor: "#218838" } }}
              >
                Publish
              </Button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4 relative" ref={containerRef}>
            {/* Wrapper for Scaling Logic */}
            <div
              className={`transition-all duration-300 relative mx-auto ${previewDevice === "mobile" ? "py-8" : ""
                }`}
              style={{
                width:
                  previewDevice === "desktop"
                    ? `${1440 * effectiveScale}px`
                    : "fit-content",
                height: previewDevice === "desktop" ? "100%" : "fit-content",
              }}
            >
              <div
                className={`bg-white shadow-2xl overflow-hidden relative ${previewDevice === "mobile"
                  ? "w-[375px] h-[750px] rounded-[30px] border-8 border-slate-800"
                  : "rounded-md border border-slate-300 origin-top-left"
                  }`}
                style={
                  previewDevice === "desktop"
                    ? {
                      width: "1440px",
                      height: `calc(100% / ${effectiveScale})`,
                      transform: `scale(${effectiveScale})`,
                      transformOrigin: "top left",
                    }
                    : {}
                }
              >
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                    <CircularProgress />
                  </div>
                )}

                <iframe
                  ref={iframeRef}
                  title="Preview"
                  className="w-full h-full border-0"
                  src={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/preview`}
                  onLoad={handleIframeLoad}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        sectionPickerOpen && (
          <SectionPicker
            open={sectionPickerOpen}
            onClose={() => setSectionPickerOpen(false)}
            onSelect={handleAddSection}
            category={
              addingSectionAt === "header" || addingSectionAt === "top"
                ? "header"
                : addingSectionAt === "footer" || addingSectionAt === "bottom"
                  ? "footer"
                  : formData.template !== "custom"
                    ? formData.template
                    : "section"
            }
            scope={storeScope}
            storeId={pageStoreId}
          />
        )
      }

      {
        resourcePickerOpen && resourcePickerConfig && (
          <ResourcePicker
            isOpen={resourcePickerOpen}
            onClose={() => setResourcePickerOpen(false)}
            onSelect={(slug) => {
              resourcePickerConfig.onSelect(slug);
              setResourcePickerOpen(false);
            }}
            initialType={resourcePickerConfig.type}
          />
        )
      }

      <MediaPickerModal
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          handleInputChange("metaImage", url);
          setMediaPickerOpen(false);
        }}
        title="Select Share Image"
      />

      <MediaPickerModal
        open={inlineMediaPickerOpen}
        onClose={() => {
          setInlineMediaPickerOpen(false);
          setInlineImageEdit(null);
        }}
        onSelect={(file: any) => {
          const url = typeof file === 'string' ? file : file.url;
          if (inlineImageEdit) {
            const { index, fieldPath } = inlineImageEdit;
            
            setSections(prev => {
              const newSections = [...prev];
              const section = { ...newSections[index] };
              const isFlattened = section.type && !section.section;
              const baseData = isFlattened ? section : (section.section?.data || {});
              
              const data = JSON.parse(JSON.stringify({
                ...baseData,
                ...(section.data || {}),
                ...(section.customData || {})
              }));
              
              const keys = fieldPath.split('.');
              let current = data;
              for (let i = 0; i < keys.length - 1; i++) {
                if (current[keys[i]] === undefined) {
                  current[keys[i]] = /^\d+$/.test(keys[i + 1]) ? [] : {};
                }
                current = current[keys[i]];
              }
              current[keys[keys.length - 1]] = url;
              
              section.data = data;
              section.customData = data;
              
              if (isFlattened) {
                Object.assign(section, data);
              }
              
              newSections[index] = section;
              setFormData(fd => ({ ...fd, sections: newSections }));
              return newSections;
            });
          }
          setInlineMediaPickerOpen(false);
          setInlineImageEdit(null);
        }}
        title="Change Section Image"
      />

      {
        error && (
          <div className="fixed bottom-4 right-4 z-[9999]">
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )
      }
      {
        success && (
          <div className="fixed bottom-4 right-4 z-[9999]">
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </div>
        )
      }
    </div >
  );
}
