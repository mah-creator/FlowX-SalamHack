import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/shared/utils";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { transfersService } from "@/services/transfers.service";
import { walletService } from "@/services/wallet.service";
import { verificationService } from "@/services/verification.service";
import { notificationsService } from "@/services/notifications.service";
import {
  formatTransferStatus,
  transferStatusBadgeClass,
} from "@/services/status";
import type {
  ApiNotification,
  ApiTransfer,
  ApiVerification,
  ApiWallet,
} from "@/services/types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setError(null);
    void Promise.all([
      transfersService.getUserTransfers(user.id),
      walletService.getUserWallets(user.id),
      verificationService.getUserVerifications(user.id),
      notificationsService.getUserNotifications(user.id),
    ])
      .then(
        ([transferRows, walletRows, verificationRows, notificationRows]) => {
          setTransfers(transferRows);
          setWallets(walletRows);
          setVerifications(verificationRows);
          setNotifications(notificationRows);
        },
      )
      .catch(() =>
        setError("We could not connect to the server. Please try again."),
      );
  }, [user?.id]);

  const completedCount = transfers.filter(
    (tx) => tx.status === "COMPLETED",
  ).length;
  const activeTransfers = transfers.filter(
    (tx) =>
      !["COMPLETED", "REFUNDED", "FAILED", "CANCELLED"].includes(tx.status),
  );
  const activeCount = activeTransfers.length;
  const escrowTotal = wallets.reduce(
    (sum, wallet) => sum + wallet.escrowBalance,
    0,
  );
  const availableTotal = wallets.reduce(
    (sum, wallet) => sum + wallet.availableBalance,
    0,
  );
  const verificationStatus = verifications[0]?.status ?? "PENDING";

  const stats = [
    {
      label: "Wallet / Escrow",
      value: `$${availableTotal.toFixed(2)} / $${escrowTotal.toFixed(2)}`,
    },
    { label: "Active Transfers", value: String(activeCount) },
    { label: "Completed Transfers", value: String(completedCount) },
    {
      label: "Trust Score",
      value: user?.trustScore ? `${user.trustScore}/100` : "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto w-full flex-1">
          <header className="flex flex-col gap-6 mb-8 lg:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-2"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">
                    Welcome, {user?.name ?? "FlowX User"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold ring-1 ring-teal-500/10">
                    <CheckCircle2
                      size={12}
                      className="fill-teal-500 text-white"
                    />
                    {formatTransferStatus(verificationStatus)}
                  </span>
                </motion.div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/transfer/new")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
                >
                  New Transfer
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/transfer/pending")}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Pending Requests
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-ambient flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center">
                    <ShieldCheck className="text-slate-500 h-5 w-5" />
                  </div>
                  <MoreHorizontal size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl font-bold text-navy-900">
                    {stat.value}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy-900">
                  Active Transfer Requests
                </h3>
              </div>
              {activeTransfers.length === 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100">
                  No active transfers.
                </div>
              )}
              {activeTransfers.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-ambient group hover:border-teal-500/30 transition-all cursor-pointer"
                  onClick={() => navigate(`/transfer/status/${item.id}`)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 ring-1 ring-teal-500/10">
                        {formatTransferStatus(item.status)}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        ID: {item.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-black text-navy-900">
                        ${item.amount.toFixed(2)}{" "}
                        <span className="text-xs font-bold text-slate-400">
                          {item.currency}
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.sourceCountry}{" "}
                        <ArrowRight className="inline size-3" />{" "}
                        {item.destinationCountry}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-lg font-bold text-navy-900">
                Recent Activity
              </h3>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-ambient overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-navy-900">
                          {notification.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">
                        {notification.type}
                      </span>
                    </div>
                  ))}
                  {transfers.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-navy-900">
                          {tx.id}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-navy-900">
                          ${tx.amount.toFixed(2)}
                        </p>
                        <p
                          className={cn(
                            "mt-1",
                            transferStatusBadgeClass(tx.status),
                          )}
                        >
                          {formatTransferStatus(tx.status)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transfers.length === 0 && notifications.length === 0 && (
                    <div className="p-4 text-sm text-slate-500">
                      No recent activity.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
