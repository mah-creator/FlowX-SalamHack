import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/shared/utils";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { SERVER_CONNECTION_ERROR } from "@/services/apiClient";
import {
  formatTransferStatus,
  transferStatusBadgeClass,
} from "@/services/status";
import { transfersService } from "@/services/transfers.service";
import type { ApiTransfer, TransferStatus } from "@/services/types";

const steps = [
  "Submitted",
  "Match Found",
  "Escrow",
  "Processing Payout",
  "Completed",
];

function stepIndex(status: TransferStatus): number {
  if (
    [
      "PENDING_REQUEST",
      "PENDING_MATCH",
      "WAITING_FOR_MATCH",
      "MATCH_PENDING",
      "NO_MATCH_FOUND",
    ].includes(status)
  )
    return 0;
  if (["MATCH_FOUND", "MATCHED"].includes(status)) return 1;
  if (
    [
      "AWAITING_DEPOSIT",
      "DEPOSIT_PENDING",
      "ESCROW_FUNDED",
      "DEPOSIT_CONFIRMED",
      "BOTH_DEPOSITS_CONFIRMED",
    ].includes(status)
  )
    return 2;
  if (
    [
      "PROCESSING_PAYOUT",
      "READY_FOR_PAYOUT",
      "UNDER_REVIEW",
      "DISPUTED",
    ].includes(status)
  )
    return 3;
  return 4;
}

