import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminFxConversions, fmtMoney, type AdminFxConversion } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fx/orders/$id")({
  head: () => ({ meta: [{ title: "FX order — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminFxConversion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAdminFxConversions();
        const found = list.find((c) => c.id === id) ?? null;
        if (!cancelled) setRow(found);
        if (!cancelled && !found) toast.error("Conversion not found");
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load conversion");
          setRow(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <AdminShell
        title="FX order"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX orders", to: "/admin/fx/orders" }, { label: id }]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell
        title="FX order"
        breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "FX orders", to: "/admin/fx/orders" }, { label: id }]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Conversion not found.
        </p>
        <Link to="/admin/fx/orders" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: T.navy }}>
          <ArrowLeft className="size-3.5" /> Back to FX orders
        </Link>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={`FX ${row.id.slice(0, 8)}`}
      description={`${row.fromCurrency} → ${row.toCurrency}`}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "FX orders", to: "/admin/fx/orders" },
        { label: row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/fx/orders"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      <div className="rounded-xl p-4 space-y-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          <Pill tone="info">
            {row.fromCurrency}/{row.toCurrency}
          </Pill>
          <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date(row.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[12.5px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              From
            </p>
            <p className="mt-1 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(row.fromCurrency, row.fromMinor)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              To
            </p>
            <p className="mt-1 font-bold tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {fmtMoney(row.toCurrency, row.toMinor)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Rate applied
            </p>
            <p className="mt-1 tabular-nums font-semibold" style={{ color: T.accent, fontFamily: "'JetBrains Mono', monospace" }}>
              {Number(row.rateApplied).toFixed(8)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              User
            </p>
            <p className="mt-1 font-semibold">{row.user?.name ?? "—"}</p>
            {row.user && (
              <Link
                to="/admin/users/$id"
                params={{ id: row.user.id }}
                className="text-[11px] tabular-nums hover:underline"
                style={{ color: T.info, fontFamily: "'JetBrains Mono', monospace" }}
              >
                {row.user.id.slice(0, 8)}
              </Link>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Conversion ID
            </p>
            <p className="mt-1 text-[11px] tabular-nums break-all" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {row.id}
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
