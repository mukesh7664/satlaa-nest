"use client";

import React, { useEffect, useState } from "react";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { Button, IconButton, Switch, Checkbox, FormControlLabel, CircularProgress, TextField } from "@mui/material";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  emailSettingsService,
  EmailTemplate,
} from "@/services/emailSettings.service";
import { Send as SendIcon, Close as CloseIcon } from "@mui/icons-material";

const TestEmailDialog = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading: boolean;
}) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            Send Test Email
          </h3>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Enter an email address to send a test email to. Variables like{" "}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
              {"{{firstName}}"}
            </code>{" "}
            will be replaced with dummy data.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. your@email.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all text-sm"
            />
          </div>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(email)}
            disabled={!email || loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
            sx={{ textTransform: "none" }}
          >
            Send Test
          </Button>
        </div>
      </div>
    </div>
  );
};

// Simple HTML formatter that adds proper indentation
function formatHtml(html: string): string {
  if (!html) return html;
  let result = '';
  let indent = 0;
  const lines = html
    .replace(/></g, '>\n<')           // break between tags
    .replace(/(>)([^<\n])/g, '$1\n$2') // break after > before text
    .replace(/([^>\n])(<)/g, '$1\n$2') // break before < after text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    const isClosing = /^<\/[^>]+>/.test(line);
    const isSelfClosing = /\/>$/.test(line) || /^<(br|hr|img|input|meta|link)[^>]*>$/i.test(line);
    const isOpening = /^<[^/!][^>]*[^/]>$/.test(line) && !isSelfClosing;
    const isDoctype = /^<!/.test(line);

    if (isClosing && !isDoctype) indent = Math.max(0, indent - 1);
    result += '  '.repeat(indent) + line + '\n';
    if (isOpening && !isDoctype) indent++;
  }

  return result.trim();
}

const EditEmailTemplatePage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate(id);
    }
  }, [id]);

  const fetchTemplate = async (templateId: string) => {
    try {
      const data = await emailSettingsService.getTemplate(templateId);
      // Auto-format HTML on initial load
      if (data?.body) {
        data.body = formatHtml(data.body);
        data.htmlContent = data.body;
      }
      setTemplate(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch email template");
      router.push("/settings/email-config/template");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplate((prev) =>
      prev ? { ...prev, isActive: e.target.checked } : null
    );
  };

  const handleBodyChange = (data: string) => {
    setTemplate((prev) => (prev ? { ...prev, body: data, htmlContent: data } : null));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setSaving(true);
    try {
      await emailSettingsService.updateTemplate(id, {
        subject: template.subject,
        htmlContent: template.body,
        isActive: template.isActive,
      });
      toast.success("Email template updated successfully");
      router.push("/settings/email-config/template");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update email template");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (email: string) => {
    setTestLoading(true);
    try {
      await emailSettingsService.sendTestTemplateEmail(id, email);
      toast.success(`Test email sent to ${email}`);
      setShowTestDialog(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <CircularProgress />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-slate-500 font-medium">Template not found</p>
        <Link
          href="/settings/email-config/template"
          className="text-[#408dfb] hover:text-indigo-700 font-medium"
        >
          Go back to templates
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={() => router.push("/settings/email-config/template")}
            sx={{ color: "text.secondary" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Edit Template: {template.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Customize the email content and settings
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Subject
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="subject"
                    value={template.subject}
                    onChange={handleChange}
                    required
                    sx={{ bgcolor: "white" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Email Body (HTML)
                    </label>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://www.w3schools.com/html/tryit.asp?filename=tryhtml_basic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#408dfb] hover:underline"
                      >
                        Test HTML in W3Schools
                      </a>
                      <Button
                        type="button"
                        onClick={() => {
                          if (template) {
                            const formatted = formatHtml(template.body);
                            setTemplate(prev => prev ? { ...prev, body: formatted, htmlContent: formatted } : null);
                            toast.success('HTML formatted');
                          }
                        }}
                        variant="text"
                        size="small"
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        Format HTML
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        variant="text"
                        size="small"
                        sx={{ textTransform: "none", fontSize: "0.75rem" }}
                      >
                        {showPreview ? "Switch to Editor" : "Switch to Preview"}
                      </Button>
                    </div>
                  </div>

                  {showPreview ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden min-h-[600px] bg-white">
                      <iframe
                        srcDoc={template.body}
                        title="Email Preview"
                        className="w-full h-[600px] w-full"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <textarea
                        value={template.body}
                        onChange={(e) => handleBodyChange(e.target.value)}
                        placeholder="Enter raw HTML content..."
                        className="w-full h-[400px] p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y"
                      />
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Write raw HTML code or paste it from an external editor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Status
              </h3>
              <div className="flex items-center gap-3">
                <Switch
                  checked={template.isActive}
                  onChange={handleSwitchChange}
                  color="primary"
                />
                <span className="text-sm font-medium text-slate-700">
                  {template.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Variables Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Available Variables
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Click to copy variables to clipboard.
              </p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <button
                    type="button"
                    key={variable}
                    onClick={() => {
                      navigator.clipboard.writeText(`{{${variable}}}`);
                      toast.success(`Copied {{${variable}}} to clipboard`);
                    }}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-xs font-mono hover:bg-indigo-100 transition-colors"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={saving}
                variant="contained"
                fullWidth
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon fontSize="small" />}
                className="py-3"
                sx={{ textTransform: "none" }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                onClick={() => setShowTestDialog(true)}
                variant="outlined"
                fullWidth
                startIcon={<SendIcon fontSize="small" />}
                className="py-3"
                sx={{ textTransform: "none", borderColor: "slate.200", color: "text.primary" }}
              >
                Send Test Email
              </Button>
            </div>
          </div>
        </form>

        <TestEmailDialog
          isOpen={showTestDialog}
          onClose={() => setShowTestDialog(false)}
          onSubmit={handleTestEmail}
          loading={testLoading}
        />
      </div>
    </div>
  );
};

export default EditEmailTemplatePage;
