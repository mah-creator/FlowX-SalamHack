import { get, post, setAuthToken, SERVER_CONNECTION_ERROR } from "./apiClient";
import type { ApiUser } from "./types";
import type { CurrentUser, UserRole } from "@/shared/types/roles";

const SESSION_KEY = "flowx_user";

function normalizeRole(role: ApiUser["role"] | string): UserRole {
  return String(role).toUpperCase() === "ADMIN" ? "admin" : "user";
}

export function toCurrentUser(user: ApiUser): CurrentUser {
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
  };
}

export const authService = {
  async login(email: string, password: string): Promise<CurrentUser | null> {
    try {
      const users = await get<ApiUser[]>(
        `/users?email=${encodeURIComponent(email.trim().toLowerCase())}&password=${encodeURIComponent(password)}`,
      );
      const user = users[0];
      if (!user || user.status === "suspended") return null;

      setAuthToken(null);
      const currentUser = toCurrentUser(user);
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
      const email = payload.email.trim().toLowerCase();
      const existingUsers = await get<ApiUser[]>(
        `/users?email=${encodeURIComponent(email)}`,
      );
      if (existingUsers.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      const now = new Date().toISOString();
      const apiUser: ApiUser = {
        id: `usr-${Date.now()}`,
        fullName: payload.fullName.trim() || "FlowX User",
        email,
        password: payload.password,
        role: payload.role === "admin" ? "ADMIN" : "USER",
        accountType: payload.accountType ?? "Individual",
        country: "Gaza",
        phone: "+970590000000",
        verified: false,
        kycLevel: "Basic",
        verificationStatus: "PENDING",
        trustScore: 70,
        status: "pending",
        createdAt: now,
      };

      const createdUser = await post<ApiUser>("/users", apiUser);
      const id = createdUser.id;

      void Promise.allSettled([
        post("/wallets", {
          id: `wal-${id}`,
          userId: id,
          balance: 0,
          currency: "USD",
          escrowBalance: 0,
          availableBalance: 0,
        }),
        post("/verifications", {
          id: `ver-${id}`,
          userId: id,
          status: "PENDING",
          level: "Basic",
          documentType: "passport",
          submittedAt: now,
          reviewedAt: null,
          reviewerId: null,
          rejectionReason: null,
        }),
        post("/notifications", {
          id: `not-${Date.now()}`,
          userId: id,
          title: "Account created",
          message: "Complete KYC to unlock higher limits.",
          read: false,
          type: "kyc",
          createdAt: now,
        }),
      ]);

      setAuthToken(null);
      const currentUser = toCurrentUser(createdUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      if (error instanceof Error && error.message.includes("already exists")) {
        throw error;
      }
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
      setAuthToken(null);
      return user;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      setAuthToken(null);
      return null;
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
  },
};
