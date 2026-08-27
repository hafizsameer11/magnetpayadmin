import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Clock, Ban, Copy, MoreHorizontal, ChevronLeft } from "lucide-react";
import { T } from "./AdminShell";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Importer" | "Supplier" | "Merchant" | "Logistics";
  country: string;
  countryName: string;
  city: string;
  joined: string;
  lastActive: string;
  kyc: "verified" | "pending" | "rejected";
  risk: "low" | "med" | "high";
  status: "active" | "review" | "flagged" | "blocked";
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  vol30d: number;
  orders30d: number;
  disputes: number;
  walletNGN: number;
  walletCNY: number;
  walletUSD: number;
};

export const ADMIN_USERS: AdminUser[] = [
  { id: "U-10241", name: "Chidi Okoro",          email: "chidi@magnetpay.io",   phone: "+234 803 412 0091", role: "Importer", country: "🇳🇬", countryName: "Nigeria",  city: "Lagos",     joined: "Mar 2024", lastActive: "2 min ago",  kyc: "verified", risk: "low",  status: "active",  tier: "Gold",     vol30d: 184_200,   orders30d: 38, disputes: 1, walletNGN: 4_120_000, walletCNY: 0,        walletUSD: 1_240 },
  { id: "U-10240", name: "Guangzhou Huayi Co.",  email: "ops@gz-huayi.cn",      phone: "+86 20 8138 0042",  role: "Supplier", country: "🇨🇳", countryName: "China",    city: "Guangzhou", joined: "Jan 2023", lastActive: "12 min ago", kyc: "verified", risk: "low",  status: "active",  tier: "Platinum", vol30d: 1_240_000, orders30d: 124,disputes: 3, walletNGN: 0,         walletCNY: 880_400,  walletUSD: 0     },
  { id: "U-10239", name: "Adaeze Marketplace",   email: "ada@adaeze.shop",      phone: "+234 802 119 0044", role: "Merchant", country: "🇳🇬", countryName: "Nigeria",  city: "Abuja",     joined: "Aug 2024", lastActive: "1h ago",     kyc: "pending",  risk: "med",  status: "review",  tier: "Silver",   vol30d: 42_800,    orders30d: 14, disputes: 0, walletNGN: 620_000,   walletCNY: 0,        walletUSD: 0     },
  { id: "U-10238", name: "Tunde Bello",          email: "tunde.b@gmail.com",    phone: "+234 805 220 7710", role: "Importer", country: "🇳🇬", countryName: "Nigeria",  city: "Ibadan",    joined: "Feb 2025", lastActive: "3h ago",     kyc: "verified", risk: "low",  status: "active",  tier: "Bronze",   vol30d: 8_400,     orders30d: 4,  disputes: 0, walletNGN: 142_000,   walletCNY: 0,        walletUSD: 0     },
  { id: "U-10237", name: "Shenzhen Lumen",       email: "sales@lumen-sz.cn",    phone: "+86 755 8201 7733", role: "Supplier", country: "🇨🇳", countryName: "China",    city: "Shenzhen",  joined: "Apr 2023", lastActive: "yesterday", kyc: "rejected", risk: "high", status: "blocked", tier: "Bronze",   vol30d: 0,         orders30d: 0,  disputes: 4, walletNGN: 0,         walletCNY: 12_400,   walletUSD: 0     },
  { id: "U-10236", name: "Funke Adediran",       email: "funke@kitchenco.ng",   phone: "+234 807 334 1102", role: "Merchant", country: "🇳🇬", countryName: "Nigeria",  city: "Lagos",     joined: "Jun 2024", lastActive: "yesterday", kyc: "verified", risk: "low",  status: "active",  tier: "Silver",   vol30d: 96_120,    orders30d: 22, disputes: 0, walletNGN: 1_840_000, walletCNY: 0,        walletUSD: 400   },
  { id: "U-10235", name: "Yiwu Trade Group",     email: "export@yiwutg.cn",     phone: "+86 579 8533 2210", role: "Supplier", country: "🇨🇳", countryName: "China",    city: "Yiwu",      joined: "Nov 2022", lastActive: "2 days ago", kyc: "verified", risk: "med",  status: "active",  tier: "Gold",     vol30d: 612_400,   orders30d: 88, disputes: 2, walletNGN: 0,         walletCNY: 412_200,  walletUSD: 0     },
  { id: "U-10234", name: "Emeka Nwosu",          email: "emeka@protocol.ng",    phone: "+234 809 110 4421", role: "Importer", country: "🇳🇬", countryName: "Nigeria",  city: "Port Harcourt", joined: "Jan 2026", lastActive: "2 days ago", kyc: "pending", risk: "low",  status: "review",  tier: "Bronze",   vol30d: 0,         orders30d: 0,  disputes: 0, walletNGN: 0,         walletCNY: 0,        walletUSD: 0     },
  { id: "U-10233", name: "Beauty Stop Lagos",    email: "hello@beautystop.ng",  phone: "+234 803 884 2105", role: "Merchant", country: "🇳🇬", countryName: "Nigeria",  city: "Lagos",     joined: "May 2024", lastActive: "3 days ago", kyc: "verified", risk: "low",  status: "active",  tier: "Silver",   vol30d: 24_600,    orders30d: 9,  disputes: 0, walletNGN: 412_000,   walletCNY: 0,        walletUSD: 0     },
  { id: "U-10232", name: "Foshan Ceramics",      email: "info@foshanc.cn",      phone: "+86 757 2890 4488", role: "Supplier", country: "🇨🇳", countryName: "China",    city: "Foshan",    joined: "Sep 2023", lastActive: "3 days ago", kyc: "verified", risk: "high", status: "flagged", tier: "Gold",     vol30d: 421_900,   orders30d: 41, disputes: 6, walletNGN: 0,         walletCNY: 188_200,  walletUSD: 0     },
  { id: "U-10231", name: "Kemi Adesanya",        email: "kemi@gmail.com",       phone: "+234 805 770 1188", role: "Importer", country: "🇳🇬", countryName: "Nigeria",  city: "Lagos",     joined: "Jul 2025", lastActive: "5 days ago", kyc: "verified", risk: "low",  status: "active",  tier: "Bronze",   vol30d: 5_100,     orders30d: 2,  disputes: 0, walletNGN: 92_000,    walletCNY: 0,        walletUSD: 0     },
  { id: "U-10230", name: "Hangzhou Silk Co.",    email: "lin@hzsilk.cn",        phone: "+86 571 8801 4422", role: "Supplier", country: "🇨🇳", countryName: "China",    city: "Hangzhou",  joined: "Oct 2023", lastActive: "1 week ago", kyc: "verified", risk: "low",  status: "active",  tier: "Silver",   vol30d: 88_700,    orders30d: 12, disputes: 0, walletNGN: 0,         walletCNY: 64_200,   walletUSD: 0     },
];

