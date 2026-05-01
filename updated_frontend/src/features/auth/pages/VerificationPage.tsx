import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Check,
  FileText,
  Camera,
  Upload,
  ArrowRight,
  ArrowLeft,
  Circle,
  ShieldCheck,
  Image as ImageIcon,
  Plane,
  CreditCard,
  Lock,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { verificationService } from "@/services/verification.service";
import type { ApiVerification, VerificationStatus } from "@/services/types";

const steps = [
  { id: 1, label: "Personal Info", status: "complete" },
  { id: 2, label: "Identity Document", status: "current" },
  { id: 3, label: "Selfie", status: "upcoming" },
  { id: 4, label: "Payment Details", status: "upcoming" },
  { id: 5, label: "Under Review", status: "upcoming" },
];

export default function VerificationPage() {
  const { isAdmin, user } = useCurrentUser();
  const [docType, setDocType] = useState("passport");
  const [currentStep, setCurrentStep] = useState(2);
  const [uploaded, setUploaded] = useState(false);
  const [verification, setVerification] = useState<ApiVerification | null>(
    null,
  );
  const [status, setStatus] = useState<VerificationStatus | "IN_PROGRESS">(
    "IN_PROGRESS",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || isAdmin) return;
    setLoading(true);
    setError(null);
    void verificationService
      .getUserVerifications(user.id)
      .then((records) => {
        const current = records[0] ?? null;
        setVerification(current);
        setDocType(current?.documentType ?? "passport");
        setStatus(current?.status ?? "PENDING");
        if (current?.status === "VERIFIED") setCurrentStep(5);
      })
      .catch(() =>
        setError(
          "Verification status could not be loaded. Check that JSON Server is running.",
        ),
      )
      .finally(() => setLoading(false));
  }, [isAdmin, user?.id]);

  const submitVerification = async () => {
    if (!user?.id) return;
    setUploaded(true);
    setStatus("IN_REVIEW");
    setError(null);
    const payload: Partial<ApiVerification> = {
      userId: user.id,
      documentType: docType,
      status: "IN_REVIEW",
      level: verification?.level ?? "Basic",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewerId: null,
      rejectionReason: null,
    };

    try {
      const saved = verification
        ? await verificationService.updateVerification(verification.id, {
            documentType: docType,
            status: "IN_REVIEW",
            submittedAt: new Date().toISOString(),
            reviewedAt: null,
            reviewerId: null,
            rejectionReason: null,
          })
        : await verificationService.createVerification({
            id: `ver-${user.id}`,
            ...payload,
          });
      setVerification(saved);
      setCurrentStep(5);
    } catch {
      setError("Verification could not be submitted. Please try again.");
    }
  };

  const visibleSteps = useMemo(
    () =>
      steps.map((step) => ({
        ...step,
        status:
          step.id < currentStep
            ? "complete"
            : step.id === currentStep
              ? "current"
              : "upcoming",
      })),
    [currentStep],
  );

  const statusLabel = status.replace(/_/g, " ");

  if (isAdmin) {
    return <Navigate to="/admin/verification" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-bg flex">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-10 max-w-7xl mx-auto w-full flex-1">
          <header className="mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
              Identity Verification
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium mb-10 leading-relaxed">
              Complete your profile to unlock full platform features and higher
              limits.
            </p>
            {loading && (
              <div className="mb-6 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-500">
                Loading verification record...
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {/* Progress Tracker */}
            <div className="relative overflow-x-auto pb-4 hide-scrollbar">
              <div className="relative flex justify-between items-center min-w-[500px] sm:min-w-full px-2">
                <div className="absolute left-0 top-4 w-full h-[2px] bg-slate-100 -z-10" />
                <div
                  className="absolute left-0 top-4 h-[2px] bg-teal-500 -z-10 transition-all duration-1000"
                  style={{ width: `${Math.max(0, (currentStep - 1) * 25)}%` }}
                />

                {visibleSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center gap-2 px-1"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ring-4 ring-white transition-all shadow-sm",
                        step.status === "complete"
                          ? "bg-teal-600 text-white"
                          : step.status === "current"
                            ? "bg-white border-2 border-teal-500 text-teal-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                            : "bg-slate-100 text-slate-400",
                      )}
                    >
                      {step.status === "complete" ? (
                        <Check size={14} />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] sm:text-[11px] font-bold uppercase tracking-tighter whitespace-nowrap",
                        step.status !== "upcoming"
                          ? "text-navy-900"
                          : "text-slate-400",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-ambient p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-8">
                  Upload Document
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <button
                    onClick={() => setDocType("passport")}
                    className={cn(
                      "flex items-center justify-between p-5 border rounded-xl transition-all text-left",
                      docType === "passport"
                        ? "border-teal-500 bg-teal-50 ring-4 ring-teal-500/10"
                        : "border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Plane
                        className={cn(
                          "h-6 w-6",
                          docType === "passport"
                            ? "text-teal-600"
                            : "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-bold",
                          docType === "passport"
                            ? "text-teal-900"
                            : "text-slate-500",
                        )}
                      >
                        Passport
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center",
                        docType === "passport"
                          ? "border-teal-500 bg-teal-600"
                          : "border-slate-300",
                      )}
                    >
                      {docType === "passport" && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setDocType("id")}
                    className={cn(
                      "flex items-center justify-between p-5 border rounded-xl transition-all text-left",
                      docType === "id"
                        ? "border-teal-500 bg-teal-50 ring-4 ring-teal-500/10"
                        : "border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard
                        className={cn(
                          "h-6 w-6",
                          docType === "id" ? "text-teal-600" : "text-slate-400",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-bold",
                          docType === "id" ? "text-teal-900" : "text-slate-500",
                        )}
                      >
                        National ID
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center",
                        docType === "id"
                          ? "border-teal-500 bg-teal-600"
                          : "border-slate-300",
                      )}
                    >
                      {docType === "id" && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                  </button>
                </div>

                <div
                  onClick={() => setUploaded(true)}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:bg-slate-50 hover:border-teal-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    Click or drag file to upload
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mb-6">
                    PNG, JPG or PDF (Max. 10MB)
                  </p>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setUploaded(true);
                    }}
                    className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-navy-900 hover:bg-white shadow-sm transition-all active:scale-[0.98]"
                  >
                    {uploaded ? "File Selected" : "Select File"}
                  </button>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentStep((step) => Math.max(1, step - 1))
                    }
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-navy-900"
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>
                  <button
                    onClick={
                      currentStep >= 4
                        ? submitVerification
                        : () => setCurrentStep((step) => Math.min(4, step + 1))
                    }
                    className="flex items-center gap-2 px-8 py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-navy-800 transition-all shadow-elevated"
                  >
                    {currentStep >= 4 ? "Submit" : "Continue"}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-ambient p-6">
                <h3 className="text-lg font-bold text-navy-900 mb-6">
                  Current Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-teal-50 border border-teal-500/20 rounded-xl">
                    <CheckCircle2
                      className="text-teal-600 shrink-0"
                      size={24}
                    />
                    <div>
                      <p className="text-xs font-bold text-teal-900 uppercase tracking-widest leading-tight">
                        Basic Profile
                      </p>
                      <p className="text-sm font-bold text-teal-600">
                        Verified
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-surface-low border border-slate-200 rounded-xl">
                    <Hourglass className="text-slate-400 shrink-0" size={24} />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight">
                        Identity Verification
                      </p>
                      <p className="text-sm font-bold text-slate-400">
                        {statusLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-ambient p-6">
                <h3 className="text-lg font-bold text-navy-900 mb-6">
                  Verification Tiers
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Basic",
                      limit: "$1,000 / day",
                      status: "verified",
                      active: false,
                    },
                    {
                      label: "Verified",
                      limit: "$10,000 / day",
                      status: "pending",
                      active: true,
                    },
                    {
                      label: "Trusted",
                      limit: "$50,000 / day",
                      status: "locked",
                      active: false,
                    },
                  ].map((tier) => (
                    <div
                      key={tier.label}
                      className={cn(
                        "p-4 border rounded-xl transition-all",
                        tier.active
                          ? "border-teal-500 bg-white shadow-elevated ring-1 ring-teal-500"
                          : "border-slate-100 bg-surface-low opacity-60",
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {tier.status === "locked" && (
                            <Lock size={14} className="text-slate-400" />
                          )}
                          <span className="text-sm font-bold text-navy-900">
                            {tier.label}
                          </span>
                        </div>
                        {tier.status !== "locked" && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                              tier.status === "verified"
                                ? "bg-teal-50 text-teal-600"
                                : "bg-slate-100 text-slate-500",
                            )}
                          >
                            {tier.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500">
                        {tier.limit} limit
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
