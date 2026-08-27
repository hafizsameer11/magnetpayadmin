import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, EyeOff, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminProducts, fmtMoney, moderateProduct } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/$id/")({
  head: () => ({ meta: [{ title: "Listing — MagnetPay Admin" }] }),
  component: Page,
});

type Tone = "success" | "warn" | "danger" | "info" | "neutral";

function str(v: unknown, fallback = "—") {
  if (v == null) return fallback;
  return String(v);
}

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await fetchAdminProducts();
      const found = list.find((p) => str((p as Record<string, unknown>).id) === id) as Record<string, unknown> | undefined;
      setRow(found ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load product");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const moderate = async (status: "APPROVED" | "HIDDEN") => {
    if (busy) return;
    setBusy(true);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Product approved" : "Product hidden");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Moderation failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Listing" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Listing" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>
          Product not found.
        </p>
        <Link to="/admin/listings" className="mt-3 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
          <ArrowLeft className="size-3" /> Back
        </Link>
      </AdminShell>
    );
  }

  const store = (row.store ?? {}) as Record<string, unknown>;
  const cat = (row.category ?? {}) as Record<string, unknown>;
  const active = row.active === true;
  const tone: Tone = active ? "success" : "warn";

  return (
    <AdminShell
      title={str(row.title)}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: str(row.id).slice(0, 8) }]}
      actions={
        <>
          <Pill tone={tone}>{active ? "Active" : "Hidden"}</Pill>
          {!active ? (
            <button
              disabled={busy}
              onClick={() => void moderate("APPROVED")}
              className="h-9 px-3 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: T.success }}
            >
              <Check className="size-3.5" /> Approve
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={() => void moderate("HIDDEN")}
              className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.warn }}
            >
              <EyeOff className="size-3.5" /> Hide
            </button>
          )}
        </>
      }
    >
      <div className="rounded-xl p-4 flex gap-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {row.imageUrl ? (
          <img src={str(row.imageUrl)} alt="" className="size-24 rounded-lg object-cover shrink-0" style={{ border: `1px solid ${T.border}` }} />
        ) : (
          <div className="size-24 rounded-lg shrink-0 grid place-items-center text-[11px]" style={{ background: T.bg, color: T.muted, border: `1px solid ${T.border}` }}>
            No image
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
            {str(row.id)} · {str(cat.name, "Uncategorized")}
          </p>
          <p className="text-[22px] font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {fmtMoney(str(row.currency, "USD"), row.priceMinor as string | number)}
          </p>
          <p className="text-[12.5px]" style={{ color: T.sub }}>
            {str(row.description, "No description")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <KV label="Store" v={str(store.name)} />
        <KV label="MOQ" v={str(row.moq)} />
        <KV label="Rating" v={typeof row.rating === "number" ? row.rating.toFixed(1) : str(row.rating)} />
        <KV label="Created" v={row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : "—"} />
      </div>

      <Link to="/admin/listings" className="mt-4 inline-flex text-[11px] font-semibold items-center gap-1" style={{ color: T.sub }}>
        <ArrowLeft className="size-3" /> Back to listings
      </Link>
    </AdminShell>
  );
}

function KV({ label, v }: { label: string; v: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}
