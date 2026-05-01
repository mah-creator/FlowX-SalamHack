import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Shield, Users } from "lucide-react";
import { cn } from "@/shared/utils";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import { adminService } from "@/services/admin.service";
import type {
  ApiAuditLog,
  ApiConfig,
  ApiDispute,
  ApiTransfer,
  ApiUser,
  ApiVerification,
} from "@/services/types";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [disputes, setDisputes] = useState<ApiDispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [feePercent, setFeePercent] = useState(2);
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    void adminService.getDashboardStats().then((result) => {
      setUsers(result.users);
      setTransfers(result.transfers);
      setVerifications(result.verifications);
      setDisputes(result.disputes);
      setAuditLogs(result.auditLogs);
      setConfig(result.config ?? null);
      setFeePercent(result.config?.feePercent ?? 2);
      setExchangeRate(result.config?.exchangeRate ?? 1);
    });
  }, []);

  const completedVolume = useMemo(
    () =>
      transfers
        .filter((tx) => tx.status === "COMPLETED")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [transfers],
  );
  const pendingVerifications = verifications.filter((item) =>
    ["PENDING", "IN_REVIEW", "NEEDS_INFO"].includes(item.status),
  ).length;
  const riskQueue = transfers.filter(
    (tx) => tx.status === "UNDER_REVIEW" || tx.riskLevel === "high",
  );
  const openDisputes = disputes.filter((item) => item.status === "OPEN");

  const platformStats = [
    {
      label: "All Users",
      value: String(users.length),
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "All Transfers",
      value: String(transfers.length),
      icon: Activity,
      href: "/admin/transfers",
    },
    {
      label: "Total Volume",
      value: `$${completedVolume.toFixed(2)}`,
      icon: BarChart3,
    },
    {
      label: "Pending Verifications",
      value: String(pendingVerifications),
      icon: Shield,
      urgent: pendingVerifications > 0,
      href: "/admin/verification",
    },
    {
      label: "Risk Queue",
      value: String(riskQueue.length + openDisputes.length),
      icon: Shield,
      urgent: riskQueue.length + openDisputes.length > 0,
    },
  ];

  const updateConfig = async () => {
    const updated = await adminService.updateConfig({
      feePercent,
      exchangeRate,
    });
    setConfig(updated);
  };

  return (
    <div className="flex min-h-screen bg-surface-bg text-navy-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto w-full flex-1 space-y-8">
          <section className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6 shadow-sm">
            <details open>
              <summary className="font-black cursor-pointer">
                Platform Config
              </summary>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="text-xs font-bold">
                  FX Rate
                  <input
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="block mt-1 rounded-lg border border-slate-300 p-2"
                  />
                </label>
                <label className="text-xs font-bold">
                  Fee %
                  <input
                    type="number"
                    step="0.1"
                    value={feePercent}
                    onChange={(e) => setFeePercent(Number(e.target.value))}
                    className="block mt-1 rounded-lg border border-slate-300 p-2"
                  />
                </label>
                <button
                  onClick={updateConfig}
                  className="px-4 py-2 rounded-lg bg-navy-900 text-white font-bold"
                >
                  Save Config
                </button>
                {config && (
                  <p className="text-xs text-slate-500">
                    Payment window: {config.paymentWindowMinutes} minutes
                  </p>
                )}
              </div>
            </details>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {platformStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      stat.urgent
                        ? "bg-amber-100 text-amber-700"
                        : "bg-teal-50 text-teal-600",
                    )}
                  >
                    <stat.icon size={20} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-navy-900">
                  {stat.value}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {stat.label}
                </p>
                {stat.href && (
                  <Link
                    to={stat.href}
                    className="mt-4 inline-block text-sm font-bold text-navy-900 underline"
                  >
                    View
                  </Link>
                )}
              </div>
            ))}
          </div>

          <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold">Verification Queue</h2>
            </div>
            <div className="p-6 text-sm text-slate-500">
              {pendingVerifications} verification record
              {pendingVerifications === 1 ? "" : "s"} waiting for admin review.
              <Link
                to="/admin/verification"
                className="ml-2 font-bold text-navy-900 underline"
              >
                Open queue
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-xl font-bold">Live Transaction Log</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left">TX ID</th>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100">
                      <td className="px-6 py-3">{tx.id}</td>
                      <td className="px-6 py-3">
                        {users.find((user) => user.id === tx.userId)
                          ?.fullName ?? tx.userId}
                      </td>
                      <td className="px-6 py-3">${tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-slate-100">
                          {tx.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          to={`/transfer/status/${tx.id}`}
                          className="text-sm font-bold text-navy-900 underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-slate-500" colSpan={5}>
                        No transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {auditLogs.length > 0 && (
            <section className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-xl font-bold">Audit Log</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-4 text-sm flex justify-between gap-4"
                  >
                    <span className="font-bold text-navy-900">
                      {log.action}
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
