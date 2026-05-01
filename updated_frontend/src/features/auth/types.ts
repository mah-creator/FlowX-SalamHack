export type UserRole = "admin" | "user";

export type LocalAccountShortcut = {
  email: string;
  password: string;
  role: UserRole;
  name: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthState = {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: "verified" | "pending" | "suspended";
  } | null;
  loading: boolean;
  error?: string | null;
};
