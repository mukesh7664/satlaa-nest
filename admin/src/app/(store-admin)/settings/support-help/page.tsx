"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    IconButton,
    Tabs,
    Tab,
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    Tooltip,
    Card,
    CardContent,
    CardMedia,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    Search as SearchIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    HelpOutline as HelpIcon,
    VideoLibrary as VideoIcon,
    ConfirmationNumber as TicketIcon,
    ExpandMore as ExpandMoreIcon,
    Send as SendIcon,
    PlusOne as PlusIcon,
    GridView as GridViewIcon,
    ViewList as ViewListIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { supportApi, HelpResource, SupportTicket, TicketMessage } from "@/services/support.api";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`support-tabpanel-${index}`}
            aria-labelledby={`support-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 1.5, pb: 0 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function SupportHelpPage() {
    const [tabValue, setTabValue] = useState(0);

    // Help Center States (FAQs and Videos)
    const [resources, setResources] = useState<HelpResource[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [resourceSearch, setResourceSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [videoViewMode, setVideoViewMode] = useState<"grid" | "list">("grid");

    // Video Player Dialog States
    const [activeVideo, setActiveVideo] = useState<HelpResource | null>(null);

    // Support Tickets States
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [ticketFilterStatus, setTicketFilterStatus] = useState("");

    // Create Ticket States
    const [createOpen, setCreateOpen] = useState(false);
    const [submittingTicket, setSubmittingTicket] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "Technical Support",
        priority: "medium" as any,
        description: "",
    });

    // Chat Drawer States
    const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Load FAQs and Videos when tab changes
    useEffect(() => {
        if (tabValue === 0) {
            fetchHelpResources("faq");
        } else if (tabValue === 1) {
            fetchHelpResources("video");
        } else if (tabValue === 2) {
            fetchTickets();
        }
    }, [tabValue]);

    // Active ticket message polling
    useEffect(() => {
        if (chatOpen && activeTicket) {
            fetchMessages(activeTicket.id, false);
            // Poll for messages every 15 seconds
            pollingIntervalRef.current = setInterval(() => {
                fetchMessages(activeTicket.id, false);
            }, 15000);
        } else {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [chatOpen, activeTicket]);

    // Scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchHelpResources = async (type: "faq" | "video") => {
        try {
            setLoadingResources(true);
            const data = await supportApi.getHelpResources(type);
            setResources(data);
        } catch (error) {
            console.error("Error fetching resources:", error);
            toast.error("Failed to load help center resources");
        } finally {
            setLoadingResources(false);
        }
    };

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const data = await supportApi.getStoreTickets(ticketFilterStatus || undefined);
            setTickets(data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            toast.error("Failed to load support tickets");
        } finally {
            setLoadingTickets(false);
        }
    };

    const fetchMessages = async (ticketId: string, showLoader = true) => {
        try {
            if (showLoader) setLoadingMessages(true);
            const data = await supportApi.getTicketMessages(ticketId);
            setMessages(data);
        } catch (error) {
            console.error("Error loading chat messages:", error);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            setSubmittingTicket(true);
            await supportApi.createTicket(newTicket);
            toast.success("Support ticket created successfully!");
            setCreateOpen(false);
            setNewTicket({
                subject: "",
                category: "Technical Support",
                priority: "medium",
                description: "",
            });
            fetchTickets();
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Failed to create support ticket.");
        } finally {
            setSubmittingTicket(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeTicket) return;

        try {
            setSendingReply(true);
            const msg = await supportApi.sendTicketMessage(activeTicket.id, replyText);
            setMessages((prev) => [...prev, msg]);
            setReplyText("");
            // Update ticket list state in background
            fetchTickets();
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error("Failed to send message.");
        } finally {
            setSendingReply(false);
        }
    };

    const handleCloseTicket = async (ticketId: string) => {
        try {
            await supportApi.closeTicket(ticketId);
            toast.success("Ticket closed successfully.");
            setChatOpen(false);
            fetchTickets();
        } catch (error) {
            console.error("Error closing ticket:", error);
            toast.error("Failed to close ticket.");
        }
    };

    // Filter FAQs & Videos locally by category & search term
    const filteredResources = resources.filter((res) => {
        const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
        const matchesSearch =
            res.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
            res.content.toLowerCase().includes(resourceSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Extract unique categories from resources
    const categories = ["All", ...Array.from(new Set(resources.map((r) => r.category)))];

    // Count tickets by status
    const ticketStats = {
        total: tickets.length,
        open: tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
        resolved: tickets.filter((t) => t.status === "resolved").length,
    };

    // Convert standard youtube watch link to embed link
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        try {
            if (url.includes("embed/")) return url;
            const urlObj = new URL(url);
            if (urlObj.hostname.includes("youtube.com")) {
                const videoId = urlObj.searchParams.get("v");
                return `https://www.youtube.com/embed/${videoId}`;
            } else if (urlObj.hostname.includes("youtu.be")) {
                const videoId = urlObj.pathname.substring(1);
                return `https://www.youtube.com/embed/${videoId}`;
            }
            return url;
        } catch (e) {
            return url;
        }
    };

    return (
        <div className="p-6 space-y-4 font-sans">
            {/* Page Title Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Support & Help Center</h1>
                    <p className="text-sm text-slate-500 mt-1">Get answer to your queries, watch video tutorials, or chat directly with our support team.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <Tabs
                    value={tabValue}
                    onChange={(e, val) => {
                        setTabValue(val);
                        setSelectedCategory("All");
                        setResourceSearch("");
                    }}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab
                        icon={<HelpIcon fontSize="small" />}
                        iconPosition="start"
                        label="FAQs"
                        sx={{ textTransform: "none", fontWeight: "600", fontSize: "14px" }}
                    />
                    <Tab
                        icon={<VideoIcon fontSize="small" />}
                        iconPosition="start"
                        label="Video Tutorials"
                        sx={{ textTransform: "none", fontWeight: "600", fontSize: "14px" }}
                    />
                    <Tab
                        icon={<TicketIcon fontSize="small" />}
                        iconPosition="start"
                        label="Support Tickets"
                        sx={{ textTransform: "none", fontWeight: "600", fontSize: "14px" }}
                    />
                </Tabs>
            </div>

            {/* FAQ TAB PANEL */}
            <TabPanel value={tabValue} index={0}>
                <div className="space-y-4">
                    {/* Search and Category Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                        <TextField
                            placeholder="Search FAQs..."
                            variant="outlined"
                            size="small"
                            value={resourceSearch}
                            onChange={(e) => setResourceSearch(e.target.value)}
                            sx={{
                                width: { xs: "100%", sm: 320 },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    height: "38px",
                                    fontSize: "13px",
                                    backgroundColor: "#ffffff",
                                }
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
                            }}
                        />

                        <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
                            <Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                sx={{
                                    borderRadius: "8px",
                                    height: "38px",
                                    fontSize: "13px",
                                    bgcolor: "#ffffff"
                                }}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat} sx={{ fontSize: "13px" }}>
                                        {cat === "All" ? "All Categories" : cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {loadingResources ? (
                        <div className="flex justify-center items-center py-12">
                            <CircularProgress />
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                            <HelpIcon sx={{ fontSize: 48 }} className="text-slate-300 mb-2" />
                            <p className="text-slate-500 font-semibold">No FAQs found matching your filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredResources.map((faq) => (
                                <Accordion
                                    key={faq.id}
                                    sx={{
                                        boxShadow: "none",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "8px !important",
                                        "&:before": { display: "none" },
                                        overflow: "hidden",
                                        mb: 1,
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon className="text-slate-600" />}
                                        sx={{ bgcolor: "#f8fafc", px: 3, py: 1 }}
                                    >
                                        <Typography sx={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>
                                            {faq.title}
                                        </Typography>
                                        <Chip
                                            label={faq.category}
                                            size="small"
                                            sx={{
                                                ml: 2,
                                                height: "18px",
                                                fontSize: "10px",
                                                fontWeight: "bold",
                                                bgcolor: "#e2e8f0",
                                                color: "#475569"
                                            }}
                                        />
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ px: 3, py: 3, borderTop: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                                        <div
                                            className="text-slate-600 text-sm leading-relaxed whitespace-pre-line"
                                            dangerouslySetInnerHTML={{ __html: faq.content }}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </div>
                    )}
                </div>
            </TabPanel>

            {/* VIDEO TUTORIALS TAB PANEL */}
            <TabPanel value={tabValue} index={1}>
                <div className="space-y-6">
                    {/* Search and Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <TextField
                                placeholder="Search Videos..."
                                variant="outlined"
                                size="small"
                                value={resourceSearch}
                                onChange={(e) => setResourceSearch(e.target.value)}
                                sx={{
                                    width: { xs: "100%", sm: 320 },
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "8px",
                                        height: "38px",
                                        fontSize: "13px",
                                        backgroundColor: "#ffffff",
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <SearchIcon className="text-slate-400 mr-2" fontSize="small" />
                                }}
                            />

                            <FormControl size="small" sx={{ minWidth: 200, width: { xs: "100%", sm: "auto" } }}>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    sx={{
                                        borderRadius: "8px",
                                        height: "38px",
                                        fontSize: "13px",
                                        bgcolor: "#ffffff"
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat} sx={{ fontSize: "13px" }}>
                                            {cat === "All" ? "All Categories" : cat}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        {/* View Switcher Toggles */}
                        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0">
                            <IconButton
                                size="small"
                                onClick={() => setVideoViewMode("grid")}
                                sx={{
                                    borderRadius: "6px",
                                    bgcolor: videoViewMode === "grid" ? "#ffffff" : "transparent",
                                    boxShadow: videoViewMode === "grid" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                                    color: videoViewMode === "grid" ? "var(--primary)" : "#64748b",
                                    "&:hover": { bgcolor: videoViewMode === "grid" ? "#ffffff" : "rgba(0,0,0,0.04)" },
                                    px: 1.5,
                                    py: 0.5
                                }}
                            >
                                <GridViewIcon fontSize="small" sx={{ mr: 0.5, fontSize: "16px" }} />
                                <span className="text-xs font-bold">Grid</span>
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => setVideoViewMode("list")}
                                sx={{
                                    borderRadius: "6px",
                                    bgcolor: videoViewMode === "list" ? "#ffffff" : "transparent",
                                    boxShadow: videoViewMode === "list" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                                    color: videoViewMode === "list" ? "var(--primary)" : "#64748b",
                                    "&:hover": { bgcolor: videoViewMode === "list" ? "#ffffff" : "rgba(0,0,0,0.04)" },
                                    px: 1.5,
                                    py: 0.5
                                }}
                            >
                                <ViewListIcon fontSize="small" sx={{ mr: 0.5, fontSize: "16px" }} />
                                <span className="text-xs font-bold">List</span>
                            </IconButton>
                        </div>
                    </div>

                    {loadingResources ? (
                        <div className="flex justify-center items-center py-12">
                            <CircularProgress />
                        </div>
                    ) : filteredResources.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                            <VideoIcon sx={{ fontSize: 48 }} className="text-slate-300 mb-2" />
                            <p className="text-slate-500 font-semibold">No tutorial videos found matching your filters.</p>
                        </div>
                    ) : videoViewMode === "grid" ? (
                        <Grid container spacing={3}>
                            {filteredResources.map((video) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                                    <Card
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            borderRadius: "12px",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "none",
                                            transition: "transform 0.2s, box-shadow 0.2s",
                                            "&:hover": {
                                                transform: "translateY(-4px)",
                                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                                                cursor: "pointer"
                                            }
                                        }}
                                        onClick={() => setActiveVideo(video)}
                                    >
                                        <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                                            {video.thumbnailUrl ? (
                                                <CardMedia
                                                    component="img"
                                                    image={video.thumbnailUrl}
                                                    alt={video.title}
                                                    sx={{ height: "100%", width: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <VideoIcon className="text-slate-500" sx={{ fontSize: 48 }} />
                                            )}
                                            {/* Play Button Overlay */}
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                                                <div className="w-12 h-12 rounded-full bg-white/90 shadow flex items-center justify-center text-blue-600 hover:scale-105 transition-transform">
                                                    <span className="ml-1 text-lg">▶</span>
                                                </div>
                                            </div>
                                        </div>

                                        <CardContent className="flex-1 flex flex-col p-4">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                    {video.category}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-1.5">
                                                {video.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-3">
                                                {video.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <div className="space-y-4">
                            {filteredResources.map((video) => (
                                <Card
                                    key={video.id}
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        borderRadius: "12px",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "none",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                                            cursor: "pointer"
                                        }
                                    }}
                                    onClick={() => setActiveVideo(video)}
                                >
                                    <div className="relative w-full sm:w-[240px] aspect-video bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                                        {video.thumbnailUrl ? (
                                            <CardMedia
                                                component="img"
                                                image={video.thumbnailUrl}
                                                alt={video.title}
                                                sx={{ height: "100%", width: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <VideoIcon className="text-slate-500" sx={{ fontSize: 48 }} />
                                        )}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center text-blue-600 hover:scale-105 transition-transform">
                                                <span className="ml-1 text-sm">▶</span>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="flex-1 flex flex-col p-4 justify-center">
                                        <div className="mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                {video.category}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 mb-1.5">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                            {video.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </TabPanel>

            {/* SUPPORT TICKETS TAB PANEL */}
            <TabPanel value={tabValue} index={2}>
                <div className="space-y-6">
                    {/* Ticket Status Cards */}
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: "12px", bgcolor: "#f8fafc" }}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <TicketIcon fontSize="small" />
                                    </div>
                                    <div>
                                        <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                            Open Tickets
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-slate-800">
                                            {ticketStats.open}
                                        </Typography>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: "12px", bgcolor: "#f8fafc" }}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <TicketIcon fontSize="small" />
                                    </div>
                                    <div>
                                        <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                            Resolved Tickets
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-slate-800">
                                            {ticketStats.resolved}
                                        </Typography>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: "12px", bgcolor: "#f8fafc" }}>
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                        <TicketIcon fontSize="small" />
                                    </div>
                                    <div>
                                        <Typography variant="body2" className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                            Total Tickets
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-slate-800">
                                            {ticketStats.total}
                                        </Typography>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Filter and Create Button */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel id="filter-status-label" sx={{ fontSize: "12px" }}>Status</InputLabel>
                                <Select
                                    labelId="filter-status-label"
                                    value={ticketFilterStatus}
                                    label="Status"
                                    onChange={(e) => {
                                        setTicketFilterStatus(e.target.value);
                                    }}
                                    sx={{
                                        borderRadius: "8px",
                                        height: "36px",
                                        fontSize: "13px",
                                        bgcolor: "#ffffff"
                                    }}
                                >
                                    <MenuItem value="" sx={{ fontSize: "12px" }}>All Tickets</MenuItem>
                                    <MenuItem value="open" sx={{ fontSize: "12px" }}>Open</MenuItem>
                                    <MenuItem value="in_progress" sx={{ fontSize: "12px" }}>In Progress</MenuItem>
                                    <MenuItem value="resolved" sx={{ fontSize: "12px" }}>Resolved</MenuItem>
                                    <MenuItem value="closed" sx={{ fontSize: "12px" }}>Closed</MenuItem>
                                </Select>
                            </FormControl>
                            <IconButton
                                size="small"
                                onClick={fetchTickets}
                                sx={{ border: "1px solid #e2e8f0", borderRadius: "8px", p: 1 }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </div>

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setCreateOpen(true)}
                            sx={{
                                bgcolor: "var(--primary)",
                                "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                                textTransform: "none",
                                fontWeight: "bold",
                                px: 3,
                                height: "36px",
                                borderRadius: "8px"
                            }}
                        >
                            + Raise New Ticket
                        </Button>
                    </div>

                    {/* Tickets Table */}
                    {loadingTickets ? (
                        <div className="flex justify-center items-center py-12">
                            <CircularProgress />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                            <TicketIcon sx={{ fontSize: 48 }} className="text-slate-300 mb-2" />
                            <p className="text-slate-500 font-semibold">No tickets found. Raise a ticket if you need assistance!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <TableContainer sx={{ boxShadow: "none" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Ticket ID</span></TableCell>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Subject</span></TableCell>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Category</span></TableCell>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Priority</span></TableCell>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Status</span></TableCell>
                                            <TableCell sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Last Updated</span></TableCell>
                                            <TableCell align="center" sx={{ py: 2 }}><span className="text-[10px] uppercase font-bold text-slate-500">Actions</span></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tickets.map((ticket) => (
                                            <TableRow
                                                key={ticket.id}
                                                hover
                                                onClick={() => {
                                                    setActiveTicket(ticket);
                                                    setChatOpen(true);
                                                }}
                                                sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f1f5f9" } }}
                                            >
                                                <TableCell sx={{ py: 2, fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                                                    #{ticket.id.substring(0, 8)}
                                                </TableCell>
                                                <TableCell sx={{ py: 2, fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                                                    {ticket.subject}
                                                </TableCell>
                                                <TableCell sx={{ py: 2, fontSize: "13px", color: "#475569" }}>
                                                    {ticket.category}
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        ticket.priority === "urgent"
                                                            ? "bg-red-100 text-red-700 border-red-200"
                                                            : ticket.priority === "high"
                                                            ? "bg-orange-100 text-orange-700 border-orange-200"
                                                            : ticket.priority === "medium"
                                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}>
                                                        {ticket.priority.toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ py: 2 }}>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                        ticket.status === "open"
                                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                                            : ticket.status === "in_progress"
                                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                                            : ticket.status === "resolved"
                                                            ? "bg-green-100 text-green-700 border-green-200"
                                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}>
                                                        {ticket.status.replace("_", " ").toUpperCase()}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ py: 2, fontSize: "13px", color: "#64748b" }}>
                                                    {new Date(ticket.updatedAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 2 }} onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="text"
                                                        size="small"
                                                        onClick={() => {
                                                            setActiveTicket(ticket);
                                                            setChatOpen(true);
                                                        }}
                                                        sx={{ textTransform: "none", fontWeight: "bold" }}
                                                    >
                                                        Open Chat
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                </div>
            </TabPanel>

            {/* VIDEO PLAYER DIALOG */}
            <Dialog
                open={Boolean(activeVideo)}
                onClose={() => setActiveVideo(null)}
                maxWidth="md"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { borderRadius: "16px", overflow: "hidden", bgcolor: "#000" }
                    }
                }}
            >
                {activeVideo && (
                    <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                            <IconButton onClick={() => setActiveVideo(null)} sx={{ color: "#fff", bgcolor: "rgba(0,0,0,0.5)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <div className="aspect-video w-full">
                            <iframe
                                width="100%"
                                height="100%"
                                src={getEmbedUrl(activeVideo.videoUrl || "")}
                                title={activeVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            ></iframe>
                        </div>
                        <div className="bg-slate-900 p-5 text-white">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/50">
                                {activeVideo.category}
                            </span>
                            <h2 className="text-lg font-bold mt-2">{activeVideo.title}</h2>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{activeVideo.content}</p>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* RAISE NEW TICKET DIALOG */}
            <Dialog
                open={createOpen}
                onClose={() => !submittingTicket && setCreateOpen(false)}
                maxWidth="sm"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
            >
                <form onSubmit={handleCreateTicket}>
                    <DialogTitle className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-base font-bold text-slate-800">Raise a Support Ticket</span>
                        <IconButton size="small" onClick={() => setCreateOpen(false)} disabled={submittingTicket}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="space-y-4 pt-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Subject <span className="text-red-500">*</span></label>
                            <TextField
                                placeholder="Brief summary of your query"
                                required
                                fullWidth
                                size="small"
                                value={newTicket.subject}
                                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="space-y-1 flex-1">
                                <label className="text-xs font-semibold text-slate-600">Category</label>
                                <FormControl size="small" fullWidth>
                                    <Select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        sx={{ borderRadius: "8px" }}
                                    >
                                        <MenuItem value="Technical Support">Technical Support</MenuItem>
                                        <MenuItem value="Billing & Pricing">Billing & Pricing</MenuItem>
                                        <MenuItem value="Bug Report">Bug Report</MenuItem>
                                        <MenuItem value="Feature Request">Feature Request</MenuItem>
                                        <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div className="space-y-1 flex-1">
                                <label className="text-xs font-semibold text-slate-600">Priority</label>
                                <FormControl size="small" fullWidth>
                                    <Select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                        sx={{ borderRadius: "8px" }}
                                    >
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Detailed Description <span className="text-red-500">*</span></label>
                            <TextField
                                placeholder="Explain your issue or query in detail so we can help you faster..."
                                required
                                fullWidth
                                multiline
                                rows={5}
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                slotProps={{ input: { sx: { borderRadius: "8px" } } }}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions className="p-4 border-t border-slate-100">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setCreateOpen(false)}
                            disabled={submittingTicket}
                            sx={{ textTransform: "none", fontWeight: "bold", borderRadius: "8px" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            disabled={submittingTicket}
                            sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                bgcolor: "var(--primary)",
                                "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                                borderRadius: "8px"
                            }}
                        >
                            {submittingTicket ? <CircularProgress size={18} color="inherit" /> : "Submit Ticket"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* CHAT MESSAGES DRAWER (SLIDE OVER) */}
            <Drawer
                anchor="right"
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                slotProps={{
                    backdrop: { sx: { backdropFilter: "blur(1px)", bgcolor: "rgba(0,0,0,0.1)" } }
                }}
            >
                <div className="w-[480px] h-screen flex flex-col bg-white">
                    {/* Drawer Header */}
                    {activeTicket && (
                        <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">
                                        #{activeTicket.id.substring(0, 8)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                        activeTicket.status === "open"
                                            ? "bg-amber-100 text-amber-700 border-amber-200"
                                            : activeTicket.status === "in_progress"
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : activeTicket.status === "resolved"
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}>
                                        {activeTicket.status.replace("_", " ").toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Tooltip title="Refresh Chat">
                                        <IconButton size="small" onClick={() => fetchMessages(activeTicket.id)}>
                                            <RefreshIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" onClick={() => setChatOpen(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </div>
                            </div>
                            <h2 className="text-sm font-bold text-slate-800 leading-tight">
                                {activeTicket.subject}
                            </h2>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                <span>Category: <strong>{activeTicket.category}</strong></span>
                                {activeTicket.status !== "closed" && activeTicket.status !== "resolved" && (
                                    <Button
                                        variant="text"
                                        size="small"
                                        color="error"
                                        onClick={() => handleCloseTicket(activeTicket.id)}
                                        sx={{ textTransform: "none", py: 0, height: "20px", fontSize: "10px", fontWeight: "bold" }}
                                    >
                                        Close Ticket
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {/* Initial Description Card */}
                        {activeTicket && (
                            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed mb-4">
                                <div className="font-bold text-[10px] uppercase text-slate-400 tracking-wider mb-1">
                                    Ticket Description
                                </div>
                                {activeTicket.description}
                                <div className="text-[9px] text-slate-400 mt-2 text-right">
                                    Opened on {new Date(activeTicket.createdAt).toLocaleString()}
                                </div>
                            </div>
                        )}

                        {loadingMessages ? (
                            <div className="flex justify-center items-center py-8">
                                <CircularProgress size={24} />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs">
                                No messages yet. Write a message below to start chatting with support.
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderRole === "admin" || msg.senderRole === "sub_admin";
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <span className="text-[10px] font-bold text-slate-500">
                                                {msg.senderName}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                                                isMe
                                                    ? "bg-[#408dfb] text-white rounded-tr-none"
                                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                            }`}
                                        >
                                            <div className="whitespace-pre-wrap leading-relaxed">
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Footer Reply Box */}
                    {activeTicket && (
                        <div className="p-3 border-t border-slate-100 bg-white">
                            {activeTicket.status === "closed" ? (
                                <div className="text-center py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg">
                                    This ticket is closed. You can reply to re-open it.
                                </div>
                            ) : null}

                            <form onSubmit={handleSendReply} className="flex gap-2 items-end mt-1">
                                <TextField
                                    placeholder="Type your message..."
                                    variant="outlined"
                                    size="small"
                                    multiline
                                    maxRows={4}
                                    fullWidth
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendReply(e);
                                        }
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "20px",
                                            fontSize: "13px",
                                            py: 1,
                                            px: 2,
                                        }
                                    }}
                                />
                                <IconButton
                                    type="submit"
                                    disabled={!replyText.trim() || sendingReply}
                                    sx={{
                                        bgcolor: "#408dfb",
                                        color: "#fff",
                                        "&:hover": { bgcolor: "#357bd9" },
                                        "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#94a3b8" },
                                        width: "36px",
                                        height: "36px",
                                    }}
                                >
                                    <SendIcon fontSize="small" />
                                </IconButton>
                            </form>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
