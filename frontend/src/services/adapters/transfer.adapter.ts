import type { ApiTransfer, TransferStatus } from "../types";
import {
  dropUndefined,
  isRecord,
  readBoolean,
  readNumber,
  readString,
  type UnknownRecord,
} from "./adapterUtils";

const statusMap: Record<string, TransferStatus> = {
  "Pending Request": "PENDING_REQUEST",
  PENDING_REQUEST: "PENDING_REQUEST",
  PENDING_MATCH: "PENDING_REQUEST",
  WAITING_FOR_MATCH: "PENDING_REQUEST",
  MATCH_PENDING: "PENDING_REQUEST",
  NO_MATCH_FOUND: "PENDING_REQUEST",
  "Match Found": "MATCH_FOUND",
  MATCH_FOUND: "MATCH_FOUND",
  MATCHED: "MATCH_FOUND",
  "Awaiting Deposits": "AWAITING_DEPOSIT",
  AWAITING_DEPOSIT: "AWAITING_DEPOSIT",
  DEPOSIT_PENDING: "DEPOSIT_PENDING",
  "Deposit Confirmed Partially": "DEPOSIT_CONFIRMED",
  DEPOSIT_CONFIRMED: "DEPOSIT_CONFIRMED",
  ESCROW_FUNDED: "DEPOSIT_CONFIRMED",
  "Both Deposits Confirmed": "BOTH_DEPOSITS_CONFIRMED",
  BOTH_DEPOSITS_CONFIRMED: "BOTH_DEPOSITS_CONFIRMED",
  "Processing Payouts": "PROCESSING_PAYOUT",
  PROCESSING_PAYOUT: "PROCESSING_PAYOUT",
  READY_FOR_PAYOUT: "PROCESSING_PAYOUT",
  Completed: "COMPLETED",
  COMPLETED: "COMPLETED",
  "Under Review": "UNDER_REVIEW",
  UNDER_REVIEW: "UNDER_REVIEW",
  RISK_REVIEW: "UNDER_REVIEW",
  Disputed: "DISPUTED",
  DISPUTED: "DISPUTED",
  Refunded: "REFUNDED",
  REFUNDED: "REFUNDED",
  Failed: "FAILED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REJECTED: "CANCELLED",
};

export function normalizeTransferStatus(status: unknown): TransferStatus {
  return statusMap[String(status)] ?? "PENDING_REQUEST";
}

export function toTransfer(raw: unknown): ApiTransfer {
  const source = isRecord(raw) ? raw : {};
  const amount = readNumber(source, ["amount"]);
  const fee = readNumber(source, ["fee", "feeAmount", "fee_amount"]);
  const exchangeRate = readNumber(source, ["exchangeRate", "exchange_rate"], 1);
  const netAmount = readNumber(
    source,
    [
      "netAmount",
      "net_amount",
      "expectedReceiveAmount",
      "expected_receive_amount",
    ],
    Math.max(amount - fee, 0) * exchangeRate,
  );

  return {
    id: readString(source, ["id"]),
    userId: readString(source, ["userId", "user_id"]),
    sourceCountry: readString(source, [
      "sourceCountry",
      "source_country",
      "fromCountry",
      "from_country",
    ]),
    destinationCountry: readString(source, [
      "destinationCountry",
      "destination_country",
      "toCountry",
      "to_country",
    ]),
    amount,
    currency: readString(
      source,
      ["currency"],
      "USD",
    ) as ApiTransfer["currency"],
    fee,
    exchangeRate,
    netAmount,
    status: normalizeTransferStatus(source.status),
    paymentMethod: readString(source, ["paymentMethod", "payment_method"]),
    receiverName: readString(source, ["receiverName", "receiver_name"]),
    receiverPaymentMethod: readString(source, [
      "receiverPaymentMethod",
      "receiver_payment_method",
    ]),
    referenceNumber: readString(source, [
      "referenceNumber",
      "reference_number",
    ]),
    createdAt: readString(source, ["createdAt", "created_at"]),
    updatedAt: readString(source, ["updatedAt", "updated_at"]),
    riskLevel: readString(
      source,
      ["riskLevel", "risk_level"],
      "low",
    ) as ApiTransfer["riskLevel"],
    paymentConfirmationRequested: readBoolean(source, [
      "paymentConfirmationRequested",
      "payment_confirmation_requested",
    ]),
    counterpartyTransferId:
      readString(source, [
        "counterpartyTransferId",
        "counterparty_transfer_id",
      ]) || null,
    matchId: readString(source, ["matchId", "match_id"]) || null,
  };
}

export function toTransfers(raw: unknown): ApiTransfer[] {
  return Array.isArray(raw) ? raw.map(toTransfer) : [];
}

export function fromTransferPayload(
  payload: Partial<ApiTransfer>,
): UnknownRecord {
  return dropUndefined({
    id: payload.id,
    userId: payload.userId,
    sourceCountry: payload.sourceCountry,
    destinationCountry: payload.destinationCountry,
    amount: payload.amount,
    currency: payload.currency,
    fee: payload.fee,
    exchangeRate: payload.exchangeRate,
    netAmount: payload.netAmount,
    status: payload.status
      ? normalizeTransferStatus(payload.status)
      : undefined,
    paymentMethod: payload.paymentMethod,
    receiverName: payload.receiverName,
    receiverPaymentMethod: payload.receiverPaymentMethod,
    referenceNumber: payload.referenceNumber,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    riskLevel: payload.riskLevel,
    paymentConfirmationRequested: payload.paymentConfirmationRequested,
    counterpartyTransferId: payload.counterpartyTransferId,
  });
}
