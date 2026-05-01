import { post, setAuthToken, SERVER_CONNECTION_ERROR } from "./apiClient";
import { toUser } from "./adapters/user.adapter";
import type { ApiUser } from "./types";
import type { CurrentUser, UserRole } from "@/shared/types/roles";

const SESSION_KEY = "flowx_user";

type AuthResponse = {
  user?: unknown;
  token?: string;
  accessToken?: string;
  access_token?: string;
} & Record<string, unknown>;

function normalizeRole(role: ApiUser["role"] | string): UserRole {
  return String(role).toUpperCase() === "ADMIN" ? "admin" : "user";
}

function extractToken(response: AuthResponse) {
  return (
    response.token ?? response.accessToken ?? response.access_token ?? null
  );
}

function extractUser(response: AuthResponse) {
  return response.user ?? response;
}

export function toCurrentUser(
  user: ApiUser,
  token?: string | null,
): CurrentUser {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: normalizeRole(user.role),
    status:
      user.status === "active"
        ? "verified"
        : user.status === "suspended"
          ? "suspended"
          : "pending",
    country: user.country,
    trustScore: user.trustScore,
    token: token ?? undefined,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<CurrentUser | null> {
    try {
      const response = await post<AuthResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const token = extractToken(response);
      const user = toUser(extractUser(response));
      if (!user.id || user.status === "suspended") return null;

      setAuthToken(token);
      const currentUser = toCurrentUser(user, token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      return currentUser;
    } catch {
      throw new Error(SERVER_CONNECTION_ERROR);
    }
  },

  async signup(payload: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
    accountType?: ApiUser["accountType"];
  }): Promise<CurrentUser> {
    try {
      const response = await post<AuthResponse>("/auth/signup", {
        fullName: payload.fullName.trim() || "FlowX User",
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role: payload.role === "admin" ? "ADMIN" : "USER",
        accountType: payload.accountType ?? "Individual",
      });
      const token = extractToken(response);
      const user = toUser(extractUser(response));
      setAuthToken(token);
      const currentUser = toCurrentUser(user, token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      return currentUser;
    } catch {
      throw new Error(SERVER_CONNECTION_ERROR);
    }
  },

  async verify(payload: Record<string, unknown>) {
    return post("/auth/verify", payload);
  },

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const user = JSON.parse(raw) as CurrentUser;
      if (user.token) setAuthToken(user.token);
      return user;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setAuthToken(null);
      return null;
    }
  },

  async logout() {
    try {
      await post("/auth/logout");
    } catch {
      // The session is local even when the backend logout endpoint is unavailable.
    } finally {
      localStorage.removeItem(SESSION_KEY);
      setAuthToken(null);
    }
  },
};
