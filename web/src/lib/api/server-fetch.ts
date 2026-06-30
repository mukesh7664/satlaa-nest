export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";

interface FetchOptions extends RequestInit {
    cache?: RequestCache;
}

/**
 * Server-side fetch wrapper to ensure strict SSR with no caching.
 * This guarantees real-time updates from the Admin panel.
 */
export async function fetchServer(endpoint: string, options: FetchOptions = {}) {
    const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const defaultOptions: RequestInit = {
        cache: "no-store", // CRITICAL: Never cache, always fetch fresh data
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    };

    const res = await fetch(url, { ...defaultOptions, ...options });

    if (!res.ok) {
        console.error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
    }

    return res;
}
