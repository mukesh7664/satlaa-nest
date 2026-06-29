"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, IconButton, CircularProgress } from "@mui/material";
import {
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  AccessTime as TimeIcon,
  Label as LabelIcon,
} from "@mui/icons-material";
import { inquiriesApi, Inquiry } from "@/services/inquiries.api";
import { toast } from "sonner";

export default function InquiryDetailsPage() {
  const { inquiryid } = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = React.useState<Inquiry | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setLoading(true);
        const response = await inquiriesApi.getInquiryById(inquiryid as string);
        setInquiry(response.inquiry);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch inquiry");
      } finally {
        setLoading(false);
      }
    };

    if (inquiryid) {
      fetchInquiry();
    }
  }, [inquiryid]);

  const handleMarkAsReplied = async () => {
    if (!inquiry) return;
    try {
      await inquiriesApi.updateInquiryStatus(inquiry.id, "replied");
      setInquiry({ ...inquiry, status: "replied" });
      toast.success("Inquiry marked as replied");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!inquiry) return;
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await inquiriesApi.deleteInquiry(inquiry.id);
      toast.success("Inquiry deleted successfully");
      router.push("/inquiries");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete inquiry");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <CircularProgress size={32} className="text-slate-400" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-slate-500">Inquiry not found</p>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/inquiries")}
        >
          Back to Inquiries
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => router.push("/inquiries")} size="small">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Inquiry Details
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wide ${
                  inquiry.status === "pending"
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : inquiry.status === "replied"
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : inquiry.status === "converted"
                    ? "bg-green-50 text-green-600 border-green-100"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {inquiry.status}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TimeIcon fontSize="inherit" />
              {new Date(inquiry.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {inquiry.status === "pending" && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleMarkAsReplied}
              size="small"
              sx={{
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
                textTransform: "none",
              }}
            >
              Mark Replied
            </Button>
          )}
          <IconButton
            onClick={handleDelete}
            size="small"
            sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fef2f2" } }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {inquiry.subject || 'No Subject'}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                  <LabelIcon fontSize="inherit" />
                  {inquiry.type.replace("_", " ").toUpperCase()}
                </span>
                {inquiry.storeId && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100">
                    Store Inquiry
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                {inquiry.message}
              </p>
            </div>
          </div>

          {/* Metadata Section */}
          {inquiry.metadata && Object.keys(inquiry.metadata).length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-700">
                  Additional Information (Metadata)
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(inquiry.metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mb-0.5">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-[13px] text-slate-700 font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-700">
                Contact Information
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">
                  Name
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {inquiry.name}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <EmailIcon fontSize="small" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">
                    Email
                  </p>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {inquiry.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <PhoneIcon fontSize="small" className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">
                    Phone
                  </p>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="text-sm text-slate-700 hover:text-blue-600"
                  >
                    {inquiry.phone || 'N/A'}
                  </a>
                </div>
              </div>

              {inquiry.metadata?.companyName && (
                <div className="flex items-start gap-3">
                  <BusinessIcon
                    fontSize="small"
                    className="text-slate-400 mt-0.5"
                  />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">
                      Company
                    </p>
                    <p className="text-sm text-slate-700">
                      {inquiry.metadata.companyName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
