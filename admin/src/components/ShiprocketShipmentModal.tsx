"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  LocalShipping as ShipIcon,
} from "@mui/icons-material";
import { toast } from "sonner";

export function AddShiprocketPickupModal({ open, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    address_2: "",
    city: "",
    state: "",
    country: "India",
    pin_code: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.pickup_location || !formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pin_code) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/admin/shiprocket/add-pickup-location`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Pickup location added successfully!");
        onSuccess(formData.pickup_location);
      } else {
        throw new Error(data.message || "Failed to add pickup location");
      }
    } catch (err: any) {
      console.error("Error adding pickup location:", err);
      toast.error(err.message || "Failed to add pickup location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Pickup Location</DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <TextField
            label="Location Nickname (e.g. Warehouse 1)"
            name="pickup_location"
            fullWidth
            required
            value={formData.pickup_location}
            onChange={handleChange}
            className="col-span-2"
          />
          <TextField
            label="Contact Person Name"
            name="name"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            label="Contact Email"
            name="email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Contact Phone"
            name="phone"
            fullWidth
            required
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            label="Pincode"
            name="pin_code"
            fullWidth
            required
            value={formData.pin_code}
            onChange={handleChange}
          />
          <TextField
            label="Address Line 1"
            name="address"
            fullWidth
            required
            value={formData.address}
            onChange={handleChange}
            className="col-span-2"
          />
          <TextField
            label="Address Line 2 (Optional)"
            name="address_2"
            fullWidth
            value={formData.address_2}
            onChange={handleChange}
            className="col-span-2"
          />
          <TextField
            label="City"
            name="city"
            fullWidth
            required
            value={formData.city}
            onChange={handleChange}
          />
          <TextField
            label="State"
            name="state"
            fullWidth
            required
            value={formData.state}
            onChange={handleChange}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          Add Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ShiprocketShipmentModal({ open, onClose, onSubmit, order, loading }: any) {
  const [formData, setFormData] = useState({
    weight: 0.5,
    length: 10,
    breadth: 10,
    height: 10,
    pickupLocation: "",
    paymentMode: "Prepaid",
  });
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [addPickupOpen, setAddPickupOpen] = useState(false);

  useEffect(() => {
    if (open && order) {
      fetchModalData();
    }
  }, [open, order]);

  const fetchModalData = async () => {
    try {
      setFetchingData(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5003/api/v1";
      const token = localStorage.getItem("token");

      // 1. Fetch Suggestions
      const sugRes = await fetch(`${apiUrl}/admin/shiprocket/suggestions/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sugData = await sugRes.json();

      // 2. Fetch Pickup Locations
      const locRes = await fetch(`${apiUrl}/admin/shiprocket/pickup-locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const locData = await locRes.json();

      setFormData({
        weight: sugData.weight || 0.5,
        length: sugData.dimensions?.length || 10,
        breadth: sugData.dimensions?.breadth || 10,
        height: sugData.dimensions?.height || 10,
        paymentMode: sugData.paymentMode || "Prepaid",
        pickupLocation: locData.data?.shipping_address?.[0]?.pickup_location || "Primary",
      });

      setPickupLocations(locData.data?.shipping_address || []);
    } catch (err) {
      console.error("Error fetching Shiprocket info:", err);
      toast.error("Failed to fetch Shiprocket data");
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(order.id, formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Shiprocket Shipment</DialogTitle>
      <DialogContent dividers>
        {fetchingData ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <div className="space-y-4 pt-2">
            <Typography variant="subtitle2" color="slate.500">
              Order: {order?.orderNumber}
            </Typography>

            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Weight (kg)"
                fullWidth
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth>
                <InputLabel shrink>Payment Mode</InputLabel>
                <Select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  label="Payment Mode"
                >
                  <MenuItem value="Prepaid">Prepaid</MenuItem>
                  <MenuItem value="COD">COD</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <TextField
                label="Length (cm)"
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Breadth (cm)"
                type="number"
                value={formData.breadth}
                onChange={(e) => setFormData({ ...formData, breadth: parseFloat(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Height (cm)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </div>

            <div className="flex items-end gap-2">
              <FormControl fullWidth>
                <InputLabel shrink>Pickup Location</InputLabel>
                <Select
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  label="Pickup Location"
                >
                  {pickupLocations.length > 0 ? (
                    pickupLocations.map((loc: any) => (
                      <MenuItem key={loc.pickup_location} value={loc.pickup_location}>
                        {loc.pickup_location} ({loc.city})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="Primary">Primary</MenuItem>
                  )}
                </Select>
              </FormControl>
              <Tooltip title="Add New Pickup Location">
                <IconButton 
                  onClick={() => setAddPickupOpen(true)}
                  sx={{ 
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    borderRadius: '8px',
                    height: '40px',
                    width: '40px',
                    '&:hover': { bgcolor: 'primary.100' }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </div>

            <AddShiprocketPickupModal 
              open={addPickupOpen}
              onClose={() => setAddPickupOpen(false)}
              onSuccess={(newLoc: string) => {
                setAddPickupOpen(false);
                fetchModalData().then(() => {
                  setFormData(prev => ({ ...prev, pickupLocation: newLoc }));
                });
              }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || fetchingData}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ShipIcon />}
        >
          {loading ? "Creating..." : "Create Shipment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
