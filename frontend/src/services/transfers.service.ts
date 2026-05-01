import { get, patch, post } from "./apiClient";
import {
  fromTransferPayload,
  toTransfer,
  toTransfers,
} from "./adapters/transfer.adapter";
import type { ApiTransfer, TransferStatus } from "./types";

type TransferPayload = Partial<ApiTransfer>;

const pendingStatuses: TransferStatus[] = ["PENDING_REQUEST"];

function now() {
  return new Date().toISOString();
}

function isMatchFound(transfer: ApiTransfer) {
  return (
    transfer.status === "MATCH_FOUND" ||
    Boolean(transfer.counterpartyTransferId)
  );
}

async function getTransfersRaw() {
  return get<unknown>("/transfers");
}

export const transfersService = {
  getTransfers: async () => toTransfers(await getTransfersRaw()),
  getUserTransfers: async (userId: string) => {
    const transfers = toTransfers(await getTransfersRaw());
    return transfers.filter((transfer) => transfer.userId === userId);
  },
  getAllTransfers: async () => toTransfers(await getTransfersRaw()),
  getTransferById: async (id: string) =>
    toTransfer(await get<unknown>(`/transfers/${encodeURIComponent(id)}`)),
  getTransferStatus: async (id: string) =>
    toTransfer(await get<unknown>(`/transfers/${encodeURIComponent(id)}`)),
  createTransfer: async (payload: TransferPayload) =>
    toTransfer(await post<unknown>("/transfers", fromTransferPayload(payload))),
  updateTransfer: async (id: string, payload: TransferPayload) =>
    toTransfer(
      await patch<unknown>(
        `/transfers/${encodeURIComponent(id)}`,
        fromTransferPayload(payload),
      ),
    ),
  getPendingTransfers: async (userId: string) => {
    const transfers = toTransfers(await getTransfersRaw());
    return transfers.filter(
      (transfer) =>
        transfer.userId === userId && pendingStatuses.includes(transfer.status),
    );
  },
  placeTransferAsPending: async (id: string) =>
    toTransfer(
      await patch<unknown>(`/transfers/${encodeURIComponent(id)}`, {
        status: "PENDING_REQUEST",
        updatedAt: now(),
      }),
    ),
  checkPendingTransferMatch: async (id: string) => {
    const transfer = toTransfer(
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/match-request`),
    );
    return {
      transfer,
      matched: isMatchFound(transfer),
      matchId: transfer.counterpartyTransferId ?? null,
    };
  },
  acceptMatch: async (id: string, _matchId?: string | null) =>
    toTransfer(await get<unknown>(`/transfers/${encodeURIComponent(id)}`)),
  rejectMatch: async (id: string, _matchId?: string | null) =>
    toTransfer(
      await patch<unknown>(`/transfers/${encodeURIComponent(id)}`, {
        status: "CANCELLED",
        updatedAt: now(),
      }),
    ),
  simulateEscrowDeposit: async (id: string) => {
    try {
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/submit`);
    } catch {
      // If the transfer is already past MATCH_FOUND, keep moving through the API patch surface.
    }

    return toTransfer(
      await patch<unknown>(`/transfers/${encodeURIComponent(id)}`, {
        status: "COMPLETED",
        paymentConfirmationRequested: true,
        updatedAt: now(),
      }),
    );
  },
  refundTransfer: async (id: string, reason?: string) =>
    toTransfer(
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/refund`, {
        reason,
      }),
    ),
  approveRisk: async (id: string) =>
    toTransfer(
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/risk-approval`),
    ),
  rejectRisk: async (id: string, reason?: string) =>
    toTransfer(
      await post<unknown>(
        `/transfers/${encodeURIComponent(id)}/risk-rejection`,
        {
          reason,
        },
      ),
    ),
  cancelTransfer: async (id: string) =>
    toTransfer(
      await patch<unknown>(`/transfers/${encodeURIComponent(id)}`, {
        status: "CANCELLED",
        updatedAt: now(),
      }),
    ),
  submitTransfer: async (id: string) =>
    toTransfer(
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/submit`),
    ),
  requestTransferMatch: async (id: string) =>
    toTransfer(
      await post<unknown>(`/transfers/${encodeURIComponent(id)}/match-request`),
    ),
  requestPaymentConfirmation: async (id: string) =>
    toTransfer(
      await patch<unknown>(`/transfers/${encodeURIComponent(id)}`, {
        paymentConfirmationRequested: true,
        updatedAt: now(),
      }),
    ),
  openDispute: (
    transferId: string,
    payload: { userId: string; reason: string; evidence: string },
  ) =>
    post("/disputes", {
      id: `dsp-${Date.now()}`,
      transferId,
      status: "OPEN",
      createdAt: now(),
      resolvedAt: null,
      resolution: null,
      ...payload,
    }),
};
