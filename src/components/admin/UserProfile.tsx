import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Clock, Ban, ChevronLeft } from "lucide-react";
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

function kycTone(user: AdminUser): Tone {
  const kyc = user.kycApplications?.[0]?.status?.toUpperCase();
  if (kyc === "APPROVED") return "success";
  if (kyc === "REJECTED") return "danger";
  if (kyc) return "warn";
  return "neutral";
}

function kycLabel(user: AdminUser) {
  const kyc = user.kycApplications?.[0]?.status?.toUpperCase();
  if (kyc === "APPROVED") return "Verified";
  if (kyc === "REJECTED") return "Rejected";
  if (kyc === "PENDING" || kyc === "SUBMITTED") return "Pending";
  return "No KYC";
}

export function UserHeader({ user }: { user: AdminUser }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const base = `/admin/users/${user.id}`;

  const tabs: { to: string; label: string; exact?: boolean }[] = [
    { to: base, label: "Profile", exact: true },
    { to: `${base}/wallet`, label: "Wallet" },
    { to: `${base}/orders`, label: "Orders" },
    { to: `${base}/escrow`, label: "Escrow" },
  ];

  const kTone = kycTone(user);

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
            <Pill tone={kTone}>
              {kTone === "success" ? <ShieldCheck className="size-2.5" strokeWidth={3} /> : null}
              {kTone === "warn" ? <Clock className="size-2.5" strokeWidth={3} /> : null}
              {kTone === "danger" ? <Ban className="size-2.5" strokeWidth={3} /> : null}
              {kycLabel(user)}
            </Pill>
            <Pill tone="info">{user.role}</Pill>
            <Pill tone="neutral">{user.platformRole}</Pill>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[11.5px] flex-wrap" style={{ color: T.sub }}>
            <span className="tabular-nums font-semibold" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              {user.id}
            </span>
            {user.email ? (
              <>
                <span>·</span>
                <span>{user.email}</span>
              </>
            ) : null}
            <span>·</span>
            <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {user.phone}
            </span>
            <span>·</span>
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 border-b" style={{ borderColor: T.border }}>
        {tabs.map((t) => {
          const active = t.exact ? path === t.to : path === t.to || path.startsWith(`${t.to}/`);
          return (
            <Link
              key={t.to}
              to={t.to}
              className="px-3 h-10 inline-flex items-center text-[12.5px] font-semibold transition relative"
              style={{ color: active ? T.ink : T.sub }}
            >
              {t.label}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: T.navy }} />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
