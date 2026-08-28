import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Clock, Ban, Copy, MoreHorizontal, ChevronLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { T } from "./AdminShell";
import type { AdminUser } from "@/lib/api";

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

export function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

export function roleLabel(role: string) {
  const r = role.toUpperCase();
  if (r === "BUYER") return "Importer";
  if (r === "SELLER") return "Supplier";
  if (r === "BOTH") return "Merchant";
  return role;
}

export function countryFromPhone(phone: string) {
  const p = phone.replace(/\s/g, "");
  if (p.startsWith("+234") || p.startsWith("234")) return { flag: "🇳🇬", code: "NG", name: "Nigeria" };
  if (p.startsWith("+86") || p.startsWith("86")) return { flag: "🇨🇳", code: "CN", name: "China" };
  return { flag: "🌍", code: "—", name: "—" };
}

function kycStatus(user: AdminUser) {
  return user.kycApplications?.[0]?.status?.toUpperCase() ?? "";
}

export function kycTone(user: AdminUser): Tone {
  const kyc = kycStatus(user);
  if (kyc === "APPROVED") return "success";
  if (kyc === "REJECTED") return "danger";
  if (kyc === "SUBMITTED" || kyc === "PENDING" || kyc === "DRAFT") return "warn";
  return "neutral";
}

export function kycPill(user: AdminUser) {
  const kyc = kycStatus(user);
  const tone = kycTone(user);
  if (kyc === "APPROVED") {
    return (
      <Pill tone="success">
        <ShieldCheck className="size-2.5" strokeWidth={3} /> Verified
      </Pill>
    );
  }
  if (kyc === "REJECTED") {
    return (
      <Pill tone="danger">
        <Ban className="size-2.5" strokeWidth={3} /> Rejected
      </Pill>
    );
  }
  if (kyc === "SUBMITTED" || kyc === "PENDING" || kyc === "DRAFT") {
    return (
      <Pill tone="warn">
        <Clock className="size-2.5" strokeWidth={3} /> Pending
      </Pill>
    );
  }
  return <Pill tone="neutral">No KYC</Pill>;
}

export function accountStatusTone(user: AdminUser): Tone {
  const kyc = kycStatus(user);
  if (kyc === "REJECTED") return "danger";
  if (kyc === "SUBMITTED" || kyc === "PENDING" || kyc === "DRAFT") return "warn";
  if (kyc === "APPROVED") return "success";
  return "neutral";
}

export function accountStatusPill(user: AdminUser) {
  const kyc = kycStatus(user);
  if (kyc === "APPROVED") return <Pill tone="success">Active</Pill>;
  if (kyc === "REJECTED") return <Pill tone="neutral">Blocked</Pill>;
  if (kyc === "SUBMITTED" || kyc === "PENDING" || kyc === "DRAFT") {
    return <Pill tone="warn">In review</Pill>;
  }
  return <Pill tone="warn">In review</Pill>;
}

export function riskTone(_user: AdminUser): Tone {
  return "success";
}

export function riskDot(tone: Tone = "success") {
  const c = tone === "success" ? T.success : tone === "warn" ? T.warn : T.danger;
  const label = tone === "success" ? "Low" : tone === "warn" ? "Medium" : "High";
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      <span className="text-[11.5px]" style={{ color: T.ink }}>{label}</span>
    </div>
  );
}

export function fmtUSD(n: number) {
  return n === 0 ? "—" : `$${n.toLocaleString("en-US")}`;
}

export function walletVolumeUsd(user: AdminUser) {
  let total = 0;
  for (const w of user.wallets ?? []) {
    const bal = Number(w.balanceMinor) / 100;
    if (w.currency === "USD") total += bal;
    else if (w.currency === "NGN") total += bal / 1600;
    else if (w.currency === "CNY") total += bal / 7.2;
  }
  return Math.round(total);
}

function copyId(id: string) {
  void navigator.clipboard.writeText(id).then(
    () => toast.success("User ID copied"),
    () => toast.error("Could not copy"),
  );
}

export function UserHeader({ user }: { user: AdminUser }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const base = `/admin/users/${user.id}`;
  const country = countryFromPhone(user.phone);

  const tabs: { to: string; label: string; exact?: boolean }[] = [
    { to: base, label: "Profile", exact: true },
    { to: `${base}/wallet`, label: "Wallet" },
    { to: `${base}/orders`, label: "Orders" },
    { to: `${base}/escrow`, label: "Escrow" },
    { to: `${base}/tickets`, label: "Tickets" },
    { to: `${base}/notes`, label: "Notes" },
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
          {initials(user.name || "?")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[18px] font-bold leading-tight">{user.name}</h2>
            {accountStatusPill(user)}
            {kycPill(user)}
            <Pill tone="info">{roleLabel(user.role)}</Pill>
            {user.platformRole !== "USER" ? <Pill tone="neutral">{user.platformRole}</Pill> : null}
            {user.businessProfile?.status === "APPROVED" ? (
              <Pill tone="success">KYB verified</Pill>
            ) : user.businessProfile ? (
              <Pill tone="warn">KYB pending</Pill>
            ) : null}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span
              className="tabular-nums font-semibold inline-flex items-center gap-1"
              style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.id.slice(0, 8)}
              <button type="button" aria-label="Copy ID" className="opacity-60 hover:opacity-100" onClick={() => copyId(user.id)}>
                <Copy className="size-3" strokeWidth={2.2} />
              </button>
            </span>
            {user.email ? (
              <>
                <span>·</span>
                <span>{user.email}</span>
              </>
            ) : null}
            <span>·</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.phone}</span>
            <span>·</span>
            <span>{country.flag} {country.code}</span>
            <span>·</span>
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="h-9 px-3 rounded-lg text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Message
          </button>
          <button
            type="button"
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            Impersonate
          </button>
          <button
            type="button"
            className="size-9 grid place-items-center rounded-lg"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.sub }}
            aria-label="More actions"
          >
            <MoreHorizontal className="size-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 border-b overflow-x-auto" style={{ borderColor: T.border }}>
        {tabs.map((t) => {
          const active = t.exact ? path === t.to : path === t.to || path.startsWith(`${t.to}/`);
          return (
            <Link
              key={t.to}
              to={t.to}
              className="px-3 h-10 inline-flex items-center text-[12.5px] font-semibold transition relative shrink-0"
              style={{ color: active ? T.ink : T.sub }}
            >
              {t.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-t" style={{ background: T.navy }} />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function flaggedPill() {
  return (
    <Pill tone="danger">
      <AlertTriangle className="size-2.5" strokeWidth={3} /> Flagged
    </Pill>
  );
}
