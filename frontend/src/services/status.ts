import { cn } from "@/shared/utils";
import type { TransferStatus } from "./types";

const labels: Partial<Record<TransferStatus | string, string>> = {
  PENDING_REQUEST: "Waiting for Match",
  PENDING_MATCH: "Waiting for Match",
  WAITING_FOR_MATCH: "Waiting for Match",
  MATCH_PENDING: "Waiting for Match",
  NO_MATCH_FOUND: "No Match Yet",
  MATCH_FOUND: "Match Found",
  MATCHED: "Match Found",
  AWAITING_DEPOSIT: "Awaiting Deposit",
  DEPOSIT_PENDING: "Awaiting Deposit",
  ESCROW_FUNDED: "Deposit Confirmed",
  DEPOSIT_CONFIRMED: "Deposit Confirmed",
  BOTH_DEPOSITS_CONFIRMED: "Deposit Confirmed",
  PROCESSING_PAYOUT: "Processing Payout",
  READY_FOR_PAYOUT: "Ready for Payout",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  DISPUTED: "Disputed",
  UNDER_REVIEW: "Under Review",
  RISK_REVIEW: "Under Review",
  PENDING: "Pending",
  IN_REVIEW: "In Review",
  VERIFIED: "Verified",
  NEEDS_INFO: "Needs Info",
};

export function formatTransferStatus(status?: string | null) {
  if (!status) return "Unknown";
  return labels[status as TransferStatus] ?? status.replace(/_/g, " ");
}

export function transferStatusBadgeClass(status?: string | null) {
  return cn(
    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
    [
      "COMPLETED",
      "READY_FOR_PAYOUT",
      "ESCROW_FUNDED",
      "DEPOSIT_CONFIRMED",
    ].includes(status ?? "")
      ? "bg-teal-50 text-teal-700 ring-1 ring-teal-500/15"
      : ["CANCELLED", "REJECTED", "FAILED", "REFUNDED"].includes(status ?? "")
        ? "bg-rose-50 text-rose-700 ring-1 ring-rose-500/15"
        : ["MATCH_FOUND", "MATCHED"].includes(status ?? "")
          ? "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500/15"
          : status === "NO_MATCH_FOUND"
            ? "bg-slate-50 text-slate-600 ring-1 ring-slate-500/15"
            : "bg-amber-50 text-amber-700 ring-1 ring-amber-500/15",
  );
}
