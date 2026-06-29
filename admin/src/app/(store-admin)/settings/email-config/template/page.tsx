"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Refresh, CheckCircle, Cancel } from "@mui/icons-material";
import { toast } from "sonner";
import Link from "next/link";
import {
  emailSettingsService,
  EmailTemplate,
} from "@/services/emailSettings.service";

const EmailTemplatesPage = () => {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await emailSettingsService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to fetch email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setInitializing(true);
    try {
      await emailSettingsService.initializeTemplates();
      toast.success("Templates initialized successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to initialize templates");
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="start"
        mb={{ xs: 2, '2xl': 4 }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">Email Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and edit email templates sent by your system.</p>
        </div>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh sx={{ fontSize: { xs: 16, '2xl': 20 } }} />}
            onClick={fetchTemplates}
            sx={{ mr: 2, textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: { xs: 12, '2xl': 14 } }}
          >
            Refresh
          </Button>
          {templates.length === 0 && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleInitialize}
              disabled={initializing}
              sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 700, fontSize: { xs: 12, '2xl': 14 } }}
            >
              {initializing
                ? "Initializing..."
                : "Initialize Default Templates"}
            </Button>
          )}
        </Box>
      </Box>

      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="email templates table">
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: 11, '2xl': 13 }, px: { xs: 1.5, '2xl': 3 }, py: { xs: 1, '2xl': 2 } }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: 11, '2xl': 13 }, px: { xs: 1.5, '2xl': 3 }, py: { xs: 1, '2xl': 2 } }}>Key</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: 11, '2xl': 13 }, px: { xs: 1.5, '2xl': 3 }, py: { xs: 1, '2xl': 2 } }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: 11, '2xl': 13 }, px: { xs: 1.5, '2xl': 3 }, py: { xs: 1, '2xl': 2 } }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: { xs: 11, '2xl': 13 }, px: { xs: 1.5, '2xl': 3 }, py: { xs: 1, '2xl': 2 } }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <TableRow
                      key={template.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { bgcolor: "grey.50" },
                      }}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        sx={{ fontWeight: 500 }}
                      >
                        {template.name}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={template.key}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: "monospace" }}
                        />
                      </TableCell>
                      <TableCell>{template.subject}</TableCell>
                      <TableCell>
                        {template.isActive ? (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: 16 }} />}
                            label="Active"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel sx={{ fontSize: 16 }} />}
                            label="Inactive"
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Link
                          href={`/settings/email-config/template/${template.id}`}
                          passHref
                        >
                          <Tooltip title="Edit Template">
                            <IconButton color="primary" size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body1" color="textSecondary">
                        No templates found. Click "Initialize Default Templates"
                        to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplatesPage;
