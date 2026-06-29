import { headers } from "next/headers";

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

    let headersList;
    try {
        headersList = await headers();
    } catch (e) {
        // Fallback for build-time or environments where headers aren't available
        headersList = new Map();
    }

    const host = headersList.get("host") || "";
    const cleanHost = host.split(":")[0];
    const defaultOptions: RequestInit = {
        cache: "no-store", // CRITICAL: Never cache, always fetch fresh data
        headers: {
            "Content-Type": "application/json",
            "x-tenant-domain": cleanHost, // Use the same header as working pages
            ...options.headers,
        },
    };

    const res = await fetch(url, { ...defaultOptions, ...options });

    if (!res.ok) {
        console.error(`Fetch failed for ${url}: ${res.status} ${res.statusText}`);
    }

    return res;
}
