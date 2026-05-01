import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Clock3,
  LayoutDashboard,
  LogOut,
  Plus,
  Shield,
  ShieldAlert,
  Store,
  UserCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/shared/utils";
import useCurrentUser from "@/features/auth/hooks/useCurrentUser";

const userNavItems: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "User Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Transfers", href: "/transfers", icon: ArrowLeftRight },
  { label: "Pending Requests", href: "/transfer/pending", icon: Clock3 },
  { label: "Wallet / Escrow", href: "/wallet", icon: Wallet },
  { label: "Verified Agents", href: "/marketplace", icon: Store },
  { label: "My Verification", href: "/verification", icon: Shield },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const adminNavItems: Array<{ label: string; href: string; icon: LucideIcon }> =
  [
    { label: "Admin Dashboard", href: "/admin/dashboard", icon: ShieldAlert },
    { label: "All Users", href: "/admin/users", icon: UserCheck },
    { label: "Verification Queue", href: "/admin/verification", icon: Shield },
    { label: "All Transfers", href: "/admin/transfers", icon: ArrowLeftRight },
    { label: "Requests Queue", href: "/admin/requests", icon: Plus },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useCurrentUser();

  const role = user?.role ?? "user";
  const isAdmin = role === "admin";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-50 w-64 border-r border-slate-200 bg-white shadow-ambient">
      <div className="px-6 py-8">
        <Link to="/dashboard" className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold">
              FX
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-navy-900">
              FlowX
            </h1>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 ml-11">
            {isAdmin ? "Admin Console" : "User App"}
          </p>
        </Link>
      </div>

      {!isAdmin && (
        <div className="px-5 mb-6">
          <Link
            to="/transfer/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all shadow-ambient bg-navy-900 text-white hover:bg-navy-800"
          >
            <Plus size={18} />
            New Transfer
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`) ||
            (!isAdmin &&
              item.href === "/transfers" &&
              location.pathname.startsWith("/transfer") &&
              location.pathname !== "/transfer/pending") ||
            (item.href === "/admin/dashboard" &&
              location.pathname === "/dashboard" &&
              isAdmin);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-50 text-teal-500 border-r-4 border-teal-500"
                  : "text-slate-500 hover:bg-slate-50 hover:text-navy-900",
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive
                    ? "text-teal-500"
                    : "text-slate-400 group-hover:text-navy-900",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3 space-y-1">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 rounded-lg text-[13px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          <LogOut className="mr-3 h-4 w-4 text-slate-400" />
          Logout
        </button>
      </div>
    </aside>
  );
}
