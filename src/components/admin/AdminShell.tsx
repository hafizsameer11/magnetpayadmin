import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, ShieldCheck, Store, ShoppingBag, Wallet,
  Coins, Lock, Gavel, Truck, MessageSquare, AlertTriangle, FileText,
  Settings, Search, Bell, ChevronRight,
  User, KeyRound, Building2, Languages, Moon, LifeBuoy, LogOut, Check,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";


// MagnetPay Hub tokens
export const T = {
  navy: "#0E3B2E",
  bg: "#F6F1E7",
  surface: "#FFFFFF",
  border: "#E7DFCE",
  ink: "#1B1A17",
  sub: "#5B5749",
  muted: "#8A8472",
  accent: "#C2410C",
  success: "#0F766E",
  warn: "#B45309",
  danger: "#B91C1C",
  info: "#1D4ED8",
};

type NavItem = { label: string; to: string; I: typeof Users };

const NAV: NavItem[] = [
  { label: "Overview", to: "/admin", I: LayoutDashboard },
  { label: "Users", to: "/admin/users", I: Users },
  { label: "KYC", to: "/admin/kyc", I: ShieldCheck },
  { label: "KYB", to: "/admin/kyb", I: Building2 },
  { label: "Sellers", to: "/admin/sellers", I: Store },
  { label: "Listings", to: "/admin/listings", I: ShoppingBag },
  { label: "Orders", to: "/admin/orders", I: ShoppingBag },
  { label: "Wallets", to: "/admin/wallets", I: Wallet },
  { label: "Transactions", to: "/admin/transactions", I: Wallet },
  { label: "Deposits", to: "/admin/deposits", I: Wallet },
  { label: "Withdrawals", to: "/admin/withdrawals", I: Wallet },
  { label: "FX", to: "/admin/fx/rates", I: Coins },
  { label: "Escrow", to: "/admin/escrow", I: Lock },
  { label: "Disputes", to: "/admin/disputes", I: Gavel },
  { label: "Shipments", to: "/admin/shipments", I: Truck },
  { label: "Chats", to: "/admin/chats", I: MessageSquare },
  { label: "AML", to: "/admin/aml", I: AlertTriangle },
  { label: "Announcements", to: "/admin/announcements", I: FileText },
  { label: "Fees", to: "/admin/fees", I: Settings },
  { label: "Ledger", to: "/admin/ledger", I: FileText },
  { label: "Audit", to: "/admin/audit", I: FileText },
];