export default function TransactionStatusPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isUser } = useCurrentUser();
  const [tx, setTx] = useState<ApiTransfer | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    void transfersService
      .getTransferStatus(id)
      .then(setTx)
      .catch(() => setError(SERVER_CONNECTION_ERROR))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <MainShell>Loading transaction status...</MainShell>;
  if (error) return <MainShell>{error}</MainShell>;
  if (!tx) return <MainShell>Transaction not found.</MainShell>;

  const current = stepIndex(tx.status);
  const successMessage =
    typeof location.state === "object" &&
    location.state &&
    "message" in location.state
      ? String(location.state.message)
      : "";
  const showPaymentInstructions = [
    "AWAITING_DEPOSIT",
    "DEPOSIT_PENDING",
  ].includes(tx.status);
  const canAcceptMatch = ["MATCH_FOUND", "MATCHED"].includes(tx.status);
  const canCancel =
    [
      "PENDING_REQUEST",
      "PENDING_MATCH",
      "WAITING_FOR_MATCH",
      "MATCH_PENDING",
      "NO_MATCH_FOUND",
      "MATCH_FOUND",
      "MATCHED",
      "AWAITING_DEPOSIT",
    ].includes(tx.status) && !tx.paymentConfirmationRequested;
  const canDispute = [
    "AWAITING_DEPOSIT",
    "DEPOSIT_CONFIRMED",
    "BOTH_DEPOSITS_CONFIRMED",
    "PROCESSING_PAYOUT",
    "READY_FOR_PAYOUT",
    "COMPLETED",
  ].includes(tx.status);

  const requestPaymentConfirmation = async () => {
    setActionLoading("payment");
    const updated = await transfersService.requestPaymentConfirmation(tx.id);
    setTx(updated);
    setMessage(
      "Payment confirmation request sent. FlowX will verify your deposit through the payment provider.",
    );
    setActionLoading("");
  };

  const acceptMatch = async () => {
    setActionLoading("accept");
    try {
      const updated = await transfersService.acceptMatch(
        tx.id,
        tx.matchId ?? tx.counterpartyTransferId,
      );
      navigate(`/transfer/escrow/${updated.id}`, {
        state: { message: "Match accepted. Confirm escrow deposit next." },
      });
    } catch {
      setMessage(SERVER_CONNECTION_ERROR);
      setActionLoading("");
    }
  };

  const rejectMatch = async () => {
    setActionLoading("reject");
    try {
      const updated = await transfersService.rejectMatch(
        tx.id,
        tx.matchId ?? tx.counterpartyTransferId,
      );
      setTx(updated);
      setMessage("Match rejected.");
    } catch {
      setMessage(SERVER_CONNECTION_ERROR);
    } finally {
      setActionLoading("");
    }
  };

  const cancelRequest = async () => {
    await transfersService.cancelTransfer(tx.id);
    navigate("/transfers");
  };

  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-5xl mx-auto w-full flex-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-ambient space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black">Transaction Status</h1>
                <p className="text-sm text-slate-500">
                  {isAdmin
                    ? "Admin transaction view"
                    : "User transfer tracking view"}
                </p>
              </div>
              <span className={transferStatusBadgeClass(tx.status)}>
                {formatTransferStatus(tx.status)}
              </span>
            </div>

            <div className="flex justify-between items-center gap-2">
              {steps.map((step, index) => (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={cn(
                      "w-7 h-7 mx-auto rounded-full text-xs font-bold flex items-center justify-center",
                      index <= current
                        ? "bg-teal-600 text-white"
                        : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {index + 1}
                  </div>
                  <p className="text-[10px] mt-2 font-bold uppercase tracking-wider">
                    {step}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Amount
                </p>
                <p className="text-xl font-black text-navy-900">
                  {tx.amount.toFixed(2)} {tx.currency}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Net Amount
                </p>
                <p className="text-xl font-black text-navy-900">
                  {tx.netAmount.toFixed(2)} {tx.currency}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Route
                </p>
                <p className="text-xl font-black text-navy-900">
                  {tx.sourceCountry} &gt; {tx.destinationCountry}
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-sm font-bold text-teal-700">
                {successMessage}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Payment Method
                </p>
                <p className="font-bold text-navy-900">{tx.paymentMethod}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Receiver
                </p>
                <p className="font-bold text-navy-900">
                  {tx.receiverName} - {tx.receiverPaymentMethod}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Reference
                </p>
                <p className="font-bold text-navy-900">{tx.referenceNumber}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">
                  Created
                </p>
                <p className="font-bold text-navy-900">
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {showPaymentInstructions && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="font-bold text-navy-900">Payment Instructions</p>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <p>
                    <span className="block text-[10px] font-black uppercase text-slate-400">
                      Payment method
                    </span>
                    {tx.paymentMethod}
                  </p>
                  <p>
                    <span className="block text-[10px] font-black uppercase text-slate-400">
                      Reference number
                    </span>
                    {tx.referenceNumber}
                  </p>
                  <p>
                    <span className="block text-[10px] font-black uppercase text-slate-400">
                      Amount to pay
                    </span>
                    {tx.amount.toFixed(2)} {tx.currency}
                  </p>
                  <p>
                    <span className="block text-[10px] font-black uppercase text-slate-400">
                      Deposit status
                    </span>
                    {formatTransferStatus(tx.status)}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  After completing payment, FlowX will verify your deposit
                  through the payment provider. You will be notified once
                  confirmed.
                </p>
                {isUser && (
                  <button
                    type="button"
                    onClick={requestPaymentConfirmation}
                    disabled={actionLoading === "payment"}
                    className="px-4 py-2 rounded-xl bg-navy-900 text-white font-semibold"
                  >
                    {actionLoading === "payment"
                      ? "Sending..."
                      : "I have completed payment"}
                  </button>
                )}
              </div>
            )}

            {isUser && canAcceptMatch && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-3">
                <p className="font-bold text-teal-800">Match Details</p>
                <p className="text-sm text-teal-800">
                  A compatible opposite transfer is available. Accept the match
                  to continue to escrow deposit.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={actionLoading === "accept"}
                    onClick={acceptMatch}
                    className="px-4 py-2 rounded-xl bg-navy-900 text-white font-semibold disabled:opacity-60"
                  >
                    {actionLoading === "accept"
                      ? "Accepting..."
                      : "Accept Match"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === "reject"}
                    onClick={rejectMatch}
                    className="px-4 py-2 rounded-xl bg-white border border-teal-100 text-teal-700 font-semibold disabled:opacity-60"
                  >
                    {actionLoading === "reject"
                      ? "Rejecting..."
                      : "Reject Match"}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-sm font-bold text-teal-700">
                {message}
              </div>
            )}

            {tx.status === "COMPLETED" && (
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100">
                <p className="font-bold text-teal-700">Transfer Completed</p>
                <p className="text-sm">
                  TX ID: {tx.id} | Created:{" "}
                  {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
            )}

            {["FAILED", "REFUNDED"].includes(tx.status) && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <p className="font-bold text-rose-700">
                  {formatTransferStatus(tx.status)}
                </p>
                <p className="text-sm text-rose-600">
                  This transfer is closed. Contact operations if you need more
                  details.
                </p>
              </div>
            )}

            {isUser && canDispute && (
              <Link
                to={`/transfer/dispute/${tx.id}`}
                className="inline-block px-4 py-2 rounded-xl bg-red-100 text-red-700 font-semibold"
              >
                Open Dispute
              </Link>
            )}

            {isUser && canCancel && (
              <button
                type="button"
                onClick={cancelRequest}
                className="inline-block ml-2 px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel Request
              </button>
            )}

            {isAdmin && (
              <div className="border-t border-slate-100 pt-4 text-sm text-slate-500">
                Admin decisions are processed through API endpoints from the
                relevant review queues.
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function MainShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-bg flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-5xl mx-auto w-full flex-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-sm text-slate-500">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
