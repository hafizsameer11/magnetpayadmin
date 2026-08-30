import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2, Package, Star, ShieldCheck, Users, Save, Building2,
} from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { SellerHeader } from "@/components/admin/SellerProfile";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminSeller, fmtMoney, patchAdminSeller, type AdminSeller } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sellers/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: string } => ({
    tab: typeof s.tab === "string" ? s.tab : "overview",
  }),
  head: () => ({ meta: [{ title: "Seller — MagnetPay Admin" }] }),
  component: SellerDetail,
});

function SellerDetail() {
  const { id } = Route.useParams();
  const { tab = "overview" } = Route.useSearch();
  const [seller, setSeller] = useState<AdminSeller | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const s = await fetchAdminSeller(id);
      setSeller(s);
      setVerified(s.verified);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load seller");
      setSeller(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveVerified = async () => {
    if (!seller || saving) return;
    setSaving(true);
    try {
      await patchAdminSeller(seller.id, { verified });
      toast.success("Seller updated");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Seller" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!seller) {
    return (
      <AdminShell title="Seller" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Seller store not found.</p>
      </AdminShell>
    );
  }

  const products = seller.products ?? [];
  const productCount = seller._count?.products ?? products.length;
  const avgRating = products.length
    ? products.reduce((s, p) => s + (p.rating ?? 0), 0) / products.length
    : 0;
  const activeProducts = products.filter((p) => p.active).length;

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Sellers", to: "/admin/sellers" },
        { label: seller.name },
      ]}
    >
      <SellerHeader seller={seller} tab={tab} />

      {tab === "overview" ? (
        <>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { I: Package, label: "Products", val: String(productCount), tone: T.navy },
              { I: ShieldCheck, label: "Active listings", val: String(activeProducts), tone: T.success },
              { I: Star, label: "Avg rating", val: avgRating > 0 ? avgRating.toFixed(1) : "—", tone: T.warn },
              { I: Users, label: "Team members", val: String(seller._count?.members ?? 0), tone: T.info },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3.5" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-md grid place-items-center" style={{ background: `${s.tone}14`, color: s.tone }}>
                    <s.I className="size-3.5" strokeWidth={2.4} />
                  </div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: T.ink }}>{s.label}</p>
                </div>
                <p className="mt-2 text-[20px] font-bold tabular-nums leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>Store</p>
              <dl className="space-y-2 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt style={{ color: T.sub }}>Name</dt>
                  <dd className="font-semibold text-right">{seller.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: T.sub }}>Verification</dt>
                  <dd>{seller.verified ? <Pill tone="success">Verified</Pill> : <Pill tone="warn">Unverified</Pill>}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: T.sub }}>Created</dt>
                  <dd className="tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(seller.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
              {seller.description ? (
                <p className="text-[12px] pt-2 border-t" style={{ borderColor: T.border, color: T.sub }}>{seller.description}</p>
              ) : null}
              <div className="pt-2 border-t flex items-center gap-2" style={{ borderColor: T.border }}>
                <label className="flex items-center gap-2 text-[12px] font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="accent-[#0E3B2E]"
                  />
                  Verified seller
                </label>
                <button
                  type="button"
                  onClick={() => void saveVerified()}
                  disabled={saving || verified === seller.verified}
                  className="h-8 px-3 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 disabled:opacity-60"
                  style={{ background: T.navy }}
                >
                  {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                  Save
                </button>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>Owner</p>
              {seller.user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full grid place-items-center text-[12px] font-bold" style={{ background: `${T.navy}10`, color: T.navy }}>
                      <Building2 className="size-4" strokeWidth={2.2} />
                    </div>
                    <div>
                      <Link to="/admin/users/$id" params={{ id: seller.user.id }} className="text-[14px] font-bold hover:underline" style={{ color: T.navy }}>
                        {seller.user.name}
                      </Link>
                      <p className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {seller.user.phone}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/admin/users/$id"
                    params={{ id: seller.user.id }}
                    className="inline-block mt-4 text-[12px] font-semibold hover:underline"
                    style={{ color: T.info }}
                  >
                    Open user profile →
                  </Link>
                </>
              ) : (
                <p className="text-[12px]" style={{ color: T.muted }}>No owner linked.</p>
              )}
            </div>
          </div>
        </>
      ) : null}

      {tab === "products" || tab === "overview" ? (
        tab === "products" ? (
          <div className="mt-5 rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
            <div
              className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{
                color: T.muted,
                background: T.bg,
                borderBottom: `1px solid ${T.border}`,
                gridTemplateColumns: "2fr 1fr 1fr 1fr 0.8fr",
              }}
            >
              <span>Product</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
              <span>Status</span>
              <span className="text-right">Rating</span>
            </div>
            {products.map((p, i) => (
              <div
                key={p.id}
                className="grid items-center px-4 h-[52px] text-[12px]"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 0.8fr",
                  borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : "none",
                }}
              >
                <div className="min-w-0">
                  <Link to="/admin/listings/$id" params={{ id: p.id }} className="font-semibold truncate block hover:underline" style={{ color: T.navy }}>
                    {p.title}
                  </Link>
                  <p className="text-[10px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.id.slice(0, 8)}
                  </p>
                </div>
                <span className="text-right tabular-nums font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {fmtMoney(p.currency, p.priceMinor)}
                </span>
                <span className="text-right tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.stock ?? "—"}
                </span>
                <Pill tone={p.active ? "success" : "neutral"}>{p.active ? "Active" : "Hidden"}</Pill>
                <span className="text-right tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {p.rating?.toFixed(1) ?? "—"}
                </span>
              </div>
            ))}
            {!products.length ? (
              <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No products listed yet.</p>
            ) : null}
          </div>
        ) : null
      ) : null}

      {tab === "owner" ? (
        <div className="mt-5 rounded-xl p-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {seller.user ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="size-14 rounded-full grid place-items-center text-[15px] font-bold" style={{ background: `${T.navy}10`, color: T.navy }}>
                {seller.user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold">{seller.user.name}</h3>
                <p className="text-[12px] mt-1 tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                  {seller.user.phone}
                  {seller.user.email ? ` · ${seller.user.email}` : ""}
                </p>
              </div>
              <Link
                to="/admin/users/$id"
                params={{ id: seller.user.id }}
                className="h-9 px-4 rounded-lg text-[12px] font-bold text-white inline-flex items-center"
                style={{ background: T.navy }}
              >
                Open profile
              </Link>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: T.muted }}>No owner account linked to this store.</p>
          )}
        </div>
      ) : null}
    </AdminShell>
  );
}
