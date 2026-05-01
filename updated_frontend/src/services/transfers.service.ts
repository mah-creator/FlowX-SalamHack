import { get, patch, post } from "./apiClient";
import type { ApiTransfer } from "./types";

export const transfersService = {
  getUserTransfers: (userId: string) =>
    get<ApiTransfer[]>(`/transfers?userId=${encodeURIComponent(userId)}`),
  getAllTransfers: () => get<ApiTransfer[]>("/transfers"),
  getTransferById: (id: string) =>
    get<ApiTransfer>(`/transfers/${encodeURIComponent(id)}`),
  getTransferStatus: (id: string) =>
    get<ApiTransfer>(`/transfers/${encodeURIComponent(id)}`),
  createTransfer: (payload: Partial<ApiTransfer>) =>
    post<ApiTransfer>("/transfers", payload),
  updateTransfer: (id: string, payload: Partial<ApiTransfer>) =>
    patch<ApiTransfer>(`/transfers/${encodeURIComponent(id)}`, payload),
  cancelTransfer: (id: string) =>
    patch<ApiTransfer>(`/transfers/${encodeURIComponent(id)}`, {
      status: "CANCELLED",
      updatedAt: new Date().toISOString(),
    }),
  submitTransfer: (id: string) =>
    post<ApiTransfer>(`/transfers/${encodeURIComponent(id)}/submit`),
  requestTransferMatch: (id: string) =>
    post<ApiTransfer>(`/transfers/${encodeURIComponent(id)}/match-request`),
  requestPaymentConfirmation: (id: string) =>
    patch<ApiTransfer>(`/transfers/${encodeURIComponent(id)}`, {
      paymentConfirmationRequested: true,
      updatedAt: new Date().toISOString(),
    }),
  openDispute: (
    transferId: string,
    payload: { userId: string; reason: string; evidence: string },
  ) =>
    post("/disputes", {
      id: `dsp-${Date.now()}`,
      transferId,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      resolution: null,
      ...payload,
    }),
};
