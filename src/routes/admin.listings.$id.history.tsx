import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, AdminCard, T } from "@/components/admin/AdminShell";
import { ListingHeader, ListingPageActions, listingRefId } from "@/components/admin/ListingProfile";
import { fetchAdminAudit, fetchAdminProduct } from "@/lib/api";

export const Route = createFileRoute("/admin/listings/$id/history")({
  head: () => ({ meta: [{ title: "Listing history — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Awaited<ReturnType<typeof fetchAdminProduct>> | null>(null);
  const [events, setEvents] = useState<{ action: string; at: string; note: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const [p, audit] = await Promise.all([fetchAdminProduct(id), fetchAdminAudit()]);
        setProduct(p);
        setEvents(
          audit
            .filter((a) => a.entity === "Product" && a.entityId === id)
            .map((a) => ({
              action: a.action,
              at: new Date(a.createdAt).toLocaleString(),
              note: a.entityId ?? "",
            })),
        );
      } catch {
        setProduct(null);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <AdminShell
      title={product?.title ?? "Listing history"}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Listings", to: "/admin/listings" },
        { label: listingRefId(id), to: `/admin/listings/${id}` as never },
        { label: "History" },
      ]}
      actions={product ? <ListingPageActions id={product.id} active="history" /> : undefined}
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : product ? (
        <>
          <ListingHeader product={product} />
          {events.length === 0 ? (
            <div className="mt-4">
              <AdminCard>
                <p className="text-[13px] font-semibold" style={{ color: T.ink }}>
                  No audit history
                </p>
                <p className="mt-1 text-[12px]" style={{ color: T.sub }}>
                  Moderation and edit events will appear here when recorded in the audit log.
                </p>
              </AdminCard>
            </div>
          ) : (
            <div className="mt-4 lg:col-span-2">
              <AdminCard>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px" style={{ background: T.border }} />
                  {events.map((e, i) => (
                    <div key={i} className="relative py-3" style={{ borderBottom: i < events.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <span className="absolute -left-[18px] top-4 size-2 rounded-full ring-4" style={{ background: T.info, boxShadow: `0 0 0 4px ${T.surface}` }} />
                      <div className="flex items-center justify-between">
                        <p className="text-[12.5px] font-semibold" style={{ color: T.ink }}>
                          {e.action}
                        </p>
                        <p className="text-[11px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                          {e.at}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminCard>
            </div>
          )}
        </>
      ) : (
        <AdminCard>
          <p className="text-[13px]" style={{ color: T.muted }}>
            Product not found.
          </p>
          <Link to="/admin/listings" className="inline-block mt-4 text-[12px] font-semibold" style={{ color: T.navy }}>
            Back to listings
          </Link>
        </AdminCard>
      )}
    </AdminShell>
  );
}
