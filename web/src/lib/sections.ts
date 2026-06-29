import { fetchServer } from "@/lib/api/server-fetch";

export async function getGlobalSections() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetchServer("/header-sections"),
      fetchServer("/footer-sections")
    ]);
    
    const headers = headerRes.ok ? (await headerRes.json()).data || [] : [];
    const footers = footerRes.ok ? (await footerRes.json()).data || [] : [];
    
    return { headers, footers };
  } catch (error) {
    console.error("Failed to fetch global sections", error);
    return { headers: [], footers: [] };
  }
}
