import { get, post } from "./apiClient";
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
    const users = await get<ApiUser[]>(
      `/users?email=${encodeURIComponent(email.trim().toLowerCase())}&password=${encodeURIComponent(password)}`,
    );
    const user = users[0];
    if (!user || user.status === "suspended") return null;
    const currentUser = toCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    return currentUser;
  },

  async signup(payload: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
    accountType?: ApiUser["accountType"];
  }): Promise<CurrentUser> {
    const now = new Date().toISOString();
    const apiUser: ApiUser = {
      id: `usr-${Date.now()}`,
      fullName: payload.fullName.trim() || "FlowX User",
      email: payload.email.trim().toLowerCase(),
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

    await Promise.all([
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

    return this.login(createdUser.email, payload.password).then(
      (currentUser) => currentUser ?? toCurrentUser(createdUser),
    );
  },

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },
};
