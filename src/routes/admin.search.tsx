import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Command, Users, ShoppingBag, Wallet, ShieldCheck, MessageSquare,
  Truck, Lock, Coins, FileText, Store, ArrowRight,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/search")({
  head: () => ({ meta: [{ title: "Global search — MagnetPay Admin" }] }),
  component: AdminSearch,
});

type Kind = "user" | "order" | "tx" | "listing" | "ticket" | "shipment" | "escrow" | "fx" | "doc" | "seller";

const KIND_META: Record<Kind, { label: string; I: typeof Users; color: string }> = {
  user:     { label: "User",      I: Users,         color: T.navy },
  order:    { label: "Order",     I: ShoppingBag,   color: T.info },
  tx:       { label: "Transaction", I: Wallet,      color: T.accent },
  listing:  { label: "Listing",   I: ShoppingBag,   color: T.success },
  ticket:   { label: "Ticket",    I: MessageSquare, color: T.warn },
  shipment: { label: "Shipment",  I: Truck,         color: T.info },
  escrow:   { label: "Escrow",    I: Lock,          color: T.navy },
  fx:       { label: "FX order",  I: Coins,         color: T.accent },
  doc:      { label: "KYC doc",   I: FileText,      color: T.muted },
  seller:   { label: "Seller",    I: Store,         color: T.success },
};

const ALL: { kind: Kind; id: string; title: string; subtitle: string; href: string; amt?: string }[] = [
  { kind: "user",     id: "U-10241", title: "Chidi Okoro",         subtitle: "chidi@magnetpay.io · NG · Importer",        href: "/admin/users/U-10241" },
  { kind: "user",     id: "U-10240", title: "Guangzhou Huayi Co.", subtitle: "ops@gz-huayi.cn · CN · Supplier",            href: "/admin/users/U-10240" },
  { kind: "order",    id: "O-30221", title: "Order O-30221",       subtitle: "Refunded · Adaeze Marketplace",              href: "/admin/orders/O-30221", amt: "$1,240" },
  { kind: "order",    id: "O-30240", title: "Order O-30240",       subtitle: "Processing · Tunde Bello → Shenzhen Lumen",  href: "/admin/orders/O-30240", amt: "$8,420" },
  { kind: "tx",       id: "T-77821", title: "Transaction T-77821", subtitle: "Withdrawal · pending approval",              href: "/admin/transactions/T-77821", amt: "$22,000" },
  { kind: "tx",       id: "T-77804", title: "Transaction T-77804", subtitle: "FX execution · CNY → NGN",                    href: "/admin/transactions/T-77804", amt: "$3,400" },
  { kind: "listing",  id: "L-22198", title: "Industrial mixer 30L",subtitle: "Foshan Ceramics · auto-paused",              href: "/admin/listings/L-22198" },
  { kind: "ticket",   id: "TK-9921", title: "Refund request — order O-30180", subtitle: "Open · 4h since last reply",        href: "/admin/tickets/TK-9921" },
  { kind: "shipment", id: "S-50412", title: "Shipment S-50412",    subtitle: "Stuck in customs · Lagos",                    href: "/admin/shipments/S-50412" },
  { kind: "escrow",   id: "E-90412", title: "Escrow E-90412",      subtitle: "Released · Chidi ↔ Guangzhou Huayi",          href: "/admin/escrow/E-90412", amt: "$8,420" },
  { kind: "fx",       id: "F-12044", title: "FX order F-12044",    subtitle: "NGN → CNY · executed",                        href: "/admin/fx/orders/F-12044", amt: "$12,800" },
  { kind: "doc",      id: "K-3318",  title: "KYC submission K-3318", subtitle: "Adaeze Marketplace · awaiting review",      href: "/admin/kyc/K-3318" },
  { kind: "seller",   id: "SE-441",  title: "Foshan Ceramics",     subtitle: "Tier 2 · flagged · CN",                       href: "/admin/sellers/SE-441" },
];

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "user",     label: "Users" },
  { id: "order",    label: "Orders" },
  { id: "tx",       label: "Transactions" },
  { id: "listing",  label: "Listings" },
  { id: "ticket",   label: "Tickets" },
  { id: "shipment", label: "Shipments" },
  { id: "escrow",   label: "Escrow" },
  { id: "fx",       label: "FX" },
];

