"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    Button,
    IconButton,
    Box,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Chip,
    Divider,
    Avatar,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Send as SendIcon,
    SupportAgent as AgentIcon,
    ConfirmationNumber as TicketIcon,
    AccessTime as TimeIcon,
    Storefront as StoreIcon,
    Person as PersonIcon,
} from "@mui/icons-material";
import { toast } from "sonner";
import { supportApi, SupportTicket, TicketMessage } from "@/services/support.api";

export default function SuperAdminSupportTicketsPage() {
    // Tickets State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Filters State
    const [filters, setFilters] = useState({
        status: "",
        priority: "",
        search: "",
    });

    // Chat / Messages State
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch tickets on mount & filters change
    useEffect(() => {
        fetchTickets();
    }, [filters.status, filters.priority]);

    // Ticket Selection -> Fetch messages & setup polling
    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id, true);
            // Polling every 15 seconds
            pollingRef.current = setInterval(() => {
                fetchMessages(selectedTicket.id, false);
            }, 15000);
        } else {
            setMessages([]);
            if (pollingRef.current) clearInterval(pollingRef.current);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [selectedTicket]);

    // Scroll chat to bottom when messages update
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const fetchTickets = async () => {
        try {
            setLoadingTickets(true);
            const data = await supportApi.getAdminTickets({
                status: filters.status || undefined,
                priority: filters.priority || undefined,
                search: filters.search || undefined,
            });
            setTickets(data);

            // Keep selected ticket object in sync if it's currently selected
            if (selectedTicket) {
                const updated = data.find((t) => t.id === selectedTicket.id);
                if (updated) setSelectedTicket(updated);
            }
        } catch (error) {
            console.error("Error fetching admin tickets:", error);
            toast.error("Failed to load support tickets");
        } finally {
            setLoadingTickets(false);
        }
    };

    const fetchMessages = async (ticketId: string, showLoader = true) => {
        try {
            if (showLoader) setLoadingMessages(true);
            const data = await supportApi.getAdminTicketMessages(ticketId);
            setMessages(data);
        } catch (error) {
            console.error("Error fetching ticket messages:", error);
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedTicket) return;

        try {
            setSendingReply(true);
            const msg = await supportApi.sendAdminTicketMessage(selectedTicket.id, replyText);
            setMessages((prev) => [...prev, msg]);
            setReplyText("");
            // Refresh tickets to update last message time
            fetchTickets();
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error("Failed to send message.");
        } finally {
            setSendingReply(false);
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedTicket) return;
        try {
            const updated = await supportApi.updateTicketStatus(selectedTicket.id, status);
            setSelectedTicket(updated);
            toast.success(`Ticket status updated to ${status.replace("_", " ")}`);
            fetchTickets();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status.");
        }
    };

    const handleUpdatePriority = async (priority: string) => {
        if (!selectedTicket) return;
        try {
            const updated = await supportApi.updateTicketPriority(selectedTicket.id, priority);
            setSelectedTicket(updated);
            toast.success(`Ticket priority updated to ${priority}`);
            fetchTickets();
        } catch (error) {
            console.error("Error updating priority:", error);
            toast.error("Failed to update priority.");
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col font-sans">
            {/* Header & Global Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Support Tickets Inbox</h1>
                    <p className="text-xs text-slate-500">Manage and reply to merchant support tickets globally.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchTickets();
                        }}
                    >
                        <TextField
                            placeholder="Search ticket / store..."
                            size="small"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            sx={{
                                width: 220,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    height: "36px",
                                    fontSize: "12px",
                                }
                            }}
                            InputProps={{
                                startAdornment: <SearchIcon className="text-slate-400 mr-1.5" fontSize="small" />
                            }}
                        />
                    </form>

                    {/* Status Filter */}
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel id="status-filter-label" sx={{ fontSize: "12px", mt: -0.5 }}>Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            value={filters.status}
                            label="Status"
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            sx={{
                                borderRadius: "8px",
                                height: "36px",
                                fontSize: "12px"
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: "12px" }}>All Statuses</MenuItem>
                            <MenuItem value="open" sx={{ fontSize: "12px" }}>Open</MenuItem>
                            <MenuItem value="in_progress" sx={{ fontSize: "12px" }}>In Progress</MenuItem>
                            <MenuItem value="resolved" sx={{ fontSize: "12px" }}>Resolved</MenuItem>
                            <MenuItem value="closed" sx={{ fontSize: "12px" }}>Closed</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Priority Filter */}
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel id="priority-filter-label" sx={{ fontSize: "12px", mt: -0.5 }}>Priority</InputLabel>
                        <Select
                            labelId="priority-filter-label"
                            value={filters.priority}
                            label="Priority"
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            sx={{
                                borderRadius: "8px",
                                height: "36px",
                                fontSize: "12px"
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: "12px" }}>All Priorities</MenuItem>
                            <MenuItem value="low" sx={{ fontSize: "12px" }}>Low</MenuItem>
                            <MenuItem value="medium" sx={{ fontSize: "12px" }}>Medium</MenuItem>
                            <MenuItem value="high" sx={{ fontSize: "12px" }}>High</MenuItem>
                            <MenuItem value="urgent" sx={{ fontSize: "12px" }}>Urgent</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Refresh */}
                    <IconButton
                        size="small"
                        onClick={fetchTickets}
                        sx={{ border: "1px solid #e2e8f0", borderRadius: "8px", p: 1 }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>

            {/* Split Screen Panel */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Left Queue Panel */}
                <div className="w-[380px] bg-white border border-gray-100 rounded-xl flex flex-col overflow-hidden shrink-0">
                    <div className="p-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Queue ({tickets.length})
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {loadingTickets && tickets.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <CircularProgress size={24} />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <TicketIcon sx={{ fontSize: 36, mb: 1 }} />
                                <p className="text-xs font-semibold">No tickets found</p>
                            </div>
                        ) : (
                            tickets.map((ticket) => {
                                const isSelected = selectedTicket?.id === ticket.id;
                                return (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-all ${
                                            isSelected ? "bg-blue-50/50 border-l-4 border-blue-600" : ""
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-slate-400">
                                                #{ticket.id.substring(0, 8)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(ticket.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                                            {ticket.subject}
                                        </h3>

                                        <div className="flex items-center gap-1 mb-2">
                                            <StoreIcon sx={{ fontSize: 12 }} className="text-slate-400" />
                                            <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[150px]">
                                                {ticket.storeName || "Unknown Store"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {ticket.category}
                                            </span>

                                            <div className="flex gap-1">
                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                                    ticket.priority === "urgent"
                                                        ? "bg-red-100 text-red-700"
                                                        : ticket.priority === "high"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : ticket.priority === "medium"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                                    ticket.status === "open"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : ticket.status === "in_progress"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : ticket.status === "resolved"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-slate-100 text-slate-700"
                                                }`}>
                                                    {ticket.status.replace("_", " ").toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Chat Panel */}
                <div className="flex-1 bg-white border border-gray-100 rounded-xl flex flex-col overflow-hidden">
                    {selectedTicket ? (
                        <>
                            {/* Selected Ticket Header info */}
                            <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-start flex-wrap gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                            #{selectedTicket.id}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            Raised on {new Date(selectedTicket.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-800">{selectedTicket.subject}</h2>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <PersonIcon sx={{ fontSize: 14 }} />
                                            <span>
                                                {selectedTicket.creatorName || "Merchant"} ({selectedTicket.creatorEmail})
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <StoreIcon sx={{ fontSize: 14 }} />
                                            <span>
                                                Store: {selectedTicket.storeName} ({selectedTicket.store?.slug || "N/A"})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Controls for Status/Priority */}
                                <div className="flex items-center gap-2">
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel id="update-status-label" sx={{ fontSize: "11px", mt: -0.5 }}>Update Status</InputLabel>
                                        <Select
                                            labelId="update-status-label"
                                            value={selectedTicket.status}
                                            label="Update Status"
                                            onChange={(e) => handleUpdateStatus(e.target.value)}
                                            sx={{ height: "32px", fontSize: "11px", borderRadius: "6px" }}
                                        >
                                            <MenuItem value="open" sx={{ fontSize: "11px" }}>Open</MenuItem>
                                            <MenuItem value="in_progress" sx={{ fontSize: "11px" }}>In Progress</MenuItem>
                                            <MenuItem value="resolved" sx={{ fontSize: "11px" }}>Resolved</MenuItem>
                                            <MenuItem value="closed" sx={{ fontSize: "11px" }}>Closed</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel id="update-priority-label" sx={{ fontSize: "11px", mt: -0.5 }}>Update Priority</InputLabel>
                                        <Select
                                            labelId="update-priority-label"
                                            value={selectedTicket.priority}
                                            label="Update Priority"
                                            onChange={(e) => handleUpdatePriority(e.target.value)}
                                            sx={{ height: "32px", fontSize: "11px", borderRadius: "6px" }}
                                        >
                                            <MenuItem value="low" sx={{ fontSize: "11px" }}>Low</MenuItem>
                                            <MenuItem value="medium" sx={{ fontSize: "11px" }}>Medium</MenuItem>
                                            <MenuItem value="high" sx={{ fontSize: "11px" }}>High</MenuItem>
                                            <MenuItem value="urgent" sx={{ fontSize: "11px" }}>Urgent</MenuItem>
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>

                            {/* Chat Thread Messages Box */}
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/20 space-y-4">
                                {/* Ticket initial description card */}
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm max-w-3xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }} className="bg-blue-600">
                                            {selectedTicket.creatorName?.charAt(0) || "M"}
                                        </Avatar>
                                        <span className="text-xs font-bold text-slate-800">
                                            {selectedTicket.creatorName || "Merchant"}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            (Initial Ticket Details)
                                        </span>
                                    </div>
                                    <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                                        {selectedTicket.description}
                                    </p>
                                </div>

                                <Divider>
                                    <Chip label="Discussion Thread" size="small" sx={{ fontSize: "10px" }} />
                                </Divider>

                                {loadingMessages && messages.length === 0 ? (
                                    <div className="flex justify-center py-6">
                                        <CircularProgress size={20} />
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isSA = msg.senderRole === "super_admin";
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isSA ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-xl rounded-2xl p-3.5 ${
                                                        isSA
                                                            ? "bg-blue-600 text-white rounded-tr-none"
                                                            : "bg-white border border-gray-100 text-slate-800 rounded-tl-none shadow-sm"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={`text-[10px] font-bold ${isSA ? "text-blue-100" : "text-slate-800"}`}>
                                                            {msg.senderName || (isSA ? "Super Admin Support" : "Merchant")}
                                                        </span>
                                                        <span className={`text-[8px] uppercase px-1 rounded ${
                                                            isSA ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                                                        }`}>
                                                            {isSA ? "Support" : "Merchant"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs leading-relaxed whitespace-pre-line">
                                                        {msg.message}
                                                    </p>
                                                    <div className={`text-[8px] text-right mt-1.5 ${isSA ? "text-blue-200" : "text-slate-400"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Reply Input Form */}
                            <div className="p-3 bg-white border-t border-gray-100">
                                {selectedTicket.status === "closed" ? (
                                    <div className="bg-slate-100 p-2.5 rounded-lg text-center text-xs text-slate-500">
                                        This ticket is closed. Change the status back to "Open" or "In Progress" to send a message.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendReply} className="flex gap-2">
                                        <TextField
                                            placeholder="Type your reply to the merchant..."
                                            size="small"
                                            fullWidth
                                            multiline
                                            maxRows={4}
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
                                                    borderRadius: "8px",
                                                    fontSize: "12px",
                                                }
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!replyText.trim() || sendingReply}
                                            sx={{
                                                bgcolor: "var(--primary)",
                                                "&:hover": { bgcolor: "var(--primary)", filter: "brightness(0.9)" },
                                                borderRadius: "8px",
                                                minWidth: "40px",
                                                px: 2,
                                            }}
                                        >
                                            {sendingReply ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-slate-400 p-6">
                            <AgentIcon sx={{ fontSize: 56, color: "slate.300", mb: 2 }} />
                            <p className="text-sm font-semibold">Select a support ticket from the queue to start conversation.</p>
                            <p className="text-xs text-slate-400 mt-1">Status updates and messages will synchronize in real-time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
