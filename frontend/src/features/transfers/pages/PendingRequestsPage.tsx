import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw, X } from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import {
  formatTransferStatus,
  transferStatusBadgeClass,
} from "@/services/status";
import { transfersService } from "@/services/transfers.service";
import type { ApiTransfer } from "@/services/types";

export default function PendingRequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useCurrentUser();
  const [requests, setRequests] = useState<ApiTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    void transfersService
      .getPendingTransfers(user.id)
      .then(setRequests)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (
      typeof location.state === "object" &&
      location.state &&
      "message" in location.state
    ) {
      setMessage(String(location.state.message));
    }
  }, [location.state]);

  const checkForMatch = async (transferId: string) => {
    setCheckingId(transferId);
    setMessage("");
    setError("");
    try {
      const result =
        await transfersService.checkPendingTransferMatch(transferId);
      if (result.matched) {
        navigate(`/transfer/status/${result.transfer.id}`, {
          state: { message: "A matching transfer is available." },
        });
        return;
      }
      setRequests((items) =>
        items.map((item) =>
          item.id === result.transfer.id ? result.transfer : item,
        ),
      );
      setMessage("No match is available yet. Your request is still active.");
    } catch {
      setError(SERVER_CONNECTION_ERROR);
    } finally {
      setCheckingId(null);
    }
  };

  const cancelRequest = async (transferId: string) => {
    setCancellingId(transferId);
    setError("");
    try {
      await transfersService.cancelTransfer(transferId);
      setRequests((items) => items.filter((item) => item.id !== transferId));
    } catch {
      setError(SERVER_CONNECTION_ERROR);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <MainLayout>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
            Pending Requests
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Requests waiting for a compatible opposite transfer.
          </p>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </header>

      {message && (
        <div className="mb-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            Loading pending requests...
          </div>
        )}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            No pending requests.
          </div>
        )}
        {requests.map((request) => (
          <article
            key={request.id}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-ambient"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className={transferStatusBadgeClass(request.status)}>
                  {formatTransferStatus(request.status)}
                </span>
                <p className="mt-3 text-xl font-black text-navy-900">
                  {request.amount.toFixed(2)} {request.currency}
                </p>
                <p className="text-sm font-bold text-slate-400">
                  {request.sourceCountry}{" "}
                  <ArrowRight className="inline size-3" />{" "}
                  {request.destinationCountry}
                </p>
              </div>
              <div className="text-left sm:text-right text-sm text-slate-500">
                <p>
                  Expected receive:{" "}
                  <span className="font-black text-navy-900">
                    {request.netAmount.toFixed(2)} {request.currency}
                  </span>
                </p>
                <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
                <p>
                  Match status:{" "}
                  {request.counterpartyTransferId ? "Linked" : "Waiting"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                disabled={checkingId === request.id}
                onClick={() => checkForMatch(request.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={checkingId === request.id ? "animate-spin" : ""}
                />
                {checkingId === request.id ? "Checking..." : "Check for Match"}
              </button>
              <button
                type="button"
                disabled={cancellingId === request.id}
                onClick={() => cancelRequest(request.id)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
              >
                <X size={16} />
                {cancellingId === request.id
                  ? "Cancelling..."
                  : "Cancel Request"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </MainLayout>
  );
}