function AdminSearch() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Kind>("all");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (!needle) return true;
      return (
        r.id.toLowerCase().includes(needle) ||
        r.title.toLowerCase().includes(needle) ||
        r.subtitle.toLowerCase().includes(needle)
      );
    });
  }, [q, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ALL.length };
    for (const r of ALL) c[r.kind] = (c[r.kind] ?? 0) + 1;
    return c;
  }, []);

  return (
    <AdminShell
      title="Global search"
      description="Find any user, order, transaction, listing, ticket, shipment or escrow."
    >
      {/* Search input */}
      <div
        className="rounded-xl p-2 flex items-center gap-2"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div
          className="size-9 rounded-lg grid place-items-center"
          style={{ background: `${T.navy}10`, color: T.navy }}
        >
          <Search className="size-4" strokeWidth={2.4} />
        </div>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, ID, reference, amount…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-50"
          style={{ color: T.ink }}
        />
        <kbd
          className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded font-bold"
          style={{
            background: T.bg,
            color: T.muted,
            border: `1px solid ${T.border}`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <Command className="size-3" strokeWidth={2.6} /> K
        </kbd>
      </div>

      {/* Filter chips */}
      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
              style={{
                background: active ? T.navy : T.surface,
                color: active ? "#fff" : T.ink,
                border: `1px solid ${active ? T.navy : T.border}`,
              }}
            >
              {f.label}
              <span
                className="text-[10px] tabular-nums opacity-80"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
          {results.length} result{results.length === 1 ? "" : "s"}
          {q && <> for "<span style={{ color: T.ink }}>{q}</span>"</>}
        </p>

        {results.length === 0 ? (
          <div
            className="mt-3 rounded-xl p-10 text-center"
            style={{ background: T.surface, border: `1px dashed ${T.border}`, color: T.sub }}
          >
            <p className="text-[13px] font-semibold" style={{ color: T.ink }}>No matches</p>
            <p className="mt-1 text-[12px]">Try a different ID, name, or remove filters.</p>
          </div>
        ) : (
          <ul
            className="mt-3 rounded-xl overflow-hidden"
            style={{ background: T.surface, border: `1px solid ${T.border}` }}
          >
            {results.map((r, i) => {
              const meta = KIND_META[r.kind];
              return (
                <li
                  key={r.kind + r.id}
                  style={{ borderBottom: i < results.length - 1 ? `1px solid ${T.border}` : "none" }}
                >
                  <Link
                    to={r.href}
                    className="flex items-center gap-3 px-4 h-16 hover:bg-[rgba(14,59,46,0.03)] transition group"
                  >
                    <div
                      className="size-9 rounded-lg grid place-items-center shrink-0"
                      style={{ background: `${meta.color}14`, color: meta.color }}
                    >
                      <meta.I className="size-4" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold truncate" style={{ color: T.ink }}>
                          {r.title}
                        </p>
                        <span
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]"
                          style={{ background: `${meta.color}14`, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11.5px] truncate" style={{ color: T.sub }}>
                        <span
                          className="tabular-nums font-semibold mr-1.5"
                          style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {r.id}
                        </span>
                        {r.subtitle}
                      </p>
                    </div>
                    {r.amt && (
                      <span
                        className="text-[13px] font-bold tabular-nums shrink-0"
                        style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {r.amt}
                      </span>
                    )}
                    <ArrowRight
                      className="size-4 opacity-0 group-hover:opacity-100 transition"
                      strokeWidth={2.2}
                      style={{ color: T.muted }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Keyboard help */}
        <div className="mt-5 flex items-center gap-4 text-[11px]" style={{ color: T.muted }}>
          <span className="flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded font-bold text-[10px]"
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                color: T.sub,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded font-bold text-[10px]"
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                color: T.sub,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ↵
            </kbd>
            open
          </span>
          <span className="flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded font-bold text-[10px]"
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                color: T.sub,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </AdminShell>
  );
}
