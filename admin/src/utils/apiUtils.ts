export class AccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessDeniedError";
  }
}


export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new AccessDeniedError(
      "Access Denied: You are not authorized to perform this action."
    );
  }

  if (response.status === 403) {
    throw new AccessDeniedError(
      "Access Denied: You do not have permission to perform this action."
    );
  }

  return response;
};
