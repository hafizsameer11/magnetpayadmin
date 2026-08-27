import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  UserPlus,
  Crown,
  ShieldCheck,
  Package2,
  MoreVertical,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { useRoleGuard } from "@/lib/use-role-guard";

export const Route = createFileRoute("/seller/settings/team")({
  head: () => ({ meta: [{ title: "Team & roles — MagnetPay" }] }),
  component: Team,
});

const ROLES = {
  owner: { label: "Owner", c: "#B45309", desc: "Full access · billing · delete" },
  ops: { label: "Operations", c: "#1D4ED8", desc: "Orders, RFQs, shipments" },
  finance: { label: "Finance", c: "#0F766E", desc: "Payouts, fapiao, statements" },
  viewer: { label: "Viewer", c: "#8A8472", desc: "Read-only access" },
} as const;
type RoleKey = keyof typeof ROLES;

function Team() {
  useRoleGuard(["seller","both"], "Seller tools are for sellers");
  const t = escrowTheme;
  const [members, setMembers] = useState<
    { id: string; name: string; email: string; role: RoleKey; status: "active" | "pending" }[]
  >([
    { id: "1", name: "Wang Wei 王伟", email: "wang@huayi.cn", role: "owner", status: "active" },
    { id: "2", name: "Liu Mei 刘梅", email: "liu.mei@huayi.cn", role: "ops", status: "active" },
    { id: "3", name: "Zhang Hao 张昊", email: "hao.z@huayi.cn", role: "finance", status: "active" },
    { id: "4", name: "QC Auditor", email: "qc@huayi.cn", role: "viewer", status: "pending" },
  ]);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleKey>("ops");

  const invite = () => {
    if (!email.trim()) return;
    setMembers((ms) => [
      ...ms,
      { id: String(ms.length + 1), name: email.split("@")[0], email, role, status: "pending" },
    ]);
    setEmail("");
    setInviting(false);
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full pb-8"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link
              to="/me"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Team & roles</p>
            <button
              onClick={() => setInviting(true)}
              className="size-9 grid place-items-center rounded-full text-white"
              style={{ background: t.navy }}
              aria-label="Invite"
            >
              <UserPlus className="size-4" strokeWidth={2.4} />
            </button>
          </header>

          <section className="px-4 grid grid-cols-2 gap-2">
            <div
              className="rounded-2xl p-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <p
                className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: t.muted }}
              >
                Members
              </p>
              <p
                className="text-[20px] font-bold tabular-nums mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: t.navy }}
              >
                {members.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              <p
                className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: t.muted }}
              >
                Pending invites
              </p>
              <p
                className="text-[20px] font-bold tabular-nums mt-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: t.accent }}
              >
                {members.filter((m) => m.status === "pending").length}
              </p>
            </div>
          </section>

          <section className="px-4 mt-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Members
            </p>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}` }}
            >
              {members.map((m, i) => {
                const r = ROLES[m.role];
                return (
                  <div
                    key={m.id}
                    className="px-3.5 py-3 flex items-center gap-3"
                    style={{ borderTop: i > 0 ? `1px solid ${t.border}` : "none" }}
                  >
                    <div
                      className="size-10 rounded-2xl grid place-items-center text-[12px] font-bold shrink-0"
                      style={{ background: `${r.c}15`, color: r.c }}
                    >
                      {m.name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((s) => s[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold leading-tight truncate">
                        {m.name}
                      </p>
                      <p className="text-[10.5px] mt-0.5 truncate" style={{ color: t.muted }}>
                        {m.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: `${r.c}15`, color: r.c }}
                        >
                          {m.role === "owner" ? (
                            <Crown className="size-2.5" strokeWidth={2.6} />
                          ) : (
                            <ShieldCheck className="size-2.5" strokeWidth={2.6} />
                          )}
                          {r.label}
                        </span>
                        {m.status === "pending" && (
                          <span
                            className="text-[9.5px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full"
                            style={{ background: `${t.warn}15`, color: t.warn }}
                          >
                            Invite sent
                          </span>
                        )}
                      </div>
                    </div>
                    {m.role !== "owner" && (
                      <button onClick={() => toast(`${m.name} · manage role or remove`)} style={{ color: t.muted }}>
                        <MoreVertical className="size-4" strokeWidth={2.4} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="px-4 mt-5 mb-4">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2"
              style={{ color: t.muted }}
            >
              Roles in this workspace
            </p>
            <div className="space-y-2">
              {Object.entries(ROLES).map(([key, r]) => (
                <div
                  key={key}
                  className="rounded-2xl p-3 flex items-center gap-3"
                  style={{ background: t.surface, border: `1px solid ${t.border}` }}
                >
                  <div
                    className="size-8 rounded-lg grid place-items-center"
                    style={{ background: `${r.c}15`, color: r.c }}
                  >
                    <Package2 className="size-4" strokeWidth={2.3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-bold" style={{ color: r.c }}>
                      {r.label}
                    </p>
                    <p className="text-[10.5px] mt-0.5" style={{ color: t.muted }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Invite sheet */}
          {inviting && (
            <>
              <div
                className="absolute inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)" }}
                onClick={() => setInviting(false)}
              />
              <div
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl p-4 pb-6"
                style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
              >
                <p className="text-[14px] font-bold mb-3">Invite a teammate</p>
                <div
                  className="rounded-2xl p-3"
                  style={{ background: t.bg, border: `1px solid ${t.border}` }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: t.muted }}
                  >
                    Email
                  </p>
                  <input
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@huayi.cn"
                    className="w-full mt-1 bg-transparent outline-none text-[13px] font-bold"
                    style={{ color: t.ink }}
                  />
                </div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.14em] mt-3 mb-1.5"
                  style={{ color: t.muted }}
                >
                  Role
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ROLES) as RoleKey[])
                    .filter((k) => k !== "owner")
                    .map((k) => {
                      const r = ROLES[k];
                      const sel = role === k;
                      return (
                        <button
                          key={k}
                          onClick={() => setRole(k)}
                          className="p-2.5 rounded-xl text-left"
                          style={{
                            background: sel ? `${r.c}12` : t.bg,
                            border: `1.5px solid ${sel ? r.c : t.border}`,
                          }}
                        >
                          <p
                            className="text-[11.5px] font-bold"
                            style={{ color: sel ? r.c : t.ink }}
                          >
                            {r.label}
                          </p>
                          <p className="text-[9.5px] mt-0.5" style={{ color: t.muted }}>
                            {r.desc}
                          </p>
                        </button>
                      );
                    })}
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setInviting(false)}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold"
                    style={{
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.ink,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={invite}
                    className="flex-1 h-11 rounded-full text-[12px] font-bold text-white"
                    style={{ background: t.navy }}
                  >
                    Send invite
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}
