import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { fetchAdminAnnouncements, type AdminAnnouncement } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/announcements/$id")({
  head: () => ({ meta: [{ title: "Announcement — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<AdminAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchAdminAnnouncements();
        const found = list.find((a) => a.id === id) ?? null;
        if (!cancelled) setRow(found);
        if (!cancelled && !found) toast.error("Announcement not found");
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load announcement");
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
        title="Announcement"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Announcements", to: "/admin/announcements" },
          { label: id },
        ]}
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
        title="Announcement"
        breadcrumbs={[
          { label: "Admin", to: "/admin" },
          { label: "Announcements", to: "/admin/announcements" },
          { label: id },
        ]}
      >
        <p className="text-[13px]" style={{ color: T.muted }}>
          Announcement not found.
        </p>
      </AdminShell>
    );
  }

  const title = row.meta?.title ?? row.entity ?? row.id.slice(0, 8);
  const body = row.meta?.body ?? "";

  return (
    <AdminShell
      title={title}
      description={`Audience: ${row.meta?.audience ?? "all"}`}
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Announcements", to: "/admin/announcements" },
        { label: row.id.slice(0, 8) },
      ]}
      actions={
        <Link
          to="/admin/announcements"
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      }
    >
      <div className="rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Title
          </p>
          <p className="mt-1 text-[15px] font-bold">{title}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Body
          </p>
          <p className="mt-1 text-[13px] whitespace-pre-wrap" style={{ color: T.ink }}>
            {body || "—"}
          </p>
        </div>
        <div className="pt-3 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              Created
            </p>
            <p className="mt-1 tabular-nums text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date(row.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
              ID
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
