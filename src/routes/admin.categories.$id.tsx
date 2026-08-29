import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminCategory } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories/$id")({
  head: () => ({ meta: [{ title: "Category — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminCategory(id)
      .then(setRow)
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load category");
        setRow(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Category" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Categories", to: "/admin/categories" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Category" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Categories", to: "/admin/categories" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Category not found.</p>
      </AdminShell>
    );
  }

  const count = (row._count as { products?: number } | undefined)?.products ?? 0;
  const parcel = row.defaultParcelType as { name?: string } | null | undefined;

  return (
    <AdminShell title={String(row.name)} breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Categories", to: "/admin/categories" }, { label: String(row.slug) }]}>
      <Link to="/admin/categories" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-4" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" /> Categories
      </Link>
      <div className="rounded-xl p-4 max-w-lg space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <Field label="Slug" value={String(row.slug)} mono />
        <Field label="Products" value={String(count)} />
        <Field label="Default parcel type" value={parcel?.name ?? "—"} />
        <Field label="ID" value={String(row.id)} mono />
      </div>
    </AdminShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1 text-[13px] font-semibold" style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : undefined }}>{value}</p>
    </div>
  );
}
