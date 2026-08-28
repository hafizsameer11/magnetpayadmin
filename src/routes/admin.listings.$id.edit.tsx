import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Card, SectionLabel } from "@/components/admin/Catalog";
import { ListingHeader } from "@/components/admin/ListingProfile";
import { fetchAdminProduct } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/$id/edit")({
  head: () => ({ meta: [{ title: "Listing edit — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof fetchAdminProduct>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminProduct(id)
      .then(setProduct)
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Failed to load");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminShell title="Edit listing" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell title="Edit listing" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Product not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Listings", to: "/admin/listings" },
        { label: product.title, to: `/admin/listings/${id}` as never },
        { label: "Edit" },
      ]}
    >
      <ListingHeader product={product} />
      <Card className="mt-4">
        <SectionLabel>Admin edit</SectionLabel>
        <p className="mt-2 text-[13px]" style={{ color: T.sub }}>
          Catalog edits are performed by the seller in the mobile app. Staff can approve or hide listings from the Overview tab.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
          <Field label="Title" value={product.title} />
          <Field label="MOQ" value={product.moq ?? "—"} />
          <Field label="Stock" value={product.stock != null ? String(product.stock) : "—"} />
          <Field label="Origin hub" value={product.originHub ?? "—"} />
          <Field label="Lead time min" value={product.leadTimeMin != null ? String(product.leadTimeMin) : "—"} />
          <Field label="Lead time max" value={product.leadTimeMax != null ? String(product.leadTimeMax) : "—"} />
          <Field label="CBM / unit" value={product.cbmPerUnit != null ? String(product.cbmPerUnit) : "—"} />
          <Field label="Weight kg / unit" value={product.weightKgPerUnit != null ? String(product.weightKgPerUnit) : "—"} />
        </dl>
      </Card>
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
        {label}
      </p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}
