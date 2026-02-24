const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers:
      options?.body instanceof FormData
        ? options?.headers
        : {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
          },
  });

  const contentType = response.headers.get("content-type");

  let data: unknown = null;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      const errorObj = data as { error?: string; message?: string };
      throw new Error(
        errorObj.error ??
        errorObj.message ??
        "Erro na requisição"
      );
    }

    if (typeof data === "string") {
      throw new Error(data);
    }

    throw new Error("Erro na requisição");
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...config,
    }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestInit) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...config,
    }),

  delete: <T>(endpoint: string, config?: RequestInit) =>
    request<T>(endpoint, {
      method: "DELETE",
      ...config,
    }),
};