export function getAdminUser(id: string): AdminUser {
  return ADMIN_USERS.find((u) => u.id === id) ?? ADMIN_USERS[0];
}

type Tone = "success" | "warn" | "danger" | "info" | "neutral";
export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const c =
    tone === "success" ? T.success :
    tone === "warn" ? T.warn :
    tone === "danger" ? T.danger :
    tone === "info" ? T.info : T.sub;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-[0.12em]"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}26` }}
    >
      {children}
    </span>
  );
}

export function kycPill(k: AdminUser["kyc"]) {
  if (k === "verified") return <Pill tone="success"><ShieldCheck className="size-2.5" strokeWidth={3} /> Verified</Pill>;
  if (k === "pending")  return <Pill tone="warn"><Clock className="size-2.5" strokeWidth={3} /> Pending</Pill>;
  return <Pill tone="danger"><Ban className="size-2.5" strokeWidth={3} /> Rejected</Pill>;
}

export function statusPill(s: AdminUser["status"]) {
  if (s === "active")  return <Pill tone="success">Active</Pill>;
  if (s === "review")  return <Pill tone="warn">In review</Pill>;
  if (s === "flagged") return <Pill tone="danger">Flagged</Pill>;
  return <Pill tone="neutral">Blocked</Pill>;
}

export function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

export function fmtUSD(n: number) {
  return n === 0 ? "—" : `$${n.toLocaleString("en-US")}`;
}

export function UserHeader({ user }: { user: AdminUser }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const base = `/admin/users/${user.id}`;

  const tabs: { to: string; label: string; exact?: boolean }[] = [
    { to: base,             label: "Profile",  exact: true },
    { to: `${base}/wallet`, label: "Wallet" },
    { to: `${base}/orders`, label: "Orders" },
    { to: `${base}/escrow`, label: "Escrow" },
    { to: `${base}/tickets`,label: "Tickets" },
    { to: `${base}/notes`,  label: "Notes" },
  ];

  return (
    <>
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-3"
        style={{ color: T.sub }}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.4} /> All users
      </Link>

      <div
        className="rounded-xl p-4 flex items-start gap-4"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div
          className="size-14 rounded-full grid place-items-center text-[15px] font-bold shrink-0"
          style={{ background: `${T.navy}10`, color: T.navy }}
        >
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold leading-tight">{user.name}</h2>
            {statusPill(user.status)}
            {kycPill(user.kyc)}
            <Pill tone="info">{user.role}</Pill>
            <Pill tone="neutral">{user.tier}</Pill>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span
              className="tabular-nums font-semibold flex items-center gap-1"
              style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.id}
              <button aria-label="Copy ID" className="opacity-60 hover:opacity-100">
                <Copy className="size-3" strokeWidth={2.2} />
              </button>
            </span>
            <span>·</span>
            <span>{user.email}</span>
            <span>·</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.phone}</span>
            <span>·</span>
            <span>{user.country} {user.city}, {user.countryName}</span>
            <span>·</span>
            <span>Joined {user.joined}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="h-9 px-3 rounded-lg text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Message
          </button>
          <button
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            Impersonate
          </button>
          <button
            className="size-9 grid place-items-center rounded-lg"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub }}
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex items-center gap-1 border-b" style={{ borderColor: T.border }}>
        {tabs.map((t) => {
          const active = t.exact ? path === t.to : path === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className="px-3 h-10 inline-flex items-center text-[12.5px] font-semibold transition relative"
              style={{ color: active ? T.ink : T.sub }}
            >
              {t.label}
              {active && (
                <span
                  className="absolute left-0 right-0 -bottom-px h-0.5 rounded-t"
                  style={{ background: T.navy }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
