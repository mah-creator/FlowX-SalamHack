import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@/shared/types/roles";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";

export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { user, role, loading } = useCurrentUser();

  if (loading) {
    return <div className="min-h-screen bg-surface-bg" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (
    !allowedRoles ||
    allowedRoles.length === 0 ||
    (role && allowedRoles.includes(role))
  ) {
    return <>{children}</>;
  }

  return (
    <Navigate
      to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
      replace
    />
  );
}
