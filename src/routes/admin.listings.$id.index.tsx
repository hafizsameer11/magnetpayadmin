import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  ListingOverview,
  ListingPageActions,
  listingRefId,
} from "@/components/admin/ListingProfile";
import { fetchAdminProduct, fetchAdminProductStats, moderateProduct } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/listings/$id/")({
  head: () => ({ meta: [{ title: "Listing — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof fetchAdminProduct>> | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminProductStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await fetchAdminProduct(id);
      setProduct(p);
      try {
        setStats(await fetchAdminProductStats(id));
      } catch {
        setStats(null);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const moderate = async (status: "APPROVED" | "HIDDEN" | "REJECTED") => {
    if (busy) return;
    setBusy(true);
    try {
      await moderateProduct(id, status);
      toast.success(status === "APPROVED" ? "Product approved" : status === "HIDDEN" ? "Product paused" : "Product delisted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Moderation failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AdminShell
        title="Listing"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Listings", to: "/admin/listings" },
          { label: listingRefId(id) },
        ]}
      >
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!product) {
    return (
      <AdminShell
        title="Listing"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Listings", to: "/admin/listings" },
          { label: listingRefId(id) },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>Product not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={product.title}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Listings", to: "/admin/listings" },
        { label: listingRefId(product.id) },
      ]}
      actions={<ListingPageActions id={product.id} active="overview" />}
    >
      <ListingOverview product={product} stats={stats} busy={busy} onModerate={(s) => void moderate(s)} />
    </AdminShell>
  );
}
