import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Command, Users, ShoppingBag, Wallet, ShieldCheck,
  Truck, Lock, Store, ArrowRight, Loader2,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  fetchAdminEscrows,
  fetchAdminKyc,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminSellers,
  fetchAdminTransfers,
  fetchAdminUsers,
  fmtMoney,
} from "@/lib/api";

export const Route = createFileRoute("/admin/search")({
  head: () => ({ meta: [{ title: "Global search — MagnetPay Admin" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: AdminSearch,
});

type Kind = "user" | "order" | "tx" | "listing" | "doc" | "shipment" | "escrow" | "seller";

type Hit = {
  kind: Kind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  to: string;
  params?: Record<string, string>;
  amt?: string;
};

const KIND_META: Record<Kind, { label: string; I: typeof Users; color: string }> = {
  user: { label: "User", I: Users, color: T.navy },
  order: { label: "Order", I: ShoppingBag, color: T.info },
  tx: { label: "Transaction", I: Wallet, color: T.accent },
  listing: { label: "Listing", I: ShoppingBag, color: T.success },
  doc: { label: "KYC", I: ShieldCheck, color: T.muted },
  shipment: { label: "Shipment", I: Truck, color: T.info },
  escrow: { label: "Escrow", I: Lock, color: T.navy },
  seller: { label: "Seller", I: Store, color: T.success },
};

const FILTERS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "user", label: "Users" },
  { id: "order", label: "Orders" },
  { id: "tx", label: "Transactions" },
  { id: "listing", label: "Listings" },
  { id: "doc", label: "KYC" },
  { id: "escrow", label: "Escrow" },
  { id: "seller", label: "Sellers" },
];

function str(v: unknown, fallback = "") {
  if (v == null) return fallback;
  return String(v);
}

function AdminSearch() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ);
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [index, setIndex] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [users, orders, transfers, products, escrows, kyc, sellers] = await Promise.all([
          fetchAdminUsers(),
          fetchAdminOrders(),
          fetchAdminTransfers(),
          fetchAdminProducts(),
          fetchAdminEscrows(),
          fetchAdminKyc(),
          fetchAdminSellers(),
        ]);

        const hits: Hit[] = [];

        for (const u of users) {
          hits.push({
            kind: "user",
            id: u.id,
            title: u.name,
            subtitle: `${u.phone}${u.email ? ` · ${u.email}` : ""}`,
            href: `/admin/users/${u.id}`,
            to: "/admin/users/$id",
            params: { id: u.id },
          });
        }

        for (const raw of orders) {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          hits.push({
            kind: "order",
            id,
            title: `Order ${id.slice(0, 8)}`,
            subtitle: `${str(r.status)} · ${str(user.name)}`,
            href: `/admin/orders/${id}`,
            to: "/admin/orders/$id",
            params: { id },
            amt: fmtMoney(str(r.currency, "NGN"), r.totalMinor as string | number),
          });
        }

        for (const t of transfers) {
          hits.push({
            kind: "tx",
            id: t.id,
            title: `Transfer ${t.id.slice(0, 8)}`,
            subtitle: `${t.status}${t.sender?.name ? ` · ${t.sender.name}` : ""}`,
            href: `/admin/transactions/${t.id}`,
            to: "/admin/transactions/$id",
            params: { id: t.id },
            amt: fmtMoney(t.currency, t.amountMinor),
          });
        }

        for (const raw of products) {
          const r = raw as Record<string, unknown>;
          const id = str(r.id);
          hits.push({
            kind: "listing",
            id,
            title: str(r.title, "Product"),
            subtitle: str(r.status, "—"),
            href: `/admin/listings/${id}`,
            to: "/admin/listings/$id",
            params: { id },
          });
        }

        for (const e of escrows) {
          hits.push({
            kind: "escrow",
            id: e.id,
            title: e.title ?? `Escrow ${e.id.slice(0, 8)}`,
            subtitle: e.status,
            href: `/admin/escrow/${e.id}`,
            to: "/admin/escrow/$id",
            params: { id: e.id },
            amt: fmtMoney(e.currency, e.amountMinor),
          });
        }

        for (const row of kyc) {
          hits.push({
            kind: "doc",
            id: row.id,
            title: row.user.name,
            subtitle: `${row.status} · ${row.type}`,
            href: `/admin/kyc/${row.id}`,
            to: "/admin/kyc/$id",
            params: { id: row.id },
          });
        }

        for (const raw of sellers.sellers) {
          const r = raw as Record<string, unknown>;
          const user = (r.user ?? {}) as Record<string, unknown>;
          const id = str(r.id);
          hits.push({
            kind: "seller",
            id,
            title: str(r.name, str(user.name, "Seller")),
            subtitle: str(user.phone, "—"),
            href: `/admin/sellers/${id}`,
            to: "/admin/sellers/$id",
            params: { id },
          });
        }

        setIndex(hits);
      } catch {
        setIndex([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return index.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (!needle) return true;
      return (
        r.id.toLowerCase().includes(needle) ||
        r.title.toLowerCase().includes(needle) ||
        r.subtitle.toLowerCase().includes(needle)
      );
    });
  }, [q, filter, index]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: index.length };
    for (const r of index) c[r.kind] = (c[r.kind] ?? 0) + 1;
    return c;
  }, [index]);

  return (
    <AdminShell title="Global search" description="Search live records from the API.">
      <div className="rounded-xl p-2 flex items-center gap-2" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="size-9 rounded-lg grid place-items-center" style={{ background: `${T.navy}10`, color: T.navy }}>
          <Search className="size-4" strokeWidth={2.4} />
        </div>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, phone, ID, status…"
          className="flex-1 bg-transparent text-[14px] outline-none placeholder:opacity-50"
          style={{ color: T.ink }}
        />
        <kbd className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded font-bold" style={{ background: T.bg, color: T.muted, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
          <Command className="size-3" strokeWidth={2.6} /> K
        </kbd>
      </div>

      <div className="mt-4 flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const count = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5"
              style={{ background: active ? T.navy : T.surface, color: active ? "#fff" : T.ink, border: `1px solid ${active ? T.navy : T.border}` }}
            >
              {f.label}
              <span className="text-[10px] tabular-nums opacity-80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              {results.length} result{results.length === 1 ? "" : "s"}
              {q ? <> for "<span style={{ color: T.ink }}>{q}</span>"</> : null}
            </p>

            {results.length === 0 ? (
              <div className="mt-3 rounded-xl p-10 text-center" style={{ background: T.surface, border: `1px dashed ${T.border}`, color: T.sub }}>
                <p className="text-[13px] font-semibold" style={{ color: T.ink }}>No matches</p>
                <p className="mt-1 text-[12px]">Try a different ID, name, or remove filters.</p>
              </div>
            ) : (
              <ul className="mt-3 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                {results.slice(0, 50).map((r, i) => {
                  const meta = KIND_META[r.kind];
                  return (
                    <li key={r.kind + r.id} style={{ borderBottom: i < Math.min(results.length, 50) - 1 ? `1px solid ${T.border}` : "none" }}>
                      <Link
                        to={r.to as never}
                        params={r.params as never}
                        className="flex items-center gap-3 px-4 h-16 hover:bg-[rgba(14,59,46,0.03)] transition group"
                      >
                        <div className="size-9 rounded-lg grid place-items-center shrink-0" style={{ background: `${meta.color}14`, color: meta.color }}>
                          <meta.I className="size-4" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold truncate" style={{ color: T.ink }}>{r.title}</p>
                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.12em]" style={{ background: `${meta.color}14`, color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-[11.5px] truncate" style={{ color: T.sub }}>
                            <span className="tabular-nums font-semibold mr-1.5" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                              {r.id.slice(0, 12)}
                            </span>
                            {r.subtitle}
                          </p>
                        </div>
                        {r.amt ? (
                          <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>
                            {r.amt}
                          </span>
                        ) : null}
                        <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 transition" strokeWidth={2.2} style={{ color: T.muted }} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
