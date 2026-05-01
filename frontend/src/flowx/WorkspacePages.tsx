import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  Search,
  Store,
  UserCheck,
  Wallet,
} from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { cn } from "@/shared/utils";
import { notificationsService } from "@/services/notifications.service";
import { transfersService } from "@/services/transfers.service";
import { usersService } from "@/services/users.service";
import { walletService } from "@/services/wallet.service";
import { disputesService } from "@/services/disputes.service";
import { verificationService } from "@/services/verification.service";
import { get, SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import {
  formatTransferStatus,
  transferStatusBadgeClass,
} from "@/services/status";
import type {
  ApiNotification,
  ApiTransfer,
  ApiUser,
  ApiVerification,
  ApiWallet,
} from "@/services/types";

type ApiAgent = {
  id: string;
  name: string;
  region: string;
  status: string;
  capacity: number;
  verified: boolean;
};

type AnalyticsMetric = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
};

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          {subtitle}
        </p>
      </div>
    </header>
  );
}

function SearchBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-ambient mb-6">
      <Search className="text-slate-400 h-4 w-4 shrink-0" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none placeholder:text-slate-400 h-5"
      />
    </div>
  );
}

export function TransfersPage() {
  const navigate = useNavigate();
  const { isAdmin, user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const request = isAdmin
      ? transfersService.getAllTransfers()
      : user?.id
        ? transfersService.getUserTransfers(user.id)
        : Promise.resolve([]);
    setLoading(true);
    setError(null);
    void request
      .then(setTransfers)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [isAdmin, user?.id]);

  const statusOptions = useMemo(
    () => ["ALL", ...Array.from(new Set(transfers.map((item) => item.status)))],
    [transfers],
  );

  const filtered = transfers.filter((item) => {
    const matchesQuery = `${item.id} ${item.status} ${item.destinationCountry}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <MainLayout>
      <PageHeader
        title={isAdmin ? "All Transfers" : "My Transfers"}
        subtitle={
          isAdmin
            ? "Review platform transfer activity."
            : "Review and continue transfer workflows."
        }
      />
      <SearchBox value={query} onChange={setQuery} />
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-navy-900 outline-none focus:border-teal-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "ALL" ? "All statuses" : formatTransferStatus(status)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            Loading transfers...
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}
        {filtered.map((tx) => (
          <button
            key={tx.id}
            onClick={() => navigate(`/transfer/status/${tx.id}`)}
            className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-ambient text-left hover:border-teal-500/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-black text-navy-900">{tx.id}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                  {tx.sourceCountry} -&gt; {tx.destinationCountry}
                </p>
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500">
                {formatTransferStatus(tx.status)}
              </span>
            </div>
            <p className="mt-4 text-xl font-black text-navy-900">
              {tx.amount.toFixed(2)} {tx.currency}
            </p>
          </button>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            No transfers found.
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ApiUser[]>([]);
  const [transfers, setTransfers] = useState<ApiTransfer[]>([]);
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void Promise.all([
      usersService.getUsers(),
      transfersService.getAllTransfers(),
      walletService.getWallets(),
      verificationService.getAllVerifications(),
    ])
      .then(([userRows, transferRows, walletRows, verificationRows]) => {
        setData(userRows);
        setTransfers(transferRows);
        setWallets(walletRows);
        setVerifications(verificationRows);
      })
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, []);

  const users = data.filter((user) =>
    `${user.fullName} ${user.email} ${user.accountType}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selected = data.find((user) => user.id === selectedId);
  const selectedTransfers = selected
    ? transfers.filter((transfer) => transfer.userId === selected.id)
    : [];
  const selectedWallet = selected
    ? (wallets.find((wallet) => wallet.userId === selected.id) ?? null)
    : null;
  const selectedVerification = selected
    ? (verifications.find(
        (verification) => verification.userId === selected.id,
      ) ?? null)
    : null;
  const activeTransfers = selectedTransfers.filter(
    (transfer) =>
      !["COMPLETED", "FAILED", "REFUNDED", "CANCELLED"].includes(
        transfer.status,
      ),
  );
  const completedTransfers = selectedTransfers.filter(
    (transfer) => transfer.status === "COMPLETED",
  );
  const totalVolume = completedTransfers.reduce(
    (sum, transfer) => sum + transfer.amount,
    0,
  );
  const totalFees = selectedTransfers.reduce(
    (sum, transfer) => sum + transfer.fee,
    0,
  );
  const recentTransfers = [...selectedTransfers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);
  const lastActivity =
    recentTransfers[0]?.updatedAt ?? recentTransfers[0]?.createdAt;
  const initials =
    selected?.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FX";
  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString() : "Not provided";
  const formatText = (value?: string | number | null) =>
    value === undefined || value === null || value === ""
      ? "Not provided"
      : String(value);
  const verificationStatus =
    selectedVerification?.status ??
    selected?.verificationStatus ??
    (selected?.verified ? "VERIFIED" : "PENDING");

  const statusBadgeClass = (status?: string) =>
    cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
      status === "VERIFIED" || status === "COMPLETED" || status === "active"
        ? "bg-teal-50 text-teal-700 ring-1 ring-teal-500/15"
        : status === "REJECTED" || status === "FAILED" || status === "suspended"
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-500/15"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-500/15",
    );

  const detailRows = selected
    ? [
        ["User ID", selected.id],
        ["Phone", selected.phone],
        ["Country", selected.country],
        ["User type", selected.accountType],
        ["Account status", selected.status],
        ["Created date", formatDate(selected.createdAt)],
        ["Last activity", formatDate(lastActivity)],
      ]
    : [];

  return (
    <MainLayout>
      <PageHeader
        title="Users"
        subtitle="Search users and inspect profile details."
      />
      <SearchBox value={query} onChange={setQuery} />
      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          Loading users...
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedId(user.id)}
              className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-ambient text-left hover:border-teal-500/30"
            >
              <p className="font-black text-navy-900">{user.fullName}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <p className="text-[10px] font-black uppercase text-teal-600 mt-2">
                {user.accountType} - Trust {user.trustScore}
              </p>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-ambient overflow-hidden">
          {!selected ? (
            <div className="p-6 min-h-64 flex flex-col items-center justify-center text-center">
              <UserCheck className="text-teal-600 mb-4" />
              <h2 className="text-lg font-black text-navy-900 mb-2">
                User details
              </h2>
              <p className="text-sm text-slate-500">
                Select a user to view details.
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-6 space-y-6">
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center text-sm font-black shadow-elevated">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black text-navy-900 leading-tight">
                      {selected.fullName}
                    </h2>
                    <p className="text-sm text-slate-500 break-all">
                      {selected.email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={statusBadgeClass(selected.role)}>
                        {selected.role}
                      </span>
                      <span className={statusBadgeClass(verificationStatus)}>
                        {formatTransferStatus(verificationStatus)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-surface-low p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Trust Score
                  </p>
                  <p className="mt-1 text-2xl font-black text-navy-900">
                    {formatText(selected.trustScore)}
                    <span className="text-sm text-slate-400">/100</span>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                  Basic Info
                </h3>
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {detailRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 px-4 py-3"
                    >
                      <span className="text-xs font-bold text-slate-400">
                        {label}
                      </span>
                      <span className="text-xs font-black text-navy-900 text-right">
                        {formatText(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                  Verification / KYC
                </h3>
                {selectedVerification ? (
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    {[
                      [
                        "Verification status",
                        formatTransferStatus(selectedVerification.status),
                      ],
                      ["KYC level", selectedVerification.level],
                      ["Document type", selectedVerification.documentType],
                      [
                        "Submitted date",
                        formatDate(selectedVerification.submittedAt),
                      ],
                      [
                        "Reviewed date",
                        formatDate(selectedVerification.reviewedAt),
                      ],
                      [
                        "Rejection reason",
                        selectedVerification.rejectionReason,
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-surface-low px-4 py-3"
                      >
                        <p className="font-bold text-slate-400">{label}</p>
                        <p className="mt-1 font-black text-navy-900">
                          {formatText(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-low px-4 py-3 text-sm font-bold text-slate-500">
                    No verification record
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                  Wallet / Escrow
                </h3>
                {selectedWallet ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                    {[
                      [
                        "Available balance",
                        selectedWallet.availableBalance.toFixed(2),
                      ],
                      [
                        "Escrow / reserved",
                        selectedWallet.escrowBalance.toFixed(2),
                      ],
                      ["Currency", selectedWallet.currency],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <p className="text-[10px] font-black uppercase text-slate-400">
                          {label}
                        </p>
                        <p className="mt-1 text-lg font-black text-navy-900">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-low px-4 py-3 text-sm font-bold text-slate-500">
                    No wallet found
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                  Transfer Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Total transfers", selectedTransfers.length],
                    ["Active transfers", activeTransfers.length],
                    ["Completed", completedTransfers.length],
                    ["Total volume", `$${totalVolume.toFixed(2)}`],
                    ["Total fees", `$${totalFees.toFixed(2)}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-surface-low p-4">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        {label}
                      </p>
                      <p className="mt-1 text-lg font-black text-navy-900">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-3">
                  Recent Transfers
                </h3>
                <div className="space-y-3">
                  {recentTransfers.map((transfer) => (
                    <button
                      key={transfer.id}
                      onClick={() =>
                        navigate(`/transfer/status/${transfer.id}`)
                      }
                      className="w-full rounded-xl border border-slate-100 p-4 text-left hover:border-teal-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-navy-900">
                            {transfer.id}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {transfer.sourceCountry} -&gt;{" "}
                            {transfer.destinationCountry}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(transfer.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-navy-900">
                            {transfer.amount.toFixed(2)} {transfer.currency}
                          </p>
                          <span
                            className={cn(
                              "mt-2",
                              transferStatusBadgeClass(transfer.status),
                            )}
                          >
                            {formatTransferStatus(transfer.status)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {recentTransfers.length === 0 && (
                    <div className="rounded-xl bg-surface-low px-4 py-3 text-sm font-bold text-slate-500">
                      No transfers yet
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export function MarketplacePage() {
  const [data, setData] = useState<ApiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void get<ApiAgent[]>("/agents")
      .then(setData)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, []);

  const agents = data.filter((agent) =>
    `${agent.name} ${agent.region} ${agent.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <MainLayout>
      <PageHeader
        title="Marketplace"
        subtitle="Browse verified agents available through the API."
      />
      <SearchBox value={query} onChange={setQuery} />
      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          Loading agents...
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedId(agent.id)}
            className={cn(
              "bg-white p-6 rounded-2xl border shadow-ambient text-left transition-all",
              selectedId === agent.id
                ? "border-teal-500 ring-4 ring-teal-500/10"
                : "border-slate-100 hover:border-teal-500/30",
            )}
          >
            <Store className="text-teal-600 mb-4" />
            <p className="font-black text-navy-900">{agent.name}</p>
            <p className="text-sm text-slate-500">
              {agent.region} - {agent.status}
            </p>
            <p className="text-xs font-bold text-slate-400 mt-3">
              Capacity ${agent.capacity.toLocaleString()}
            </p>
          </button>
        ))}
      </div>
    </MainLayout>
  );
}

export function WalletPage() {
  const { user } = useCurrentUser();
  const [wallets, setWallets] = useState<ApiWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    void walletService
      .getUserWallets(user.id)
      .then(setWallets)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const wallet = wallets[0];
  return (
    <MainLayout>
      <PageHeader
        title="Wallet"
        subtitle="Balances and escrow values returned by the API."
      />
      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          Loading wallet...
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}
      {wallet && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-ambient p-8 space-y-6">
          <Wallet className="text-teal-600" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-400">
                Balance
              </p>
              <p className="text-2xl font-black text-navy-900">
                {wallet.balance.toFixed(2)} {wallet.currency}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">
                Available
              </p>
              <p className="text-2xl font-black text-navy-900">
                {wallet.availableBalance.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">
                Escrow
              </p>
              <p className="text-2xl font-black text-navy-900">
                {wallet.escrowBalance.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Wallet deposits, withdrawals, and escrow movements are processed by
            backend payment services.
          </p>
        </div>
      )}
      {!loading && !error && !wallet && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          No wallet found for this account.
        </div>
      )}
    </MainLayout>
  );
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void Promise.all([
      transfersService.getAllTransfers(),
      disputesService.getDisputes(),
    ])
      .then(([transfers, disputes]) => {
        const completed = transfers.filter(
          (item) => item.status === "COMPLETED",
        );
        const failed = transfers.filter((item) => item.status === "FAILED");
        const pending = transfers.filter((item) =>
          [
            "PENDING_REQUEST",
            "MATCH_FOUND",
            "AWAITING_DEPOSIT",
            "DEPOSIT_PENDING",
          ].includes(item.status),
        );
        const volume = completed.reduce((sum, item) => sum + item.amount, 0);
        const revenue = transfers.reduce((sum, item) => sum + item.fee, 0);
        setData([
          {
            id: "volume",
            label: "Completed Volume",
            value: volume,
            suffix: " USD",
          },
          {
            id: "completed",
            label: "Completed Transfers",
            value: completed.length,
          },
          { id: "failed", label: "Failed Transfers", value: failed.length },
          {
            id: "disputes",
            label: "Open Disputes",
            value: disputes.filter((item) => item.status === "OPEN").length,
          },
          { id: "pending", label: "Pending Requests", value: pending.length },
          {
            id: "revenue",
            label: "Revenue From Fees",
            value: revenue,
            suffix: " USD",
          },
        ]);
      })
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Analytics"
        subtitle="Performance metrics calculated from API transfer and dispute data."
      />
      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          Loading analytics...
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {data.map((metric) => (
          <div
            key={metric.id}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-ambient"
          >
            <BarChart3 className="text-teal-600 mb-4" />
            <p className="text-xs font-black uppercase text-slate-400">
              {metric.label}
            </p>
            <p className="text-3xl font-black text-navy-900 mt-2">
              {metric.value.toLocaleString()}
              {metric.suffix ?? ""}
            </p>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export function RequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ApiTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void transfersService
      .getAllTransfers()
      .then((items) =>
        setRequests(
          items.filter((item) =>
            [
              "PENDING_REQUEST",
              "MATCH_FOUND",
              "AWAITING_DEPOSIT",
              "DEPOSIT_PENDING",
              "UNDER_REVIEW",
            ].includes(item.status),
          ),
        ),
      )
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <PageHeader
        title="Requests Queue"
        subtitle="Pending transfer requests returned by the API."
      />
      {loading && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
          Loading requests...
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-ambient"
          >
            <div className="flex justify-between gap-4">
              <div>
                <p className="font-black text-navy-900">{request.id}</p>
                <p className="text-sm text-slate-500">
                  {request.amount} {request.currency} from{" "}
                  {request.sourceCountry} to {request.destinationCountry}
                </p>
              </div>
              <span className="text-xs font-black text-slate-500">
                {formatTransferStatus(request.status)}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate(`/admin/requests/${request.id}`)}
                className="px-3 py-2 rounded-lg bg-slate-100 font-bold text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            No pending requests.
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export function RequestDetailPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState<ApiTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    void transfersService
      .getTransferById(requestId)
      .then(setRequest)
      .catch(() => setError("Request details could not be loaded."))
      .finally(() => setLoading(false));
  }, [requestId]);

  return (
    <MainLayout>
      <div className="bg-white border border-slate-100 rounded-2xl shadow-ambient p-8">
        <h1 className="text-2xl font-black text-navy-900 mb-2">
          Request Details
        </h1>
        {loading && (
          <p className="text-sm text-slate-500">Loading request details...</p>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
        {request && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-500">
            <p>
              <strong className="text-navy-900">Status:</strong>{" "}
              {formatTransferStatus(request.status)}
            </p>
            <p>
              <strong className="text-navy-900">Amount:</strong>{" "}
              {request.amount} {request.currency}
            </p>
            <p>
              <strong className="text-navy-900">From:</strong>{" "}
              {request.sourceCountry}
            </p>
            <p>
              <strong className="text-navy-900">To:</strong>{" "}
              {request.destinationCountry}
            </p>
            <p>
              <strong className="text-navy-900">Reference:</strong>{" "}
              {request.referenceNumber}
            </p>
            <p>
              <strong className="text-navy-900">Receiver:</strong>{" "}
              {request.receiverName}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export function NotificationsPage() {
  const { user } = useCurrentUser();
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const request = user?.id
      ? notificationsService.getUserNotifications(user.id)
      : Promise.resolve([]);
    setLoading(true);
    setError(null);
    void request
      .then(setNotifications)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const markRead = async (id: string) => {
    const updated = await notificationsService.markRead(id);
    setNotifications((items) =>
      items.map((item) => (item.id === id ? updated : item)),
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Notifications"
        subtitle="Read notifications from your API-backed inbox."
      />
      <div className="space-y-3">
        {loading && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            Loading notifications...
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}
        {notifications.map((item) => (
          <button
            key={item.id}
            onClick={() => markRead(item.id)}
            className="w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-ambient text-left"
          >
            <Bell
              className={
                item.read ? "text-slate-400 mb-3" : "text-teal-600 mb-3"
              }
            />
            <p className="font-bold text-navy-900">{item.title}</p>
            <p className="text-sm text-slate-500">{item.message}</p>
            <p className="text-xs text-slate-400 mt-1">
              {item.read ? "Read" : "Click to mark read"}
            </p>
          </button>
        ))}
        {!loading && !error && notifications.length === 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
