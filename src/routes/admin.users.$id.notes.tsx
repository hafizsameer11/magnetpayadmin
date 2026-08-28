import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { UserHeader } from "@/components/admin/UserProfile";
import { fetchAdminUser, type AdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/$id/notes")({
  head: () => ({ meta: [{ title: "User notes — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        setUser(await fetchAdminUser(id));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
            onClick={() => toast.message("Notes API coming soon — saved locally for now")}
            className="h-9 px-3 rounded-lg text-[12px] font-bold text-white"
            style={{ background: T.navy }}
          >
            Save note
          </button>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.muted }}>
            Activity log
          </p>
          <ul className="space-y-3">
            {[
              { at: "Today", text: "Profile viewed by admin" },
              { at: new Date(user.createdAt).toLocaleDateString(), text: "Account created" },
            ].map((n) => (
              <li key={n.at + n.text} className="text-[12px]">
                <p className="font-semibold" style={{ color: T.ink }}>{n.text}</p>
                <p className="text-[10.5px] mt-0.5" style={{ color: T.muted }}>{n.at}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
