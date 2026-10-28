import { env } from "@/config/env";
import { ApiError, erroDaApi } from "./apiError";

const API_URL = env.API_URL;
const PERFIL_STORAGE_KEY = "perfil_ativo_id";

function buildHeaders(options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;
  const perfilId = localStorage.getItem(PERFIL_STORAGE_KEY);

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (perfilId && !Object.hasOwn(headers, "X-Perfil-Id")) {
    headers["X-Perfil-Id"] = perfilId;
  }

  return headers;
}

function mensagemOperacao(endpoint: string, method = "GET") {
  if (endpoint.includes("/download") || endpoint === "/export") return "Não foi possível baixar o arquivo.";
  if (method === "DELETE" && /^\/perfis\/\d+$/.test(endpoint)) return "Não foi possível excluir o perfil.";
  if (method === "DELETE") return endpoint.includes("/contratos/") ? "Não foi possível excluir o contrato." : endpoint.includes("/emprestimos/") ? "Não foi possível excluir o empréstimo." : "Não foi possível excluir o cliente.";
  if (endpoint.includes("/contratos") && method === "POST") return "Não foi possível gerar o documento.";
  if (endpoint.startsWith("/parcelas/pagar")) return "Não foi possível registrar o pagamento.";
  if (endpoint.startsWith("/parcelas/desfazer")) return "Não foi possível estornar o pagamento.";
  if (endpoint.includes("/emprestimos") && method === "POST") return "Não foi possível criar o empréstimo.";
  if (endpoint.startsWith("/clientes") && ["POST", "PUT", "PATCH"].includes(method)) return "Não foi possível salvar o cliente.";
  if (method === "GET") return endpoint.startsWith("/parcelas") ? "Não foi possível carregar as parcelas." : endpoint.includes("/emprestimos") ? "Não foi possível carregar os empréstimos." : endpoint.startsWith("/clientes") ? "Não foi possível carregar os clientes." : "Não foi possível carregar os dados.";
  return "Não foi possível concluir a operação.";
}

async function fetchComLimite(endpoint: string, options: RequestInit) {
  const fallback = mensagemOperacao(endpoint, options.method);
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  options.signal?.addEventListener("abort", forwardAbort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = window.setTimeout(() => controller.abort(), (endpoint.endsWith("/contratos") && options.method === "POST") || endpoint.startsWith("/import/clientes") || (options.method === "DELETE" && /^\/perfis\/\d+$/.test(endpoint)) ? 150000 : 30000);
  try { return await fetch(`${API_URL}${endpoint}`, { ...options, signal: controller.signal, headers: buildHeaders(options) }); }
  catch { throw new ApiError(controller.signal.aborted
    ? "Não foi possível confirmar a resposta no prazo. Confira o resultado na lista antes de repetir a operação."
    : `${fallback} Verifique sua conexão e tente novamente.`, 0, controller.signal.aborted ? "TEMPO_ESGOTADO" : "COMUNICACAO", [], "comunicacao"); }
  finally { window.clearTimeout(timer); options.signal?.removeEventListener("abort", forwardAbort); }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchComLimite(endpoint, options);

  const contentType = response.headers.get("content-type") || "";
  let data: unknown = null;

  if (contentType.includes("json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    data = text || null;
  }

  if (!response.ok) throw erroDaApi(data, response.status, mensagemOperacao(endpoint, options.method));

  return data as T;
}

async function downloadBlob(endpoint: string, nomePadrao = "contrato.docx"): Promise<{ blob: Blob; nomeArquivo: string; contentType: string }> {
  const response = await fetchComLimite(endpoint, { method: "GET" });
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    throw erroDaApi(data, response.status, "Não foi possível baixar o arquivo.");
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const extended = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  let filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
  if (extended) {
    try { filename = decodeURIComponent(extended.trim()); } catch { /* Use the plain filename when the encoded value is invalid. */ }
  }
  const nomeArquivo = Array.from(filename ?? "").filter((char) => char.charCodeAt(0) >= 32).join("").replace(/[\\/<>:"|?*]/g, "-").trim() || nomePadrao;
  return { blob: await response.blob(), nomeArquivo, contentType: response.headers.get("content-type") ?? "" };
}

export const apiClient = {
  getBlob: downloadBlob,
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

  put: <TResponse, TBody = unknown>(endpoint: string, body?: TBody, config?: RequestInit) =>
    request<TResponse>(endpoint, {
      method: "PUT",
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
