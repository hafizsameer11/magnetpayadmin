/**
 * Codemod: replace remaining admin demo routes with live API-backed shells.
 * Run from magnetpay-admin: node scripts/live-admin-shells.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.resolve(__dirname, "../src/routes");

function routePathFromFile(name) {
  // admin.users.$id.notes.tsx -> /admin/users/$id/notes
  // admin.users.$id.index.tsx -> /admin/users/$id/
  let s = name.replace(/^admin\./, "").replace(/\.tsx$/, "");
  const parts = s.split(".");
  if (parts[parts.length - 1] === "index") parts.pop();
  let p = "/admin/" + parts.join("/");
  if (!p.endsWith("/") && parts.length <= 1) p += "/";
  // detail routes without trailing slash is fine; index roots need trailing slash often
  if (parts.length === 0) p = "/admin/";
  return p;
}

function titleFromFile(name) {
  return name
    .replace(/^admin\./, "")
    .replace(/\.tsx$/, "")
    .replace(/\$/g, "")
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function pickFetcher(name) {
  if (name.includes("order")) return "fetchAdminOrders";
  if (name.includes("listing") || name.includes("product") || name.includes("inventory")) return "fetchAdminProducts";
  if (name.includes("seller")) return "fetchAdminSellers";
  if (name.includes("review")) return "fetchAdminReviews";
  if (name.includes("categor")) return "fetchAdminCategories";
  if (name.includes("shipment") || name.includes("carrier") || name.includes("warehouse") || name.includes("zone") || name.includes("customs") || name.includes("label") || name.includes("pickup") || name.includes("rates"))
    return "fetchAdminShipments";
  if (name.includes("escrow") || name.includes("dispute") || name.includes("chargeback")) return "fetchAdminEscrows";
  if (name.includes("withdraw") || name.includes("payout")) return "fetchAdminWithdrawals";
  if (name.includes("deposit")) return "fetchAdminDeposits";
  if (name.includes("wallet")) return "fetchAdminWallets";
  if (name.includes("transfer") || name.includes("transaction")) return "fetchAdminTransfers";
  if (name.includes("fx")) return "fetchAdminFxConversions";
  if (name.includes("fee") || name.includes("limit") || name.includes("currenc") || name.includes("corridor")) return "fetchAdminFees";
  if (name.includes("recipient") || name.includes("reconcil") || name.includes("ledger")) return "fetchAdminLedger";
  if (name.includes("announce") || name.includes("banner") || name.includes("push") || name.includes("email") || name.includes("sms") || name.includes("page") || name.includes("help") || name.includes("legal") || name.includes("macro"))
    return "fetchAdminAnnouncements";
  if (name.includes("aml") || name.includes("fraud") || name.includes("sanction") || name.includes("pep") || name.includes("sar") || name.includes("risk") || name.includes("velocity") || name.includes("allow") || name.includes("block") || name.includes("gdpr") || name.includes("audit"))
    return "fetchAdminAudit";
  if (name.includes("ticket") || name.includes("chat") || name.includes("incident") || name.includes("job") || name.includes("cron"))
    return "fetchAdminConversations";
  if (name.includes("analytic") || name.includes("report")) return "fetchAdminAnalytics";
  if (name.includes("user") || name.includes("team") || name.includes("role") || name.includes("me") || name.includes("workspace") || name.includes("security") || name.includes("2fa"))
    return "fetchAdminUsers";
  if (name.includes("setting") || name.includes("flag") || name.includes("webhook") || name.includes("secret") || name.includes("integration") || name.includes("branding") || name.includes("locale") || name.includes("api-key"))
    return "fetchAdminFees";
  if (name.includes("health")) return "fetchAdminHealth";
  if (name.includes("promo") || name.includes("coupon") || name.includes("brand") || name.includes("attribute") || name.includes("collection"))
    return "fetchAdminProducts";
  return "fetchAdminAnalytics";
}

function shellSource(fileName, fetcher) {
  const routePath = routePathFromFile(fileName);
  const title = titleFromFile(fileName);
  const isObj = fetcher === "fetchAdminAnalytics" || fetcher === "fetchAdminHealth";
  return `import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { ${fetcher} } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("${routePath}")({
  head: () => ({ meta: [{ title: "${title} — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const [rows, setRows] = useState<unknown[] | Record<string, unknown> | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const data = await ${fetcher}();
        setRows(${isObj ? "data as Record<string, unknown>" : "Array.isArray(data) ? data : [data]"});
        setErr("");
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
        setRows(${isObj ? "null" : "[]"});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];

  return (
    <AdminShell
      title="${title}"
      description="Live data from API. Empty until records exist."
      breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "${title}" }]}
    >
      {loading ? (
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}>
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : err ? (
        <p className="text-[13px]" style={{ color: T.danger }}>{err}</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: T.surface, border: \`1px solid \${T.border}\` }}>
          <p className="text-[13px] font-semibold" style={{ color: T.ink }}>No records yet</p>
          <p className="mt-1 text-[12px]" style={{ color: T.muted }}>This screen is API-backed. Data will appear when available.</p>
          <Link to="/admin" className="inline-block mt-4 text-[12px] font-semibold" style={{ color: T.navy }}>Back to overview</Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: \`1px solid \${T.border}\` }}>
          <div className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted, borderBottom: \`1px solid \${T.border}\` }}>
            {list.length} record{list.length === 1 ? "" : "s"} from API
          </div>
          <ul>
            {list.slice(0, 50).map((row, i) => {
              const r = row as Record<string, unknown>;
              const id = String(r.id ?? r.key ?? i);
              const label = String(r.name ?? r.title ?? r.action ?? r.companyName ?? r.status ?? r.key ?? id);
              return (
                <li key={id + "-" + i} className="px-4 py-3 text-[12.5px] flex justify-between gap-3" style={{ borderBottom: i < Math.min(list.length, 50) - 1 ? \`1px solid \${T.border}\` : "none" }}>
                  <span className="font-semibold truncate" style={{ color: T.ink }}>{label}</span>
                  <span className="tabular-nums shrink-0" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{id.slice(0, 12)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
`;
}

const files = fs.readdirSync(routesDir).filter((f) => f.startsWith("admin") && f.endsWith(".tsx"));
let changed = 0;
for (const f of files) {
  const full = path.join(routesDir, f);
  const src = fs.readFileSync(full, "utf8");
  if (!src.includes("useDemoAction") && !src.includes("demo(")) continue;
  // Skip login (no demo for auth flow necessarily) - still convert if demo
  const fetcher = pickFetcher(f);
  fs.writeFileSync(full, shellSource(f, fetcher));
  changed++;
  console.log("rewrote", f, "->", fetcher);
}
console.log("done", changed);
