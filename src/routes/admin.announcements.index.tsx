import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import {
  createAdminAnnouncement,
  fetchAdminAnnouncements,
  type AdminAnnouncement,
} from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/announcements/")({
  head: () => ({ meta: [{ title: "Announcements — MagnetPay Admin" }] }),
  component: Page,
});

function metaTitle(a: AdminAnnouncement) {
  return a.meta?.title ?? a.entity ?? a.id.slice(0, 8);
}

function metaBody(a: AdminAnnouncement) {
  return a.meta?.body ?? "";
}

function Page() {
  const [rows, setRows] = useState<AdminAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminAnnouncements());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load announcements");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await createAdminAnnouncement(title.trim(), body.trim());
      toast.success("Announcement created");
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Announcements"
      description="Platform broadcasts stored via the admin announcements API."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Announcements" }]}
    >
      <form
        onSubmit={(e) => void onCreate(e)}
        className="mb-5 rounded-xl p-4 space-y-3"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
          New announcement
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full h-9 px-3 rounded-lg text-[12.5px] outline-none font-semibold"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (optional)"
          rows={3}
          className="w-full p-3 rounded-lg text-[12px] outline-none resize-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
        />
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="h-9 px-3 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.navy }}
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          {saving ? "Creating…" : "Create"}
        </button>
      </form>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div
          className="grid items-center px-4 h-9 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: T.muted,
            background: T.bg,
            borderBottom: `1px solid ${T.border}`,
            gridTemplateColumns: "1.6fr 1.4fr 1fr",
          }}
        >
          <span>Title</span>
          <span>Audience</span>
          <span>Created</span>
        </div>

        {loading ? (
          <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>
            No announcements yet.
          </p>
        ) : (
          rows.map((a, i) => (
            <Link
              key={a.id}
              to="/admin/announcements/$id"
              params={{ id: a.id }}
              className="grid items-center px-4 py-3 text-[12px] hover:bg-[rgba(14,59,46,0.02)] transition"
              style={{
                gridTemplateColumns: "1.6fr 1.4fr 1fr",
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
              }}
            >
              <div className="min-w-0">
                <p className="font-bold truncate" style={{ color: T.ink }}>
                  {metaTitle(a)}
                </p>
                <p className="text-[11px] truncate" style={{ color: T.sub }}>
                  {metaBody(a) || "—"}
                </p>
              </div>
              <span style={{ color: T.sub }}>{a.meta?.audience ?? "all"}</span>
              <span className="tabular-nums text-[11px]" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </Link>
          ))
        )}
      </div>
    </AdminShell>
  );
}
