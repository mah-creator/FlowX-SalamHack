import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/core/providers/AuthProvider";
import ProtectedRoute from "@/app/ProtectedRoute";
import LandingPage from "@/features/landing/pages/LandingPage";
import LoginPage from "@/features/landing/pages/LoginPage";
import SignUpPage from "@/features/landing/pages/SignUpPage";
import VerificationPage from "@/features/auth/pages/VerificationPage";
import AdminVerificationQueuePage from "@/features/verification/pages/AdminVerificationQueuePage";
import DashboardRouter from "@/features/dashboard/pages/DashboardRouter";
import AdminDashboardPage from "@/features/dashboard/pages/AdminDashboardPage";
import DisputePage from "@/features/transfers/pages/DisputePage";
import EscrowDepositPage from "@/features/transfers/pages/EscrowDepositPage";
import MatchingPage from "@/features/transfers/pages/MatchingPage";
import NewTransferPage from "@/features/transfers/pages/NewTransferPage";
import PendingRequestsPage from "@/features/transfers/pages/PendingRequestsPage";
import TransactionStatusPage from "@/features/transfers/pages/TransactionStatusPage";
import {
  AnalyticsPage,
  MarketplacePage,
  NotificationsPage,
  RequestDetailPage,
  RequestsPage,
  TransfersPage,
  UsersPage,
  WalletPage,
} from "./WorkspacePages";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";

function RootRoute() {
  const { user, role, loading } = useCurrentUser();

  if (loading) return <div className="min-h-screen bg-surface-bg" />;
  if (!user) return <LandingPage />;
  return (
    <Navigate
      to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
      replace
    />
  );
}

function FlowXRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminVerificationQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transfers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TransfersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests/:requestId"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        <Route
          path="/analytics"
          element={<Navigate to="/admin/analytics" replace />}
        />
        <Route
          path="/requests"
          element={<Navigate to="/admin/requests" replace />}
        />
        <Route
          path="/requests/new"
          element={<Navigate to="/admin/requests" replace />}
        />
        <Route
          path="/requests/:requestId"
          element={<Navigate to="/admin/requests" replace />}
        />

        <Route
          path="/verification"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <VerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/verification"
          element={<Navigate to="/verification" replace />}
        />
        <Route
          path="/transfers"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TransfersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/match/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MatchingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/pending"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PendingRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/escrow/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <EscrowDepositPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/status/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "user"]}>
              <TransactionStatusPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MarketplacePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transfer/new"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <NewTransferPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-transfer"
          element={<Navigate to="/transfer/new" replace />}
        />
        <Route
          path="/transfers/new"
          element={<Navigate to="/transfer/new" replace />}
        />
        <Route
          path="/transfer/dispute/:txId"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <DisputePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default function FlowXApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-surface-bg" />;
  }

  return (
    <BrowserRouter>
      <FlowXRoutes />
    </BrowserRouter>
  );
}
