import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  FileText,
  Info,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";
import { adminService } from "@/services/admin.service";
import { usersService } from "@/services/users.service";
import { verificationService } from "@/services/verification.service";
import type { ApiUser, ApiVerification } from "@/services/types";
import { cn } from "@/shared/utils";

type QueueRow = ApiVerification & {
  user?: ApiUser;
};

const statusStyles: Record<string, string> = {
  VERIFIED: "bg-teal-50 text-teal-600",
  PENDING: "bg-amber-50 text-amber-700",
  IN_REVIEW: "bg-amber-50 text-amber-700",
  NEEDS_INFO: "bg-sky-50 text-sky-700",
  REJECTED: "bg-rose-50 text-rose-600",
};

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function AdminVerificationQueuePage() {
  const { user, isAdmin } = useCurrentUser();
  const [verifications, setVerifications] = useState<ApiVerification[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<QueueRow | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const [verificationRecords, userRecords] = await Promise.all([
        verificationService.getAllVerifications(),
        usersService.getUsers(),
      ]);
      setVerifications(verificationRecords);
      setUsers(userRecords);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const rows = useMemo<QueueRow[]>(() => {
    return verifications
      .map((verification) => ({
        ...verification,
        user: users.find((item) => item.id === verification.userId),
      }))
      .filter((row) => {
        const haystack =
          `${row.user?.fullName ?? ""} ${row.user?.email ?? ""} ${row.user?.country ?? ""} ${row.documentType} ${row.status}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
  }, [query, users, verifications]);

  const replaceVerification = (updated: ApiVerification) => {
    setVerifications((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const approve = async (verification: ApiVerification) => {
    replaceVerification(
      await adminService.approveVerification(
        verification.userId,
        verification.id,
        user?.id,
      ),
    );
  };

  const reject = async (verification: ApiVerification) => {
    replaceVerification(
      await adminService.rejectVerification(
        verification.userId,
        verification.id,
        "Rejected by admin",
        user?.id,
      ),
    );
  };

  const requestInfo = async (verification: ApiVerification) => {
    replaceVerification(
      await adminService.requestMoreInfo(
        verification.userId,
        verification.id,
        "Additional documentation requested",
        user?.id,
      ),
    );
  };

  if (!isAdmin) {
    return <Navigate to="/verification" replace />;
  }

  return (
    <MainLayout>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">
            Verification Queue
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
            Review submitted identity documents and update KYC status through
            the API.
          </p>
        </div>
      </header>

      <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-ambient mb-6">
        <Search className="text-slate-400 h-4 w-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search verifications"
          className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none placeholder:text-slate-400 h-5"
        />
      </div>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-ambient overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[12%]">
                User
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[16%]">
                Email
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[8%]">
                Country
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[8%]">
                KYC Level
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[10%]">
                Document Type
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[12%]">
                Status
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[9%]">
                Submitted At
              </th>
              <th className="px-3 py-3 text-left font-black text-slate-400 uppercase tracking-widest text-[10px] w-[25%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-4 font-black text-navy-900 wrap-break-word">
                  {row.user?.fullName ?? "Unknown user"}
                </td>
                <td className="px-3 py-4 text-slate-500 break-all">
                  {row.user?.email ?? "-"}
                </td>
                <td className="px-3 py-4 text-slate-500 wrap-break-word">
                  {row.user?.country ?? "-"}
                </td>
                <td className="px-3 py-4 text-slate-500 wrap-break-word">
                  {row.level || row.user?.kycLevel || "Basic"}
                </td>
                <td className="px-3 py-4 text-slate-500 capitalize wrap-break-word">
                  {row.documentType.replace(/_/g, " ")}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      "inline-block px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                      statusStyles[row.status] ?? "bg-slate-100 text-slate-500",
                    )}
                  >
                    {formatStatus(row.status)}
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-500 whitespace-nowrap">
                  {new Date(row.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white font-bold text-xs cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => approve(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-700 hover:text-white font-bold text-xs cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white font-bold text-xs cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => requestInfo(row)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-white font-bold text-xs cursor-pointer transition-all duration-300 ease-in-out"
                    >
                      <Info size={12} /> Request Info
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  No verification records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-ambient p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="text-teal-600" />
                <h2 className="text-lg font-black text-navy-900">
                  {selected.user?.fullName ?? "Verification details"}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <p>
                  <span className="font-black text-slate-400 uppercase text-[10px] block">
                    Email
                  </span>
                  {selected.user?.email ?? "-"}
                </p>
                <p>
                  <span className="font-black text-slate-400 uppercase text-[10px] block">
                    Document
                  </span>
                  {selected.documentType.replace(/_/g, " ")}
                </p>
                <p>
                  <span className="font-black text-slate-400 uppercase text-[10px] block">
                    Level
                  </span>
                  {selected.level}
                </p>
              </div>
            </div>
            <FileText className="text-slate-300" />
          </div>
        </section>
      )}
    </MainLayout>
  );
}
