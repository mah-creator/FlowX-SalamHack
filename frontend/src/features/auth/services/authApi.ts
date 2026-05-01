import type { LoginCredentials, UserRole } from "@/features/auth/types";
import { authService } from "@/services/auth.service";
import type { ApiUser } from "@/services/types";
import type { CurrentUser } from "@/shared/types/roles";

export async function login(
  credentials: LoginCredentials,
): Promise<CurrentUser | null> {
  return authService.login(credentials.email, credentials.password);
}

export async function signup(payload: {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  accountType?: ApiUser["accountType"];
}): Promise<CurrentUser> {
  return authService.signup({
    ...payload,
    email: payload.email.trim().toLowerCase(),
  });
}

export function logout() {
  void authService.logout();
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return authService.getCurrentUser();
}

export type AuthPayload = { email: string; password: string };

export const authApi = {
  async login(payload: AuthPayload): Promise<ApiUser> {
    const current = await login(payload);
    if (!current) throw new Error("Invalid credentials");
    return {
      id: current.id,
      fullName: current.name,
      email: current.email,
      role: current.role === "admin" ? "ADMIN" : "USER",
      accountType: current.role === "admin" ? "Admin" : "Individual",
      country: current.country ?? "Gaza",
      phone: "",
      verified: current.status === "verified",
      kycLevel: current.status === "verified" ? "Verified" : "Basic",
      verificationStatus:
        current.status === "verified" ? "VERIFIED" : "PENDING",
      trustScore: current.trustScore ?? 70,
      status: current.status === "suspended" ? "suspended" : "active",
      createdAt: "",
    };
  },
  async signup(payload: AuthPayload & { fullName?: string }): Promise<ApiUser> {
    const current = await signup({
      fullName: payload.fullName ?? "FlowX User",
      email: payload.email,
      password: payload.password,
    });
    return {
      id: current.id,
      fullName: current.name,
      email: current.email,
      role: current.role === "admin" ? "ADMIN" : "USER",
      accountType: "Individual",
      country: current.country ?? "Gaza",
      phone: "",
      verified: current.status === "verified",
      kycLevel: "Basic",
      verificationStatus: "PENDING",
      trustScore: current.trustScore ?? 70,
      status: "pending",
      createdAt: "",
    };
  },
};
