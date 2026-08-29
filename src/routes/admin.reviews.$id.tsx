import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminReview } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews/$id")({
  head: () => ({ meta: [{ title: "Review — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminReview(id)
      .then(setRow)
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load review");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Review" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Reviews", to: "/admin/reviews" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Review" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Reviews", to: "/admin/reviews" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Review not found.</p>
      </AdminShell>
    );
  }

  const user = row.user as { name?: string } | undefined;
  const product = row.product as { id?: string; title?: string } | undefined;

  return (
    <AdminShell title="Product review" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Reviews", to: "/admin/reviews" }, { label: id.slice(0, 8) }]}>
      <Link to="/admin/reviews" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-4" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" /> Reviews
      </Link>
      <div className="rounded-xl p-4 max-w-xl space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Field label="Rating" value={`${String(row.rating)} / 5`} />
        <Field label="Reviewer" value={user?.name ?? "—"} />
        <Field label="Product" value={product?.title ?? "—"} />
        {product?.id ? (
          <Link to="/admin/listings/$id" params={{ id: product.id }} className="text-[12px] font-semibold" style={{ color: T.navy }}>
            Open listing →
          </Link>
        ) : null}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>Comment</p>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: T.ink }}>{String(row.comment ?? row.body ?? "—")}</p>
        </div>
        <Field label="Posted" value={row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : "—"} />
      </div>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1 text-[13px] font-semibold">{value}</p>
    </div>
  );
}
