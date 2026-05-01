export type UserRole = "admin" | "user";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "verified" | "pending" | "suspended";
  country?: string;
  trustScore?: number;
  token?: string;
}
