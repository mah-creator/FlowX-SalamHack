const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type BodyInitJson = BodyInit | null | undefined;

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) return undefined as T;
  if (contentType.includes("application/json"))
    return response.json() as Promise<T>;
  return response.text() as Promise<T>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), { ...options, headers });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `API error: ${response.status}`);
  }

  return parseResponse<T>(response);
}

function jsonBody(body?: unknown): BodyInitJson {
  return body === undefined ? undefined : JSON.stringify(body);
}

export const get = <T>(url: string, options?: RequestInit) =>
  request<T>(url, { ...options, method: "GET" });
export const post = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>(url, { ...options, method: "POST", body: jsonBody(body) });
export const patch = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>(url, { ...options, method: "PATCH", body: jsonBody(body) });
export const put = <T>(url: string, body?: unknown, options?: RequestInit) =>
  request<T>(url, { ...options, method: "PUT", body: jsonBody(body) });
export const del = <T>(url: string, options?: RequestInit) =>
  request<T>(url, { ...options, method: "DELETE" });
