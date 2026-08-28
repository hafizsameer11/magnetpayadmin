/**
 * Wire placeholder admin routes to AdminRecordListPage / AdminRecordDetailPage.
 * Run: node scripts/wire-admin-ui.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.resolve(__dirname, "../src/routes");

const PLACEHOLDER_MARK = "Live data from API";

function routePathFromStem(stem) {
  let s = stem.replace(/^admin\./, "");
  const parts = s.split(".");
  if (parts[parts.length - 1] === "index") parts.pop();
  let p = "/admin/" + parts.join("/");
  if (stem.endsWith(".index")) p += "/";
  return p;
}

function titleFromStem(stem) {
  return stem
    .replace(/^admin\./, "")
    .replace(/\$/g, "")
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Inline domain map (subset of recordRegistry ROUTE_FILE_DOMAIN + infer) */
const ROUTE_DOMAINS = {
  "admin.aml.index": "aml",
  "admin.aml.$id": "aml",
  "admin.fraud-cases.index": "fraud",
  "admin.fraud-cases.$id": "fraud",
  "admin.sanctions": "sanctions",
  "admin.pep": "pep",
  "admin.sars": "sars",
  "admin.tickets.index": "ticket",
  "admin.tickets.$id": "ticket",
  "admin.tickets.queues": "ticket",
  "admin.brands": "brand",
  "admin.collections": "collection",
  "admin.coupons.index": "coupon",
  "admin.coupons.$id": "coupon",
  "admin.promotions.index": "promotion",
  "admin.promotions.$id": "promotion",
  "admin.banners": "banner",
  "admin.settings.feature-flags": "feature-flag",
  "admin.settings.webhooks.index": "webhook",
  "admin.settings.webhooks.$id": "webhook",
  "admin.team": "team-member",
  "admin.roles": "team-member",
  "admin.warehouses.index": "warehouse",
  "admin.warehouses.$id": "warehouse",
  "admin.carriers.index": "carrier",
  "admin.carriers.$id": "carrier",
  "admin.escrow.templates": "escrow-template",
  "admin.risk-rules": "risk-rule",
  "admin.allowlist": "allowlist",
  "admin.blocklist": "blocklist",
  "admin.gdpr": "gdpr",
  "admin.incidents.index": "incident",
  "admin.incidents.$id": "incident",
  "admin.email-templates": "email-template",
  "admin.sms-templates": "sms-template",
  "admin.legal": "legal-page",
  "admin.pages": "legal-page",
  "admin.help.index": "help-article",
  "admin.help.$id": "help-article",
  "admin.chargebacks.index": "chargeback",
  "admin.chargebacks.$id": "chargeback",
  "admin.sellers.tiers": "seller-tier",
  "admin.sellers.payouts": "chargeback",
  "admin.attributes": "brand",
  "admin.inventory": "collection",
  "admin.macros": "help-article",
  "admin.push": "banner",
  "admin.release-notes": "legal-page",
  "admin.changelog": "incident",
  "admin.cron": "incident",
  "admin.jobs.index": "incident",
  "admin.jobs.$id": "incident",
  "admin.reports.index": "incident",
  "admin.reports.$id": "incident",
  "admin.customs": "warehouse",
  "admin.labels": "carrier",
  "admin.pickup-points": "warehouse",
  "admin.zones": "carrier",
  "admin.corridors": "risk-rule",
  "admin.currencies": "risk-rule",
  "admin.rates": "risk-rule",
  "admin.reconciliation": "chargeback",
  "admin.velocity": "risk-rule",
  "admin.disputes.sla": "risk-rule",
  "admin.disputes.$id.evidence": "fraud",
  "admin.disputes.$id.ruling": "fraud",
  "admin.settings.general": "feature-flag",
  "admin.settings.branding": "banner",
  "admin.settings.locales": "legal-page",
  "admin.settings.api-keys": "webhook",
  "admin.settings.secrets": "webhook",
  "admin.settings.integrations": "webhook",
  "admin.security": "risk-rule",
  "admin.2fa": "team-member",
  "admin.workspaces": "team-member",
  "admin.analytics.cohorts": "incident",
  "admin.analytics.funnels": "incident",
  "admin.analytics.fx": "incident",
  "admin.analytics.gmv": "incident",
  "admin.analytics.logistics": "warehouse",
  "admin.analytics.sellers": "seller-tier",
  "admin.analytics.users": "incident",
  "admin.listings.pending": "brand",
  "admin.listings.reported": "brand",
  "admin.listings.$id.edit": "brand",
  "admin.listings.$id.history": "incident",
  "admin.orders.exceptions": "chargeback",
  "admin.orders.export": "chargeback",
  "admin.orders.$id.cancel": "chargeback",
  "admin.orders.$id.refund": "chargeback",
  "admin.orders.$id.notes": "ticket",
  "admin.shipments.exceptions": "warehouse",
  "admin.categories.$id": "brand",
  "admin.reviews.$id": "brand",
  "admin.chats.$id": "ticket",
  "admin.payouts": "chargeback",
  "admin.fx.liquidity": "risk-rule",
  "admin.fx.spreads": "risk-rule",
};

function inferDomain(stem) {
  if (ROUTE_DOMAINS[stem]) return ROUTE_DOMAINS[stem];
  if (stem.includes("analytics")) return "incident";
  if (stem.includes("listing")) return "brand";
  if (stem.includes("order")) return "chargeback";
  if (stem.includes("shipment")) return "warehouse";
  if (stem.includes("seller")) return "seller-tier";
  if (stem.includes("chat") || stem.includes("ticket")) return "ticket";
  return "incident";
}

function isDetail(stem) {
  return stem.includes(".$id") && !stem.endsWith(".index");
}

function listSource(stem, domain, routePath, title) {
  return `import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordListPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("${routePath}")({
  head: () => ({ meta: [{ title: "${title} — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  return <AdminRecordListPage domain="${domain}" />;
}
`;
}

function detailSource(stem, domain, routePath, title) {
  return `import { createFileRoute } from "@tanstack/react-router";
import { AdminRecordDetailPage } from "@/components/admin/AdminRecordPage";

export const Route = createFileRoute("${routePath}")({
  head: () => ({ meta: [{ title: "${title} — MagnetPay Admin" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return <AdminRecordDetailPage domain="${domain}" id={id} />;
}
`;
}

const skip = new Set([
  "admin.login.tsx",
  "admin.forgot.tsx",
  "admin.me.tsx",
  "admin.records.$id.tsx",
  "admin.sellers.$id.tsx",
  "admin.users.$id.index.tsx",
  "admin.users.$id.notes.tsx",
]);

let wired = 0;
for (const file of fs.readdirSync(routesDir)) {
  if (!file.startsWith("admin.") || !file.endsWith(".tsx") || skip.has(file)) continue;
  const full = path.join(routesDir, file);
  const content = fs.readFileSync(full, "utf8");
  if (!content.includes(PLACEHOLDER_MARK)) continue;

  const stem = file.replace(/\.tsx$/, "");
  const domain = inferDomain(stem);
  const routePath = routePathFromStem(stem);
  const title = titleFromStem(stem);
  const next = isDetail(stem) ? detailSource(stem, domain, routePath, title) : listSource(stem, domain, routePath, title);
  fs.writeFileSync(full, next, "utf8");
  wired++;
  console.log("wired", file, "->", domain, isDetail(stem) ? "detail" : "list");
}

console.log("Done. Wired", wired, "routes.");
