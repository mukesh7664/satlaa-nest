import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import axios from "axios";
import QuickUserCreateModal from "./modals/QuickUserCreateModal";

interface UserSelectorProps {
  value: any;
  onChange: (user: any) => void;
  label?: string;
  size?: "small" | "medium";
  sx?: any;
  showCreateButton?: boolean;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

export default function UserSelector({
  value,
  onChange,
  label = "Select Customer",
  size,
  sx,
  showCreateButton = false,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async (searchTerm: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm, limit: 10 },
      });
      setOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchUsers(search);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setOptions([]);
    }
  }, [search]);

  const handleUserCreated = (newUser: any) => {
    setOptions([newUser, ...options]);
    onChange(newUser);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Autocomplete
            fullWidth
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) =>
              `${option.name || (`${option.firstName} ${option.lastName}`).trim()} (${option.email})`
            }
            options={options}
            loading={loading}
            value={value}
            onChange={(event, newValue) => {
              if (newValue && newValue.isCreateNew) {
                setModalOpen(true);
                // Reset value to null or keep previous, don't select the "Create New" option itself
                return;
              }
              onChange(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setSearch(newInputValue);
            }}
            filterOptions={(options, params) => {
              const filtered = [...options];
              // Add "Create New" option only if the separate button is NOT shown
              if (!showCreateButton) {
                filtered.unshift({
                  inputValue: params.inputValue,
                  firstName: params.inputValue
                    ? `Create "${params.inputValue}"`
                    : "Create New Customer",
                  lastName: "",
                  name: params.inputValue
                    ? `Create "${params.inputValue}"`
                    : "Create New Customer",
                  email: "Click to create new user",
                  isCreateNew: true,
                  id: "create-new-option",
                });
              }
              return filtered;
            }}
            renderOption={(props, option) => {
              if (option.isCreateNew) {
                return (
                  <li
                    {...props}
                    style={{ borderTop: "1px solid #eee", color: "primary.main" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "primary.main",
                        width: "100%",
                        p: 1,
                      }}
                    >
                      <AddIcon sx={{ mr: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {option.firstName}
                      </Typography>
                    </Box>
                  </li>
                );
              }
              return (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.name || (`${option.firstName} ${option.lastName}`).trim()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email}
                    </Typography>
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                size={size}
                sx={sx}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </div>
        {showCreateButton && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{
              height: "36px",
              textTransform: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              px: 2.5,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
                filter: "brightness(0.9)",
              }
            }}
          >
            Create Customer
          </Button>
        )}
      </div>

      <QuickUserCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </>
  );
}
