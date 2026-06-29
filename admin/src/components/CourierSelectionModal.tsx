"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Chip,
} from "@mui/material";
import { LocalShipping as ShipIcon, Star as StarIcon } from "@mui/icons-material";

interface Courier {
  courier_company_id: number;
  courier_name: string;
  rating: number;
  etd: string;
  freight_charge: number;
  cod_charges?: number;
  total_charge: number;
}

interface CourierSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (courierId: number) => void;
  couriers: Courier[];
  loading: boolean;
  submitting: boolean;
}

export default function CourierSelectionModal({
  open,
  onClose,
  onSelect,
  couriers,
  loading,
  submitting,
}: CourierSelectionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ShipIcon color="primary" />
        <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
          Select Shipping Partner
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="slate.500">Fetching available couriers from Shiprocket...</Typography>
          </Box>
        ) : couriers.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
            <Typography variant="body1" color="slate.700">No shipping partners available for this location.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "slate.50" }}>Courier Partner</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "slate.50" }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "slate.50" }}>ETD</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "slate.50" }}>Rate</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, bgcolor: "slate.50" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {couriers.map((courier) => (
                  <TableRow key={courier.courier_company_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "slate.900" }}>
                        {courier.courier_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Rating
                          value={Number(courier.rating)}
                          readOnly
                          precision={0.5}
                          size="small"
                          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Typography variant="caption" sx={{ color: "slate.500", fontWeight: 500 }}>
                          {courier.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={courier.etd || "N/A"} 
                        size="small" 
                        variant="outlined" 
                        sx={{ 
                          fontSize: "0.75rem", 
                          fontWeight: 500,
                          bgcolor: "blue.50",
                          color: "blue.700",
                          borderColor: "blue.100"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "green.600" }}>
                        ₹{courier.freight_charge}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onSelect(courier.courier_company_id)}
                        disabled={submitting}
                        sx={{ 
                          textTransform: "none", 
                          borderRadius: "8px",
                          px: 3,
                          boxShadow: "none",
                          "&:hover": { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
                        }}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3, bgcolor: "slate.50" }}>
        <Button 
          onClick={onClose} 
          disabled={submitting} 
          sx={{ textTransform: "none", color: "slate.500" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
