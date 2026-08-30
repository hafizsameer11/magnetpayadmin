import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { OverviewDashboard, OverviewToolbar } from "@/components/admin/OverviewDashboard";
import { Pill } from "@/components/admin/UserProfile";
import { fetchAdminAnalytics, fetchAdminHealth, type AdminAnalytics } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — MagnetPay Admin" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [health, setHealth] = useState<{ ok: boolean; time: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [a, h] = await Promise.all([fetchAdminAnalytics(), fetchAdminHealth()]);
        if (!cancelled) {
          setAnalytics(a);
          setHealth(h);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load dashboard");
          setAnalytics(null);
          setHealth(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AdminShell
      title="Overview"
      description="Real-time pulse of the MagnetPay platform across NG–CN corridor."
      breadcrumbs={[{ label: "Admin" }]}
      actions={
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {health ? (
            <Pill tone={health.ok ? "success" : "danger"}>
              {health.ok ? "API healthy" : "API degraded"} · {new Date(health.time).toLocaleTimeString()}
            </Pill>
          ) : null}
          <OverviewToolbar />
        </div>
      }
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : !analytics ? (
        <p className="text-center text-[12px] py-10" style={{ color: T.muted }}>
          No analytics data available.
        </p>
      ) : (
        <OverviewDashboard data={analytics} />
      )}
    </AdminShell>
  );
}