export function AdminShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const crumbs = breadcrumbs ?? [{ label: "Admin", to: "/admin" }, { label: title }];
  const [language, setLanguage] = useState("English");
  const [appearance, setAppearance] = useState<"Light" | "Dark" | "System">("Light");

  const handleSignOut = () => {
    toast.success("Signed out");
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <div
        className="min-h-screen w-full flex"
        style={{ background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif" }}
      >
        {/* Sidebar */}
        <aside
          className="w-[224px] shrink-0 sticky top-0 h-screen flex flex-col"
          style={{ background: T.navy, color: "#EFE9D9" }}
        >
          <div className="px-4 pt-6 pb-6">
            <Link to="/admin" className="flex items-center gap-2">
              <div
                className="size-7 rounded-lg grid place-items-center text-[13px] font-bold"
                style={{ background: T.accent, color: "#fff" }}
              >
                M
              </div>
              <div>
                <p className="text-[13px] font-bold leading-tight">MagnetPay</p>
                <p
                  className="text-[9px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: "#C8C2B0" }}
                >
                  Admin
                </p>
              </div>
            </Link>
          </div>
          <nav className="px-3 flex-1 space-y-0.5 overflow-y-auto pb-4">
            {NAV.map((n) => {
              const active =
                n.to === "/admin"
                  ? path === "/admin"
                  : path === n.to || path.startsWith(n.to + "/");
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition"
                  style={{
                    background: active ? "rgba(255,255,255,0.10)" : "transparent",
                    color: active ? "#fff" : "#C8C2B0",
                  }}
                >
                  <n.I className="size-4" strokeWidth={active ? 2.4 : 2} />
                  {n.label}
                  {active && (
                    <span
                      className="ml-auto size-1.5 rounded-full"
                      style={{ background: T.accent }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div
            className="p-3 m-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: "#C8C2B0" }}
            >
              FX rate
            </p>
            <p
              className="mt-1 text-[14px] font-bold tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              1 CNY = ₦229.04
            </p>
            <p className="text-[10px]" style={{ color: "#C8C2B0" }}>
              Updated 2 min ago
            </p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Topbar */}
          <header
            className="h-14 px-6 flex items-center justify-between sticky top-0 z-10"
            style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: T.muted }}>
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3" strokeWidth={2.2} />}
                  {c.to ? (
                    <Link to={c.to} className="hover:underline">
                      {c.label}
                    </Link>
                  ) : (
                    <span style={{ color: T.ink, fontWeight: 600 }}>{c.label}</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 h-9 px-3 rounded-lg w-[260px]"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <Search className="size-3.5" strokeWidth={2.2} style={{ color: T.muted }} />
                <input
                  placeholder="Search anything…"
                  className="bg-transparent text-[12px] outline-none flex-1 placeholder:opacity-60"
                  style={{ color: T.ink }}
                />
                <kbd
                  className="text-[9.5px] px-1 py-0.5 rounded font-bold"
                  style={{
                    background: T.bg,
                    color: T.muted,
                    border: `1px solid ${T.border}`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  ⌘K
                </kbd>
              </div>
              <Link
                to="/admin/notifications"
                aria-label="Notifications"
                className="size-9 grid place-items-center rounded-lg relative cursor-pointer hover:opacity-80 transition"
                style={{ background: T.surface, border: `1px solid ${T.border}` }}
              >
                <Bell className="size-4" strokeWidth={2} style={{ color: T.sub }} />
                <span
                  className="absolute top-1.5 right-1.5 size-1.5 rounded-full"
                  style={{ background: T.accent }}
                />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="size-9 rounded-full grid place-items-center text-[11px] font-bold text-white cursor-pointer hover:opacity-90 transition outline-none"
                    style={{ background: T.navy }}
                    aria-label="Account menu"
                  >
                    AD
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={6}
                  className="w-64 p-0"
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
                >
                  <div className="px-3 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div
                      className="size-9 rounded-full grid place-items-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: T.navy }}
                    >
                      AD
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight truncate">Ada Daniels</p>
                      <p className="text-[11px] truncate" style={{ color: T.sub }}>ada@magnetpay.io</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mt-0.5" style={{ color: T.accent }}>Super admin</p>
                    </div>
                  </div>
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] px-3 pt-2 pb-1" style={{ color: T.muted }}>
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="text-[12.5px] gap-2 cursor-pointer">
                    <Link to="/admin/users">
                      <User className="size-3.5" strokeWidth={2.2} /> Staff users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-[12.5px] gap-2 cursor-pointer">
                    <Link to="/admin/audit">
                      <KeyRound className="size-3.5" strokeWidth={2.2} /> Audit log
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-[12.5px] gap-2 cursor-pointer">
                    <Link to="/admin/fees">
                      <Settings className="size-3.5" strokeWidth={2.2} /> Fees & limits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: T.border }} />
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] px-3 pt-2 pb-1" style={{ color: T.muted }}>
                    Workspace
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="text-[12.5px] gap-2 cursor-pointer">
                    <Link to="/admin/health">
                      <Building2 className="size-3.5" strokeWidth={2.2} /> System health
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-[12.5px] gap-2 cursor-pointer">
                      <Languages className="size-3.5" strokeWidth={2.2} /> Language
                      <span className="ml-auto text-[11px]" style={{ color: T.muted }}>{language}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
                        {["English", "Français", "中文 (简体)", "Yorùbá", "Hausa"].map((l) => (
                          <DropdownMenuItem
                            key={l}
                            onClick={() => { setLanguage(l); toast.success(`Language: ${l}`); }}
                            className="text-[12.5px] gap-2 cursor-pointer"
                          >
                            {l}
                            {language === l && <Check className="ml-auto size-3.5" style={{ color: T.success }} />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="text-[12.5px] gap-2 cursor-pointer">
                      <Moon className="size-3.5" strokeWidth={2.2} /> Appearance
                      <span className="ml-auto text-[11px]" style={{ color: T.muted }}>{appearance}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}>
                        {(["Light", "Dark", "System"] as const).map((m) => (
                          <DropdownMenuItem
                            key={m}
                            onClick={() => { setAppearance(m); toast.success(`Appearance: ${m}`); }}
                            className="text-[12.5px] gap-2 cursor-pointer"
                          >
                            {m}
                            {appearance === m && <Check className="ml-auto size-3.5" style={{ color: T.success }} />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator style={{ background: T.border }} />
                  <DropdownMenuItem asChild className="text-[12.5px] gap-2 cursor-pointer">
                    <Link to="/admin/audit">
                      <LifeBuoy className="size-3.5" strokeWidth={2.2} /> Help & audit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-[12.5px] gap-2 cursor-pointer"
                    style={{ color: T.danger }}
                  >
                    <LogOut className="size-3.5" strokeWidth={2.2} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </header>


          {/* Page header */}
          <div className="px-6 pt-6 pb-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-[22px] font-bold leading-tight">{title}</h1>
              {description && (
                <p className="mt-1 text-[12.5px]" style={{ color: T.sub }}>
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>

          <div className="px-6 pb-10">{children}</div>
        </main>
        <Toaster position="top-right" />
      </div>
    </>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}

export function StubPanel({ title, note }: { title: string; note?: string }) {
  return (
    <div
      className="rounded-xl p-10 text-center"
      style={{
        background: T.surface,
        border: `1px dashed ${T.border}`,
        color: T.sub,
      }}
    >
      <p className="text-[13px] font-semibold" style={{ color: T.ink }}>
        {title}
      </p>
      <p className="mt-1 text-[12px]">{note ?? "Scaffolded — ready to build out."}</p>
    </div>
  );
}
