import React from "react";
import { Navigate } from "react-router-dom";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import DashboardPage from "./DashboardPage";

export default function DashboardRouter() {
  const { role, loading } = useCurrentUser();

  if (loading) return null;

  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (role === "user") return <DashboardPage />;

  // fallback: redirect to landing
  return <Navigate to="/" replace />;
}
