import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Store,
  UserCheck,
  Wallet,
  X,
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

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useCurrentUser();
  const currentRole = role ?? "user";
  const isAdmin = currentRole === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const visibleNavItems = isAdmin ? adminNavItems : userNavItems;

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-1">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden lg:flex items-center bg-surface-low rounded-full px-4 py-2 border border-slate-100 max-w-md w-full focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <Search className="text-slate-400 h-4 w-4 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && search.trim())
                navigate(isAdmin ? "/admin/dashboard" : "/transfers");
            }}
            placeholder={
              isAdmin
                ? "Search users, disputes, transactions..."
                : "Search your transfers..."
            }
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none placeholder:text-slate-400 h-5"
          />
        </div>
        <div className="lg:hidden text-lg font-bold tracking-tighter text-navy-900 border-l-4 border-teal-500 pl-2">
          FlowX
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-white" />
        </button>
        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />

        <div className="flex items-center gap-3 rounded-lg p-1 pr-3">
          <div
            className={cn(
              "w-8 h-8 rounded-full overflow-hidden border flex items-center justify-center text-xs font-black",
              isAdmin
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-teal-50 text-teal-700 border-teal-100",
            )}
          >
            {isAdmin ? "AD" : "US"}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-bold text-navy-900 leading-tight">
              {user?.name ?? "FlowX User"}
            </p>
            <p className="text-[11px] text-slate-500 leading-tight">
              {isAdmin ? "Admin Console" : "User App"}
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-navy-900/40 backdrop-blur-sm lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <aside
          className={cn(
            "fixed inset-y-0 left-0 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div>
              <div className="text-xl font-bold tracking-tighter text-navy-900 border-l-4 border-teal-500 pl-2">
                FlowX
              </div>
              <p className="pl-2 text-[10px] font-black uppercase text-slate-400">
                {isAdmin ? "Admin Console" : "User App"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 -mr-2 text-slate-400 hover:text-navy-900"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const isActive =
                location.pathname === item.href ||
                location.pathname.startsWith(`${item.href}/`) ||
                (!isAdmin &&
                  item.href === "/transfers" &&
                  location.pathname.startsWith("/transfer") &&
                  location.pathname !== "/transfer/pending");
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-600 border border-teal-100"
                      : "text-slate-500 hover:bg-slate-50",
                  )}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-teal-600" : "text-slate-400"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-error/5 hover:text-error transition-all"
            >
              <LogOut size={20} className="text-slate-400" />
              Logout
            </button>
          </div>
        </aside>
      </div>
    </header>
  );
}
