const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("posUser");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized");
  }
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (body && (body.message || body.error)) || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return body;
}

function authHeaders(extra: Record<string, string> = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export const apiService = {
  baseUrl: API_URL,

  async get(path: string) {
    const res = await fetch(`${API_URL}${path}`, { headers: authHeaders() });
    return handleResponse(res);
  },

  async post(path: string, data?: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data ?? {}),
    });
    return handleResponse(res);
  },

  async put(path: string, data?: any) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data ?? {}),
    });
    return handleResponse(res);
  },

  async delete(path: string) {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // Auth (reuses the shared admin login endpoint)
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
};
