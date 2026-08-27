import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search, Filter, Download, Plus, MoreHorizontal, ChevronDown,
  ShieldCheck, Clock, AlertTriangle, Ban, ArrowUpDown,
  Home, Users, ShoppingBag, Truck, Wallet, FileText, Settings,
  Bell, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Users — MagnetPay Admin" }] }),
  component: AdminUsers,
});

// v8 tokens — same system as escrow / home, on a desktop admin shell
function AdminUsers() {
  const navy = "#0E3B2E";
  const bg = "#F6F1E7";
  const surface = "#FFFFFF";
  const border = "#E7DFCE";
  const ink = "#1B1A17";
  const sub = "#5B5749";
  const muted = "#8A8472";
  const accent = "#C2410C";
  const success = "#0F766E";
  const warn = "#B45309";
  const danger = "#B91C1C";
  const info = "#1D4ED8";

  type Tone = "success" | "warn" | "danger" | "info" | "neutral";
  const Pill = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => {
    const c =
      tone === "success" ? success :
      tone === "warn" ? warn :
      tone === "danger" ? danger :
      tone === "info" ? info : sub;
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.12em]"
        style={{ background: `${c}18`, color: c, border: `1px solid ${c}26` }}
      >
        {children}
      </span>
    );
  };

  // 12 rows — enough density to feel real
  const rows = [
    { id: "U-10241", name: "Chidi Okoro",        email: "chidi@magnetpay.io",     role: "Importer",  country: "🇳🇬 NG", kyc: "verified", risk: "low",    vol: 184_200, last: "2m ago",     status: "active" as const },
    { id: "U-10240", name: "Guangzhou Huayi Co.", email: "ops@gz-huayi.cn",        role: "Supplier",  country: "🇨🇳 CN", kyc: "verified", risk: "low",    vol: 1_240_000, last: "12m ago",  status: "active" as const },
    { id: "U-10239", name: "Adaeze Marketplace",  email: "ada@adaeze.shop",        role: "Merchant",  country: "🇳🇬 NG", kyc: "pending",  risk: "med",    vol: 42_800,    last: "1h ago",   status: "review" as const },
    { id: "U-10238", name: "Tunde Bello",         email: "tunde.b@gmail.com",      role: "Importer",  country: "🇳🇬 NG", kyc: "verified", risk: "low",    vol: 8_400,     last: "3h ago",   status: "active" as const },
    { id: "U-10237", name: "Shenzhen Lumen",      email: "sales@lumen-sz.cn",      role: "Supplier",  country: "🇨🇳 CN", kyc: "rejected", risk: "high",   vol: 0,         last: "yesterday", status: "blocked" as const },
    { id: "U-10236", name: "Funke Adediran",      email: "funke@kitchenco.ng",     role: "Merchant",  country: "🇳🇬 NG", kyc: "verified", risk: "low",    vol: 96_120,    last: "yesterday", status: "active" as const },
    { id: "U-10235", name: "Yiwu Trade Group",    email: "export@yiwutg.cn",       role: "Supplier",  country: "🇨🇳 CN", kyc: "verified", risk: "med",    vol: 612_400,   last: "2d ago",   status: "active" as const },
    { id: "U-10234", name: "Emeka Nwosu",         email: "emeka@protocol.ng",      role: "Importer",  country: "🇳🇬 NG", kyc: "pending",  risk: "low",    vol: 0,         last: "2d ago",   status: "review" as const },
    { id: "U-10233", name: "Beauty Stop Lagos",   email: "hello@beautystop.ng",    role: "Merchant",  country: "🇳🇬 NG", kyc: "verified", risk: "low",    vol: 24_600,    last: "3d ago",   status: "active" as const },
    { id: "U-10232", name: "Foshan Ceramics",     email: "info@foshanc.cn",        role: "Supplier",  country: "🇨🇳 CN", kyc: "verified", risk: "high",   vol: 421_900,   last: "3d ago",   status: "flagged" as const },
    { id: "U-10231", name: "Kemi Adesanya",       email: "kemi@gmail.com",         role: "Importer",  country: "🇳🇬 NG", kyc: "verified", risk: "low",    vol: 5_100,     last: "5d ago",   status: "active" as const },
    { id: "U-10230", name: "Hangzhou Silk Co.",   email: "lin@hzsilk.cn",          role: "Supplier",  country: "🇨🇳 CN", kyc: "verified", risk: "low",    vol: 88_700,    last: "1w ago",   status: "active" as const },
  ];

  const fmt = (n: number) =>
    n === 0 ? "—" : `$${n.toLocaleString("en-US")}`;

  const kycPill = (k: string) =>
    k === "verified" ? <Pill tone="success"><ShieldCheck className="size-2.5" strokeWidth={3} /> Verified</Pill> :
    k === "pending" ? <Pill tone="warn"><Clock className="size-2.5" strokeWidth={3} /> Pending</Pill> :
    <Pill tone="danger"><Ban className="size-2.5" strokeWidth={3} /> Rejected</Pill>;

  const riskDot = (r: string) => {
    const c = r === "low" ? success : r === "med" ? warn : danger;
    const label = r === "low" ? "Low" : r === "med" ? "Medium" : "High";
    return (
      <div className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full" style={{ background: c }} />
        <span className="text-[11.5px]" style={{ color: ink }}>{label}</span>
      </div>
    );
  };

  const statusPill = (s: string) =>
    s === "active" ? <Pill tone="success">Active</Pill> :
    s === "review" ? <Pill tone="warn">In review</Pill> :
    s === "flagged" ? <Pill tone="danger"><AlertTriangle className="size-2.5" strokeWidth={3} /> Flagged</Pill> :
    <Pill tone="neutral">Blocked</Pill>;

  const navItems = [
    { I: Home, label: "Overview" },
    { I: Users, label: "Users", active: true },
    { I: ShoppingBag, label: "Orders" },
    { I: ShieldCheck, label: "Escrow" },
    { I: Truck, label: "Logistics" },
    { I: Wallet, label: "Wallets" },
    { I: FileText, label: "Reports" },
    { I: Settings, label: "Settings" },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <div
        className="min-h-screen w-full flex"
        style={{ background: bg, color: ink, fontFamily: "'Inter', sans-serif" }}
      >
        {/* Sidebar */}
        <aside
          className="w-[224px] shrink-0 sticky top-0 h-screen flex flex-col"
          style={{ background: navy, color: "#EFE9D9" }}
        >
          <div className="px-4 pt-6 pb-8">
            <div className="flex items-center gap-2">
              <div
                className="size-7 rounded-lg grid place-items-center text-[13px] font-bold"
                style={{ background: accent, color: "#fff" }}
              >
                M
              </div>
              <div>
                <p className="text-[13px] font-bold leading-tight">MagnetPay</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#C8C2B0" }}>
                  Admin
                </p>
              </div>
            </div>
          </div>
          <nav className="px-3 flex-1 space-y-0.5">
            {navItems.map((n) => (
              <button
                key={n.label}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition"
                style={{
                  background: n.active ? "rgba(255,255,255,0.10)" : "transparent",
                  color: n.active ? "#fff" : "#C8C2B0",
                }}
              >
                <n.I className="size-4" strokeWidth={n.active ? 2.4 : 2} />
                {n.label}
                {n.active && (
                  <span className="ml-auto size-1.5 rounded-full" style={{ background: accent }} />
                )}
              </button>
            ))}
          </nav>
          <div className="p-3 m-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#C8C2B0" }}>
              FX rate
            </p>
            <p className="mt-1 text-[14px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              1 CNY = ₦229.04
            </p>
            <p className="text-[10px]" style={{ color: "#C8C2B0" }}>Updated 2 min ago</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Topbar */}
          <header
            className="h-14 px-6 flex items-center justify-between sticky top-0 z-10"
            style={{ background: bg, borderBottom: `1px solid ${border}` }}
          >
            <div className="flex items-center gap-2 text-[12px]" style={{ color: muted }}>
              <Link to="/home" className="hover:underline">Admin</Link>
              <span>/</span>
              <span style={{ color: ink, fontWeight: 600 }}>Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 h-9 px-3 rounded-lg w-[260px]"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <Search className="size-3.5" strokeWidth={2.2} style={{ color: muted }} />
                <input
                  placeholder="Search name, email, ID…"
                  className="bg-transparent text-[12px] outline-none flex-1 placeholder:opacity-60"
                  style={{ color: ink }}
                />
                <kbd
                  className="text-[9.5px] px-1 py-0.5 rounded font-bold"
                  style={{ background: bg, color: muted, border: `1px solid ${border}`, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  ⌘K
                </kbd>
              </div>
              <Link
                to="/notifications"
                aria-label="Notifications"
                className="size-9 grid place-items-center rounded-lg relative"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <Bell className="size-4" strokeWidth={2} style={{ color: sub }} />
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full" style={{ background: accent }} />
              </Link>
              <div
                className="size-9 rounded-full grid place-items-center text-[11px] font-bold text-white"
                style={{ background: navy }}
              >
                AD
              </div>
            </div>
          </header>

          {/* Page header */}
          <div className="px-6 pt-6 pb-4 flex items-end justify-between">
            <div>
              <h1 className="text-[22px] font-bold leading-tight">Users</h1>
              <p className="mt-1 text-[12.5px]" style={{ color: sub }}>
                Manage importers, suppliers, and merchants across NG–CN corridor.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ background: surface, border: `1px solid ${border}`, color: ink }}
              >
                <Download className="size-3.5" strokeWidth={2.4} /> Export
              </button>
              <button
                className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
                style={{ background: navy }}
              >
                <Plus className="size-3.5" strokeWidth={2.6} /> Invite user
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="px-6 grid grid-cols-4 gap-3">
            {[
              { label: "Total users", val: "14,208", delta: "+182 this week", tone: success },
              { label: "Pending KYC", val: "326", delta: "12 over SLA", tone: warn },
              { label: "Flagged accounts", val: "41", delta: "+6 today", tone: danger },
              { label: "30d trade volume", val: "$8.42M", delta: "+12.4%", tone: info },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-xl p-3.5"
                style={{ background: surface, border: `1px solid ${border}` }}
              >
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: muted }}>
                  {k.label}
                </p>
                <p
                  className="mt-1.5 text-[22px] font-bold tabular-nums leading-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {k.val}
                </p>
                <p className="mt-2 text-[10.5px] font-semibold" style={{ color: k.tone }}>
                  {k.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Filters bar */}
          <div className="px-6 mt-5 flex items-center gap-2">
            {["All", "Importers", "Suppliers", "Merchants", "Pending KYC", "Flagged"].map((t, i) => (
              <button
                key={t}
                className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
                style={{
                  background: i === 0 ? navy : surface,
                  color: i === 0 ? "#fff" : ink,
                  border: `1px solid ${i === 0 ? navy : border}`,
                }}
              >
                {t}
                {i === 0 && <span className="text-[10px] opacity-70 tabular-nums">14,208</span>}
                {i === 4 && <span className="text-[10px] tabular-nums" style={{ color: warn }}>326</span>}
                {i === 5 && <span className="text-[10px] tabular-nums" style={{ color: danger }}>41</span>}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button
                className="h-8 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5"
                style={{ background: surface, border: `1px solid ${border}`, color: sub }}
              >
                <Filter className="size-3.5" strokeWidth={2.2} /> Filters <ChevronDown className="size-3" strokeWidth={2.4} />
              </button>
              <button
                className="h-8 px-3 rounded-lg text-[11.5px] font-semibold flex items-center gap-1.5"
                style={{ background: surface, border: `1px solid ${border}`, color: sub }}
              >
                Last 30 days <ChevronDown className="size-3" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 mt-4 pb-6">
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              {/* Header row */}
              <div
                className="grid items-center px-4 h-10 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{
                  color: muted,
                  background: bg,
                  borderBottom: `1px solid ${border}`,
                  gridTemplateColumns: "24px 2.2fr 1fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 1fr 32px",
                }}
              >
                <input type="checkbox" className="accent-current" style={{ accentColor: navy }} />
                <button className="flex items-center gap-1 text-left">User <ArrowUpDown className="size-2.5" strokeWidth={2.6} /></button>
                <span>Role</span>
                <span>Country</span>
                <span>KYC</span>
                <span>Risk</span>
                <button className="flex items-center gap-1 text-right justify-end">30d volume <ArrowUpDown className="size-2.5" strokeWidth={2.6} /></button>
                <span>Last active</span>
                <span>Status</span>
                <span></span>
              </div>

              {/* Body */}
              {rows.map((r, i) => (
                <div
                  key={r.id}
                  className="grid items-center px-4 h-[52px] text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
                  style={{
                    gridTemplateColumns: "24px 2.2fr 1fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 1fr 32px",
                    borderBottom: i < rows.length - 1 ? `1px solid ${border}` : "none",
                  }}
                >
                  <input type="checkbox" style={{ accentColor: navy }} />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="size-8 rounded-full grid place-items-center text-[10.5px] font-bold shrink-0"
                      style={{ background: `${navy}10`, color: navy }}
                    >
                      {r.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: ink }}>{r.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] tabular-nums"
                          style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {r.id}
                        </span>
                        <span style={{ color: border }}>·</span>
                        <span className="text-[10.5px] truncate" style={{ color: muted }}>{r.email}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ color: ink }}>{r.role}</span>
                  <span style={{ color: ink }}>{r.country}</span>
                  <span>{kycPill(r.kyc)}</span>
                  <span>{riskDot(r.risk)}</span>
                  <span
                    className="text-right font-semibold tabular-nums"
                    style={{ color: r.vol === 0 ? muted : ink, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {fmt(r.vol)}
                  </span>
                  <span className="tabular-nums" style={{ color: sub, fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.last}
                  </span>
                  <span>{statusPill(r.status)}</span>
                  <button
                    className="size-7 grid place-items-center rounded-md hover:bg-black/5"
                    style={{ color: sub }}
                  >
                    <MoreHorizontal className="size-3.5" strokeWidth={2.2} />
                  </button>
                </div>
              ))}

              {/* Footer */}
              <div
                className="px-4 h-12 flex items-center justify-between text-[11.5px]"
                style={{ background: bg, borderTop: `1px solid ${border}`, color: sub }}
              >
                <span>
                  Showing <span className="font-semibold" style={{ color: ink }}>1–12</span> of{" "}
                  <span className="font-semibold tabular-nums" style={{ color: ink, fontFamily: "'JetBrains Mono', monospace" }}>14,208</span>
                </span>
                <div className="flex items-center gap-1">
                  <button className="size-7 grid place-items-center rounded-md" style={{ background: surface, border: `1px solid ${border}` }}>
                    <ChevronLeft className="size-3.5" strokeWidth={2.4} />
                  </button>
                  {["1", "2", "3", "…", "1184"].map((p, i) => (
                    <button
                      key={p + i}
                      className="h-7 min-w-7 px-2 rounded-md text-[11px] font-semibold tabular-nums"
                      style={{
                        background: i === 0 ? navy : surface,
                        color: i === 0 ? "#fff" : ink,
                        border: `1px solid ${i === 0 ? navy : border}`,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="size-7 grid place-items-center rounded-md" style={{ background: surface, border: `1px solid ${border}` }}>
                    <ChevronRight className="size-3.5" strokeWidth={2.4} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
