export type ApiRole = "USER" | "ADMIN";

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: ApiRole;
  accountType: "Individual" | "Business" | "Admin";
  country: string;
  phone: string;
  verified: boolean;
  kycLevel: "Basic" | "Verified" | "Trusted" | "Agent";
  verificationStatus?:
    | "PENDING"
    | "IN_REVIEW"
    | "VERIFIED"
    | "REJECTED"
    | "NEEDS_INFO";
  trustScore: number;
  status: "active" | "pending" | "suspended";
  createdAt: string;
};

export type TransferStatus =
  | "PENDING_REQUEST"
  | "PENDING_MATCH"
  | "WAITING_FOR_MATCH"
  | "MATCH_PENDING"
  | "NO_MATCH_FOUND"
  | "MATCH_FOUND"
  | "MATCHED"
  | "AWAITING_DEPOSIT"
  | "DEPOSIT_PENDING"
  | "ESCROW_FUNDED"
  | "DEPOSIT_CONFIRMED"
  | "BOTH_DEPOSITS_CONFIRMED"
  | "PROCESSING_PAYOUT"
  | "READY_FOR_PAYOUT"
  | "COMPLETED"
  | "UNDER_REVIEW"
  | "RISK_REVIEW"
  | "DISPUTED"
  | "REFUNDED"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED";

export type ApiTransfer = {
  id: string;
  userId: string;
  sourceCountry: string;
  destinationCountry: string;
  amount: number;
  currency: "USD" | "EGP" | "ILS";
  fee: number;
  exchangeRate: number;
  netAmount: number;
  status: TransferStatus;
  paymentMethod: string;
  receiverName: string;
  receiverPaymentMethod: string;
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
  riskLevel: "low" | "medium" | "high";
  paymentConfirmationRequested: boolean;
  counterpartyTransferId?: string | null;
  matchId?: string | null;
};

export type ApiWallet = {
  id: string;
  userId: string;
  balance: number;
  currency: "USD" | "EGP" | "ILS";
  escrowBalance: number;
  availableBalance: number;
};

export type VerificationStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "NEEDS_INFO";

export type ApiVerification = {
  id: string;
  userId: string;
  status: VerificationStatus;
  level: "Basic" | "Verified" | "Trusted" | "Agent";
  documentType: string;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  rejectionReason?: string | null;
};

export type ApiDispute = {
  id: string;
  transferId: string;
  userId: string;
  reason: string;
  evidence: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
};

export type ApiNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "transfer" | "kyc" | "admin" | "wallet" | "system";
  createdAt: string;
};

export type ApiConfig = {
  id?: string;
  feePercent: number;
  exchangeRate: number;
  supportedCountries: string[];
  supportedCurrencies: Array<"USD" | "EGP" | "ILS">;
  supportedCorridors?: Array<{ source: string; destination: string }>;
  paymentWindowMinutes: number;
};

export type ApiAuditLog = {
  id: string;
  actorId: string;
  actorRole: ApiRole;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

export type ApiTransactionStatus =
  | "Pending Request"
  | "Match Found"
  | "Awaiting Deposits"
  | "Deposit Confirmed Partially"
  | "Both Deposits Confirmed"
  | "Processing Payouts"
  | "Completed"
  | "Under Review"
  | "Failed"
  | "Refunded"
  | "Disputed";

export type ApiTransaction = {
  id: string;
  source: string;
  destination: string;
  amount: number;
  currency: "USD" | "EGP" | "ILS";
  status: ApiTransactionStatus;
  feePercent: number;
  exchangeRate: number;
  receivableAmount: number;
  createdAt: string;
  depositA: boolean;
  depositB: boolean;
  disputeReason?: string | null;
  auditLog?: Array<{
    time: string;
    actor: string;
    action: string;
  }>;
};

export type ApiHealth = {
  status: string;
  service?: string;
  version?: string;
};
