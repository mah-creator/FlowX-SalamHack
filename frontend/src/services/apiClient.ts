const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_TOKEN_KEY = "flowx_auth_token";

export const SERVER_CONNECTION_ERROR =
  "We could not connect to the server. Please try again.";

export class ApiClientError extends Error {
  constructor(
    message = SERVER_CONNECTION_ERROR,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type BodyInitJson = BodyInit | null | undefined;

type WrappedResponse<T> =
  | T
  | { data: T }
  | { success: boolean; data: T }
  | { error?: { message?: string } };

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) {
    throw new ApiClientError();
  }
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeResponse<T>(payload: WrappedResponse<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (("success" in payload && payload.success !== false) ||
      !("success" in payload))
  ) {
    return payload.data;
  }

  return payload as T;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) return undefined as T;
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as WrappedResponse<T>;
    return normalizeResponse<T>(payload);
  }
  return response.text() as Promise<T>;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), { ...options, headers });
  } catch {
    throw new ApiClientError();
  }

  if (!response.ok) {
    throw new ApiClientError(SERVER_CONNECTION_ERROR, response.status);
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

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token?: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
