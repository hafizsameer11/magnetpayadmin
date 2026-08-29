import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader } from "@/components/admin/UserProfile";
import { fetchAdminUser, fetchAdminUserNotes, postAdminUserNote, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/notes")({
  head: () => ({ meta: [{ title: "User notes — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [notes, setNotes] = useState<{ id: string; body: string; createdAt: string; author?: { name: string } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [u, n] = await Promise.all([fetchAdminUser(id), fetchAdminUserNotes(id)]);
      setUser(u);
      setNotes(n);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user");
      setUser(null);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const save = async () => {
    const body = draft.trim();
    if (!body || saving) return;
    setSaving(true);
    try {
      await postAdminUserNote(id, body);
      toast.success("Note saved");
      setDraft("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Notes" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell title="Notes" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Users", to: "/admin/users" }, { label: id }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>User not found.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title=" "
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: user.name, to: `/admin/users/${user.id}` },
        { label: "Notes" },
      ]}
    >
      <UserHeader user={user} />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl p-4 space-y-3" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
            Internal note
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            placeholder="Add ops notes about this user…"
            className="w-full px-3 py-2 rounded-lg text-[12px] outline-none resize-y"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !draft.trim()}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-60"
            style={{ background: T.navy }}
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
            Saved notes
          </p>
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="text-[12px]">
                <p style={{ color: T.ink }}>{n.body}</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>
                  {n.author?.name ?? "Admin"} · {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
            {!notes.length ? (
              <li className="text-[12px]" style={{ color: T.muted }}>
                No notes yet.
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
