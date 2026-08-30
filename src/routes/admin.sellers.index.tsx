import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Store, LineChart, Star, AlertTriangle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { Pill, initials } from "@/components/admin/UserProfile";
import { fetchAdminSellers, fmtMoney, fromMinor, patchAdminSeller, type AdminSeller } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/")({
  head: () => ({ meta: [{ title: "Sellers — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

const SELLER_GRID =
  "minmax(200px,2.2fr) 0.55fr 0.75fr 0.85fr 0.75fr 0.9fr 0.65fr minmax(96px,0.95fr) 52px";
const SELLER_TABLE_MIN = 1040;

function fmtCompactUsd(minor: string | number) {
  const n = fromMinor(minor);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return fmtMoney("USD", minor);
}

function tierTone(tier: string): Tone {
  if (tier === "PLATINUM") return "info";
  if (tier === "GOLD") return "warn";
  if (tier === "SILVER") return "success";
  return "neutral";
}

function statusTone(status: string): Tone {
  if (status === "TOP SELLER") return "success";
  if (status === "ACTIVE") return "info";
  if (status === "HIGH RISK") return "danger";
  if (status === "BLOCKED") return "danger";
  return "warn";
}

function Page() {
  const [rows, setRows] = useState<AdminSeller[]>([]);
  const [summary, setSummary] = useState({
    activeSellers: 0,
    gmv30dMinor: "0",
    avgRating: 0,
    flaggedBlocked: 0,
  });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    void fetchAdminSellers()
      .then((data) => {
        setRows(data.sellers);
        setSummary(data.summary);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load sellers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      (r.user?.name ?? "").toLowerCase().includes(q) ||
      (r.user?.phone ?? "").includes(q) ||
      (r.tier ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Sellers"
      description="Approved sellers across the platform. Tier, performance and risk at a glance."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "People" }, { label: "Sellers" }]}
      actions={
        <>
          <Link
            to="/admin/sellers/applications"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Applications
          </Link>
          <Link
            to="/admin/sellers/tiers"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
          >
            Tiers
          </Link>
          <Link
            to="/admin/sellers/payouts"
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            Payouts
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { I: Store, label: "Active sellers", val: String(summary.activeSellers), tone: T.success },
          { I: LineChart, label: "GMV 30D", val: fmtCompactUsd(summary.gmv30dMinor), tone: T.info },
          { I: Star, label: "Avg rating", val: summary.avgRating ? summary.avgRating.toFixed(2) : "—", tone: T.warn },
          { I: AlertTriangle, label: "Flagged / blocked", val: String(summary.flaggedBlocked), tone: T.danger },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                <s.I className="size-3.5" strokeWidth={2.4} />
              </div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>
                {s.label}
              </p>
            </div>
            <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
              {s.val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg flex-1 max-w-md" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <Search className="size-3.5 shrink-0" style={{ color: T.muted }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seller…"
            className="bg-transparent text-[12px] outline-none flex-1 min-w-0"
            style={{ color: T.ink }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-x-auto" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ minWidth: SELLER_TABLE_MIN }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: SELLER_GRID,
          }}
        >
          <span>Seller</span>
          <span>Country</span>
          <span>Tier</span>
          <span>Rating</span>
          <span className="text-right">Orders 30D</span>
          <span className="text-right">GMV 30D</span>
          <span className="text-right">Dispute %</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <p className="p-8 text-center text-[12px]" style={{ color: T.muted }}>
            Loading sellers…
          </p>
        ) : null}

        {!loading &&
          filtered.map((r, i) => {
            const owner = r.user;
            const tier = r.tier ?? "NEW";
            const status = r.status ?? "PENDING";
            return (
              <div
                key={r.id}
                className="grid items-center px-4 min-h-[60px] text-[12px]"
                style={{
                  gridTemplateColumns: SELLER_GRID,
                  borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 py-2">
                  <div
                    className="size-9 rounded-full grid place-items-center shrink-0 text-[11px] font-bold"
                    style={{ background: `${T.navy}10`, color: T.navy }}
                  >
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0">
                    <Link to="/admin/sellers/$id" params={{ id: r.id }} className="font-semibold truncate hover:underline block" style={{ color: T.ink }}>
                      {r.name}
                    </Link>
                    <p className="text-[10px] tabular-nums truncate" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                      SE-{r.id.slice(0, 6).toUpperCase()} · U-{owner?.id.slice(0, 5).toUpperCase() ?? "—"}
                    </p>
                  </div>
                </div>
                <span className="tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.sub }}>
                  {r.country ?? "—"}
                </span>
                <Pill tone={tierTone(tier)}>{tier}</Pill>
                <span className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace", color: T.ink }}>
                  {r.rating ? (
                    <>
                      <Star className="inline size-3 mr-0.5 -mt-0.5" strokeWidth={2.4} style={{ color: T.warn }} />
                      {r.rating.toFixed(1)}
                      <span style={{ color: T.muted }}> ({r.reviewCount ?? 0})</span>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.orders30d ?? 0}
                </span>
                <span className="text-right tabular-nums font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.gmv30Minor ? fmtMoney("USD", r.gmv30Minor) : "—"}
                </span>
                <span
                  className="text-right tabular-nums font-semibold"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: (r.disputePct ?? 0) >= 3 ? T.danger : T.sub,
                  }}
                >
                  {(r.disputePct ?? 0).toFixed(1)}%
                </span>
                <div className="min-w-0 pr-1">
                  <Pill tone={statusTone(status)}>{status}</Pill>
                </div>
                <div
                  className="sticky right-0 z-[1] flex justify-end shrink-0 pl-2"
                  style={{ background: T.surface }}
                >
                  <ActionMenu
                  label={`Actions for ${r.name}`}
                  items={[
                    {
                      id: "view",
                      label: "View profile",
                      onClick: () => {
                        window.location.href = `/admin/sellers/${r.id}`;
                      },
                    },
                    {
                      id: "verify",
                      label: r.verified ? "Mark unverified" : "Mark verified",
                      onClick: () => {
                        void patchAdminSeller(r.id, { verified: !r.verified })
                          .then(() => {
                            toast.success(r.verified ? "Seller unverified" : "Seller verified");
                            load();
                          })
                          .catch((e) => toast.error(e instanceof Error ? e.message : "Update failed"));
                      },
                    },
                    ...(owner
                      ? [
                          {
                            id: "owner",
                            label: "View owner",
                            onClick: () => {
                              window.location.href = `/admin/users/${owner.id}`;
                            },
                          },
                        ]
                      : []),
                  ]}
                  />
                </div>
              </div>
            );
          })}

        {!loading && !filtered.length ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No sellers match your search.
          </p>
        ) : null}
        </div>
      </div>
    </AdminShell>
  );
}
