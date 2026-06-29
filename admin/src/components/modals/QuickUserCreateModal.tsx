import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  CircularProgress,
  IconButton,
  Switch,
} from "@mui/material";
import {
  Close as CloseIcon,
  PersonOutline as PersonIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  LockOutlined as LockIcon,
  LocalShippingOutlined as ShippingIcon,
  ReceiptOutlined as BillingIcon,
  CheckCircleOutline as CheckIcon,
} from "@mui/icons-material";
import axios from "axios";

interface QuickUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

/* ── Tiny reusable label+input pair ────────────────────────────────── */
function FormField({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 tracking-wide">
        {icon && (
          <span className="text-slate-400 [&_svg]:text-[16px]">{icon}</span>
        )}
        {label}
        {required && <span className="text-red-400 text-xs ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ── Styled input ──────────────────────────────────────────────────── */
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 focus:border-[#7B3FF2] focus:shadow-[0_0_0_3px_rgba(123,63,242,0.12)]";

/* ── Section wrapper ────────────────────────────────────────────────── */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
      <span className="text-[var(--select-color,#7B3FF2)] [&_svg]:text-[18px]">
        {icon}
      </span>
      <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
        {title}
      </span>
    </div>
  );
}

export default function QuickUserCreateModal({
  open,
  onClose,
  onSuccess,
}: QuickUserCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [addShippingAddress, setAddShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const [addBillingAddress, setAddBillingAddress] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  const handleSubmit = async () => {
    if (!name || !email) {
      setError("Name and Email are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password || undefined,
      };

      if (addShippingAddress) {
        payload.shippingAddress = {
          street: shippingAddress.addressLine1.trim(),
          addressLine1: shippingAddress.addressLine1.trim(),
          addressLine2: shippingAddress.addressLine2.trim() || undefined,
          city: shippingAddress.city.trim() || undefined,
          state: shippingAddress.state.trim() || undefined,
          country: shippingAddress.country.trim() || undefined,
          pincode: shippingAddress.pincode.trim() || undefined,
          phone: phone.trim() || undefined,
        };
      }

      if (addBillingAddress) {
        if (billingSameAsShipping && addShippingAddress) {
          payload.billingAddress = {
            ...payload.shippingAddress,
          };
        } else {
          payload.billingAddress = {
            street: billingAddress.addressLine1.trim(),
            addressLine1: billingAddress.addressLine1.trim(),
            addressLine2: billingAddress.addressLine2.trim() || undefined,
            city: billingAddress.city.trim() || undefined,
            state: billingAddress.state.trim() || undefined,
            country: billingAddress.country.trim() || undefined,
            pincode: billingAddress.pincode.trim() || undefined,
            phone: phone.trim() || undefined,
          };
        }
      }

      const response = await axios.post(`${API_URL}/admin/customers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSuccess(response.data.data);
      onClose();
      resetForm();
    } catch (err: any) {
      console.error("Error creating customer:", err);
      setError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setAddShippingAddress(false);
    setShippingAddress({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    });
    setAddBillingAddress(false);
    setBillingSameAsShipping(true);
    setBillingAddress({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    });
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow:
            "0 25px 50px -12px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(0 0 0 / 0.03)",
          width: "100%",
          maxWidth: "580px",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--select-color,#7B3FF2)]/10 flex items-center justify-center">
            <PersonIcon
              sx={{ fontSize: 18, color: "var(--select-color, #7B3FF2)" }}
            />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800 leading-tight">
              New Customer
            </h2>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Fill in the details below
            </p>
          </div>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#94a3b8",
            "&:hover": { color: "#475569", bgcolor: "#f1f5f9" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <DialogContent sx={{ p: 0, bgcolor: "#f8fafc", maxHeight: "75vh", overflowY: "auto" }}>
        {error && (
          <div className="mx-5 mt-4 mb-1 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[13px] flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-[11px] font-bold flex-shrink-0">
              !
            </span>
            {error}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* ── Personal Info ──────────────────────────── */}
          <Section>
            <SectionTitle icon={<PersonIcon />} title="Personal Info" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Full Name" required icon={<PersonIcon />}>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </FormField>
              <FormField label="Email Address" required icon={<EmailIcon />}>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <FormField label="Phone Number" icon={<PhoneIcon />}>
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormField>
              <FormField label="Password" icon={<LockIcon />}>
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Optional — leave blank for default"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
            </div>
          </Section>

          {/* ── Shipping Address ─────────────────────────── */}
          <Section>
            <div className="flex items-center justify-between mb-0">
              <SectionTitle icon={<ShippingIcon />} title="Shipping Address" />
            </div>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Switch
                checked={addShippingAddress}
                onChange={(e) => setAddShippingAddress(e.target.checked)}
                color="primary"
                size="small"
              />
              <span className="text-[13px] font-medium text-slate-600">
                {addShippingAddress
                  ? "Shipping address enabled"
                  : "Add a shipping address"}
              </span>
              {addShippingAddress && (
                <CheckIcon
                  sx={{ fontSize: 16, color: "#22c55e", ml: "auto" }}
                />
              )}
            </div>

            {addShippingAddress && (
              <div className="flex flex-col gap-4 ">
                <FormField label="Address Line 1" required>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Street address, P.O. box, company name"
                    value={shippingAddress.addressLine1}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        addressLine1: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Address Line 2">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Apartment, suite, unit, building, floor"
                    value={shippingAddress.addressLine2}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        addressLine2: e.target.value,
                      })
                    }
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          city: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="State / Province">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="State"
                      value={shippingAddress.state}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          state: e.target.value,
                        })
                      }
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Postal / Zip Code">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Pincode"
                      value={shippingAddress.pincode}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          pincode: e.target.value,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Country">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country: e.target.value,
                        })
                      }
                    />
                  </FormField>
                </div>
              </div>
            )}
          </Section>

          {/* ── Billing Address ──────────────────────────── */}
          <Section>
            <SectionTitle icon={<BillingIcon />} title="Billing Address" />
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Switch
                checked={addBillingAddress}
                onChange={(e) => setAddBillingAddress(e.target.checked)}
                color="primary"
                size="small"
              />
              <span className="text-[13px] font-medium text-slate-600">
                {addBillingAddress
                  ? "Billing address enabled"
                  : "Add a billing address"}
              </span>
              {addBillingAddress && (
                <CheckIcon
                  sx={{ fontSize: 16, color: "#22c55e", ml: "auto" }}
                />
              )}
            </div>

            {addBillingAddress && (
              <div className="flex flex-col gap-4 ">
                {addShippingAddress && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100/80">
                    <Switch
                      checked={billingSameAsShipping}
                      onChange={(e) =>
                        setBillingSameAsShipping(e.target.checked)
                      }
                      size="small"
                      color="info"
                    />
                    <span className="text-[13px] text-blue-700 font-medium">
                      Same as shipping address
                    </span>
                  </div>
                )}

                {(!addShippingAddress || !billingSameAsShipping) && (
                  <>
                    <FormField label="Address Line 1" required>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Street address, P.O. box, company name"
                        value={billingAddress.addressLine1}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            addressLine1: e.target.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField label="Address Line 2">
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Apartment, suite, unit, building, floor"
                        value={billingAddress.addressLine2}
                        onChange={(e) =>
                          setBillingAddress({
                            ...billingAddress,
                            addressLine2: e.target.value,
                          })
                        }
                      />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="City">
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="City"
                          value={billingAddress.city}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              city: e.target.value,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="State / Province">
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="State"
                          value={billingAddress.state}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              state: e.target.value,
                            })
                          }
                        />
                      </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Postal / Zip Code">
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Pincode"
                          value={billingAddress.pincode}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              pincode: e.target.value,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Country">
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="Country"
                          value={billingAddress.country}
                          onChange={(e) =>
                            setBillingAddress({
                              ...billingAddress,
                              country: e.target.value,
                            })
                          }
                        />
                      </FormField>
                    </div>
                  </>
                )}
              </div>
            )}
          </Section>
        </div>
      </DialogContent>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-white">
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            borderColor: "#e2e8f0",
            color: "#64748b",
            fontWeight: 600,
            px: 3.5,
            py: 1.2,
            fontSize: "13px",
            "&:hover": {
              borderColor: "#cbd5e1",
              bgcolor: "#f8fafc",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            bgcolor: "var(--select-color, #7B3FF2)",
            fontWeight: 600,
            boxShadow: "none",
            px: 4,
            py: 1.2,
            fontSize: "13px",
            "&:hover": {
              bgcolor: "var(--select-color, #7B3FF2)",
              filter: "brightness(0.9)",
              boxShadow:
                "0 4px 12px -2px color-mix(in srgb, var(--select-color, #7B3FF2) 40%, transparent)",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ mr: 1, color: "white" }} />
          ) : null}
          Create Customer
        </Button>
      </div>
    </Dialog>
  );
}
