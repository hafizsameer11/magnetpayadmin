import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RotateCw, AlertTriangle } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminHealth } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/health")({
  head: () => ({ meta: [{ title: "Health — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [health, setHealth] = useState<{ ok: boolean; time: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setHealth(await fetchAdminHealth());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Health check failed";
      setError(msg);
      setHealth(null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const ok = health?.ok === true;

  return (
    <AdminShell
      title="Health"
      description="Live admin API health probe."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Health" }]}
      actions={
        <button
          onClick={() => void load()}
          disabled={loading}
          className="h-9 px-3 rounded-lg text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
          Re-check
        </button>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div
          className="rounded-2xl p-5"
          style={{
            background: ok ? "linear-gradient(135deg, #E6F4F1, #fff)" : "linear-gradient(135deg, #FCE8E8, #fff)",
            border: `1px solid ${ok ? T.success + "30" : T.danger + "40"}`,
          }}
        >
          <div className="flex items-center gap-3">
            {ok ? (
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: T.success, color: "#fff" }}>
                <CheckCircle2 className="size-5" />
              </div>
            ) : (
              <div className="size-10 rounded-xl grid place-items-center" style={{ background: T.danger, color: "#fff" }}>
                <AlertTriangle className="size-5" />
              </div>
            )}
            <div>
              <p className="text-[18px] font-bold" style={{ color: T.ink }}>
                {ok ? "Admin API healthy" : "Admin API unhealthy"}
              </p>
              <p className="text-[12px]" style={{ color: T.sub }}>
                {health?.time
                  ? `Server time ${new Date(health.time).toLocaleString()}`
                  : error ?? "No response"}
              </p>
            </div>
            <div className="ml-auto">
              <Pill tone={ok ? "success" : "danger"}>{ok ? "ok" : "down"}</Pill>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
