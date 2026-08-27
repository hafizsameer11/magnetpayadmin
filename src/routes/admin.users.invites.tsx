import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { inviteAdminUser } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users/invites")({
  head: () => ({ meta: [{ title: "Invites — MagnetPay Admin" }] }),
  component: InvitesPage,
});

const ROLES = ["BUYER", "SELLER", "BOTH"] as const;

function InvitesPage() {
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<string>("BUYER");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) {
      toast.error("Phone is required");
      return;
    }
    setBusy(true);
    try {
      const result = (await inviteAdminUser(trimmed, role)) as {
        invited?: boolean;
        reason?: string;
      };
      if (result?.invited === false) {
        toast.error(result.reason === "already_registered" ? "User already registered" : "Invite not sent");
      } else {
        toast.success(`Invite sent to ${trimmed}`);
        setPhone("");
        setRole("BUYER");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      title="Invites"
      description="Send a signup invite by phone number."
      breadcrumbs={[
        { label: "Admin", to: "/admin" },
        { label: "Users", to: "/admin/users" },
        { label: "Invites" },
      ]}
      actions={
        <Link
          to="/admin/users"
          className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] font-semibold"
          style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.ink }}
        >
          All users
        </Link>
      }
    >
      <div
        className="max-w-md rounded-xl p-5"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <h3 className="text-[14px] font-bold" style={{ color: T.ink }}>
          New invite
        </h3>
        <p className="mt-1 text-[11.5px]" style={{ color: T.sub }}>
          Invite a user by phone. They will receive onboarding instructions.
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2348012345678"
              className="mt-1 w-full h-9 px-3 rounded-md text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full h-9 px-3 rounded-md text-[12px] outline-none"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
              disabled={busy}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full h-9 rounded-md text-[12px] font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
            style={{ background: T.navy }}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" strokeWidth={2.6} />}
            {busy ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
