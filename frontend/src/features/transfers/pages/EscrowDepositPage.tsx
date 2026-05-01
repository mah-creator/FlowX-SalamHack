import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import MainLayout from "@/layouts/MainLayout";
import { SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import {
  formatTransferStatus,
  transferStatusBadgeClass,
} from "@/services/status";
import { transfersService } from "@/services/transfers.service";
import type { ApiTransfer } from "@/services/types";

export default function EscrowDepositPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<ApiTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    void transfersService
      .getTransferStatus(id)
      .then(setTransfer)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [id]);

  const simulateDeposit = async () => {
    if (!transfer) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = await transfersService.simulateEscrowDeposit(transfer.id);
      navigate(`/transfer/status/${updated.id}`, {
        state: { message: "Escrow deposit confirmed." },
      });
    } catch {
      setError(SERVER_CONNECTION_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white border border-slate-100 rounded-3xl shadow-elevated p-6 sm:p-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900">
              Escrow Deposit
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Confirm the sender deposit after the match is accepted.
            </p>
          </div>
          {transfer && (
            <span className={transferStatusBadgeClass(transfer.status)}>
              {formatTransferStatus(transfer.status)}
            </span>
          )}
        </header>

        {loading && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Loading deposit details...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
        {!loading && !error && !transfer && (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Transfer details were not found.
          </div>
        )}

        {transfer && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                [
                  "Transfer amount",
                  `${transfer.amount.toFixed(2)} ${transfer.currency}`,
                ],
                ["Fee", `${transfer.fee.toFixed(2)} ${transfer.currency}`],
                [
                  "Total deposit",
                  `${(transfer.amount + transfer.fee).toFixed(2)} ${transfer.currency}`,
                ],
                [
                  "Receiver expected",
                  `${transfer.netAmount.toFixed(2)} ${transfer.currency}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-black text-navy-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
              <p>
                Counterparty:{" "}
                <span className="font-black text-navy-900">
                  {transfer.counterpartyTransferId ??
                    transfer.matchId ??
                    "Assigned by API"}
                </span>
              </p>
              <p>
                Route:{" "}
                <span className="font-black text-navy-900">
                  {transfer.sourceCountry} to {transfer.destinationCountry}
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={simulateDeposit}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-elevated hover:bg-teal-500 disabled:opacity-60"
            >
              <CheckCircle2 size={18} />
              {submitting ? "Confirming..." : "Simulate Escrow Deposit"}
            </button>
          </>
        )}
      </div>
    </MainLayout>
  );
}
