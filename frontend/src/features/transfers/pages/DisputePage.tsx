import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "@/shared/components/layout/Footer";
import Navbar from "@/shared/components/layout/Navbar";
import Sidebar from "@/shared/components/layout/Sidebar";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { disputesService } from "@/services/disputes.service";
export default function DisputePage() {
  const navigate = useNavigate();
  const { txId } = useParams();
  const { user } = useCurrentUser();
  const [reason, setReason] = useState("");
  const [evidenceRef, setEvidenceRef] = useState("GW-REF-9021");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txId) {
      await disputesService.openDispute({
        id: `dsp-${Date.now()}`,
        transferId: txId,
        userId: user?.id ?? "unknown",
        reason: reason.trim(),
        evidence: evidenceRef.trim(),
        status: "OPEN",
        resolution: null,
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      });
    }
    navigate(`/transfer/status/${txId}`);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-8 lg:px-10 max-w-3xl mx-auto w-full flex-1">
          <form
            onSubmit={submit}
            className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-ambient space-y-5"
          >
            <h1 className="text-2xl font-black">Open Dispute</h1>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Reason for dispute
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-32 rounded-xl border border-slate-300 p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                Evidence reference
              </label>
              <input
                value={evidenceRef}
                onChange={(e) => setEvidenceRef(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-navy-900 text-white font-bold"
              >
                Submit Dispute
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}
