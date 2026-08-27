import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { LISTINGS, Card } from "@/components/admin/Catalog";

export const Route = createFileRoute("/admin/listings/$id/history")({
  head: () => ({ meta: [{ title: "Listing history — MagnetPay Admin" }] }),
  component: Page,
});

const EVENTS = [
  { who: "Adaeze K. (admin)", at: "2026-06-28 14:22", action: "Approved listing", note: "Compliance docs verified.", tone: "success" as const },
  { who: "Shenzhen TopMax", at: "2026-06-28 09:11", action: "Price updated", note: "CNY 92 → CNY 86", tone: "info" as const },
  { who: "System", at: "2026-06-27 22:30", action: "Auto-flagged", note: "Keyword match: 'fake' — cleared on review.", tone: "warn" as const },
  { who: "Shenzhen TopMax", at: "2026-06-27 18:00", action: "Stock updated", note: "1180 → 1240 units", tone: "info" as const },
  { who: "Tobi A. (mod)", at: "2026-06-26 11:45", action: "Edited title", note: "Added 'NG plug' for clarity.", tone: "info" as const },
  { who: "Shenzhen TopMax", at: "2026-06-25 08:02", action: "Listing created", note: "Submitted for review.", tone: "info" as const },
];

function Page() {
  const { id } = Route.useParams();
  const l = LISTINGS.find((x) => x.id === id) ?? LISTINGS[0];
  return (
    <AdminShell
      title={`History · ${l.title}`}
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Listings", to: "/admin/listings" }, { label: l.id, to: "/admin/listings/$id" as never }, { label: "History" }]}
    >
      <Card>
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-2 bottom-2 w-px" style={{ background: T.border }} />
          {EVENTS.map((e, i) => {
            const tone = e.tone === "success" ? T.success : e.tone === "warn" ? T.warn : T.info;
            return (
              <div key={i} className="relative py-3" style={{ borderBottom: i < EVENTS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <span className="absolute -left-[18px] top-4 size-2 rounded-full ring-4" style={{ background: tone, boxShadow: `0 0 0 4px ${T.surface}` }} />
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold" style={{ color: T.ink }}>{e.action}</p>
                  <span className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{e.at}</span>
                </div>
                <p className="mt-0.5 text-[11.5px]" style={{ color: T.sub }}>{e.note}</p>
                <p className="mt-0.5 text-[10.5px]" style={{ color: T.muted }}>by {e.who}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </AdminShell>
  );
}
