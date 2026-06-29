import { headers } from "next/headers";

export interface TenantValidationResult {
  isValid: boolean;
  isRootDomain: boolean;
  error?: 'not_found' | 'server_error' | null;
  storeName?: string;
  cleanHost: string;
}

export async function validateTenant(): Promise<TenantValidationResult> {
  let headersList;
  try {
    headersList = await headers();
  } catch (e) {
    return {
      isValid: false,
      isRootDomain: false,
      error: 'server_error',
      cleanHost: '',
    };
  }

  const host = headersList.get("host") || "";
  const cleanHost = host.split(":")[0];
  const pathname = headersList.get("x-pathname") || "";

  // If we are loading the page builder preview route, skip tenant checks to allow iframe loading on localhost
  if (pathname.startsWith("/preview")) {
    return {
      isValid: true,
      isRootDomain: false,
      cleanHost,
    };
  }

  const baseDomain = process.env.BASE_DOMAIN || "prefyn.com";
  
  // Define what hosts are considered the root platform domain
  const isRootDomain = (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === baseDomain ||
    cleanHost === `www.${baseDomain}` ||
    cleanHost === `admin.${baseDomain}` ||
    cleanHost === `apis.${baseDomain}` ||
    cleanHost === `webs.${baseDomain}`
  );

  // If it is exactly the root domain, we don't query a store, it's just the platform
  if (isRootDomain) {
    return {
      isValid: false,
      isRootDomain: true,
      cleanHost,
    };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api/v1";
  const checkUrl = `${apiUrl}/settings/public`;

  try {
    const res = await fetch(checkUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-domain": cleanHost,
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return {
        isValid: false,
        isRootDomain: false,
        error: 'not_found',
        cleanHost,
      };
    }

    if (!res.ok) {
      return {
        isValid: false,
        isRootDomain: false,
        error: 'server_error',
        cleanHost,
      };
    }

    const result = await res.json();
    return {
      isValid: true,
      isRootDomain: false,
      storeName: result.data?.siteName || '',
      cleanHost,
    };
  } catch (error) {
    console.error("Tenant validation error:", error);
    return {
      isValid: false,
      isRootDomain: false,
      error: 'server_error',
      cleanHost,
    };
  }
}
