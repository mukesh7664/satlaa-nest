import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
  setError,
} from "@/lib/store/features/auth/authSlice";

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: {
    countryCode: string;
    number: string;
  };
  companyName?: string;
  companySize?: string;
  industry?: string;
  designation?: string;
  gstNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
  };
  // Add other fields as needed
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, isAuthenticated, error } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-domain": window.location.hostname,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = data;

      dispatch(setCredentials({ user, token }));
      router.push("/");
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      // Split name into first and last name
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "."; // Default last name if not provided

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-domain": window.location.hostname,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      const { token, user } = data;

      dispatch(setCredentials({ user, token }));
      router.push("/");
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    router.push("/auth/login");
  };

  const forgotPassword = async (email: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      return data;
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (token: string, password: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      return data;
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      dispatch(setCredentials({ user: responseData.user, token: token! }));
      return responseData;
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const token = localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      return data;
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resendVerificationEmail = async (email: string) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      return data;
    } catch (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    resendVerificationEmail,
  };
};
