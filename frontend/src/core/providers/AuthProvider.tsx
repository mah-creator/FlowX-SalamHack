import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LoginCredentials } from "@/features/auth/types";
import type { CurrentUser, UserRole } from "@/shared/types/roles";
import * as authApi from "@/features/auth/services/authApi";

type AuthContextValue = {
  currentUser: CurrentUser | null;
  user: CurrentUser | null;
  role: UserRole | null;
  isAdmin: boolean;
  isUser: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<CurrentUser | null>;
  signup: (payload: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
    accountType?: "Individual" | "Business" | "Admin";
  }) => Promise<CurrentUser | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    authApi
      .getCurrentUser()
      .then((storedUser) => {
        if (!mounted) return;
        setUser(storedUser);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load current user",
        );
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const authenticatedUser = await authApi.login(credentials);
      setUser(authenticatedUser);
      if (!authenticatedUser) {
        setError("Invalid email or password.");
      }
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (payload: {
      fullName: string;
      email: string;
      password: string;
      role?: UserRole;
      accountType?: "Individual" | "Business" | "Admin";
    }) => {
      setLoading(true);
      setError(null);

      try {
        const createdUser = await authApi.signup(payload);
        setUser(createdUser);
        return createdUser;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Signup failed. Please try again.";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;

    return {
      currentUser: user,
      user,
      role,
      isAdmin: role === "admin",
      isUser: role === "user",
      loading,
      error,
      login,
      signup,
      logout,
    };
  }, [error, loading, login, logout, signup, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return context;
}
