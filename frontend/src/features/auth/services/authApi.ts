import type { LoginCredentials, UserRole } from "@/features/auth/types";
import { get } from "@/services/apiClient";
import { authService, toCurrentUser } from "@/services/auth.service";
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
  const email = payload.email.trim().toLowerCase();
  const existing = await get<ApiUser[]>(
    `/users?email=${encodeURIComponent(email)}`,
  )
    .then((users) => users[0])
    .catch(() => null);
  if (existing) {
    throw new Error("Email already exists. Please log in instead.");
  }

  return authService.signup({ ...payload, email });
}

export function logout() {
  authService.logout();
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return authService.getCurrentUser();
}

export type AuthPayload = { email: string; password: string };

export const authApi = {
  async login(payload: AuthPayload): Promise<ApiUser> {
    const users = await get<ApiUser[]>(
      `/users?email=${encodeURIComponent(payload.email)}&password=${encodeURIComponent(payload.password)}`,
    );
    const found = users[0];
    if (!found) throw new Error("Invalid credentials");
    return found;
  },
  async signup(payload: AuthPayload & { fullName?: string }): Promise<ApiUser> {
    const current = await signup({
      fullName: payload.fullName ?? "FlowX User",
      email: payload.email,
      password: payload.password,
    });
    const created = await get<ApiUser[]>(
      `/users?email=${encodeURIComponent(current.email)}`,
    );
    return (
      created[0] ??
      ({
        id: current.id,
        fullName: current.name,
        email: current.email,
        role: current.role === "admin" ? "ADMIN" : "USER",
      } as ApiUser)
    );
  },
};
