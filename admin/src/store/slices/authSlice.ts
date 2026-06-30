import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  permissions?: string[];
  adminType?: string;
  createdAt?: string;
  preferences?: any;
}

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ admin: AdminUser; token: string }>
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      // Also store token in localStorage for API services
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
      }
    },
    loginFailure: (state) => {
      state.loading = false;
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      // Remove token from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    updateAdmin: (state, action: PayloadAction<AdminUser>) => {
      state.admin = action.payload;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateAdmin } =
  authSlice.actions;
export default authSlice.reducer;
