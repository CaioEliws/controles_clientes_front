const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const PERFIL_STORAGE_KEY = "perfil_ativo_id";

function buildHeaders(options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;
  const perfilId = localStorage.getItem(PERFIL_STORAGE_KEY);

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (perfilId) {
    headers["X-Perfil-Id"] = perfilId;
  }

  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const contentType = response.headers.get("content-type") || "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text || null;
  }

  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      const errorObj = data as { error?: string; message?: string };
      throw new Error(errorObj.error ?? errorObj.message ?? "Erro na requisição");
    }

    if (typeof data === "string" && data.trim()) {
      throw new Error(data);
    }

    throw new Error("Erro na requisição");
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, config?: RequestInit) =>
    request<T>(endpoint, { method: "GET", ...(config || {}) }),

  post: <TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: RequestInit
  ) =>
    request<TResponse>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
      ...(config || {}),
    }),

  patch: <TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: RequestInit
  ) =>
    request<TResponse>(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
      ...(config || {}),
    }),

  delete: <T>(endpoint: string, config?: RequestInit) =>
    request<T>(endpoint, {
      method: "DELETE",
      ...(config || {}),
    }),
};