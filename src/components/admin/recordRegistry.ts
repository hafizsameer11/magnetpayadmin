import type { ReactNode } from "react";

export type RecordColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  render?: (row: AdminRecordRow) => ReactNode;
  mono?: boolean;
};

export type AdminRecordRow = {
  id: string;
  domain: string;
  externalId?: string | null;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type DomainConfig = {
  domain: string;
  title: string;
  description: string;
  breadcrumbs: { label: string; to?: string }[];
  columns: RecordColumn[];
  kpi?: (rows: AdminRecordRow[]) => { label: string; val: string; tone?: string }[];
};

function p(row: AdminRecordRow, key: string) {
  const v = row.payload[key];
  if (v == null) return "—";
  return String(v);
}

function fmtNgn(n: unknown) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return "₦" + v.toLocaleString("en-US");
}

export const DOMAIN_CONFIG: Record<string, DomainConfig> = {
  aml: {
    domain: "aml",
    title: "AML cases",
    description: "Anti–money laundering alerts and investigations across NG–CN corridor.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "AML" }],
    kpi: (rows) => [
      { label: "Open cases", val: String(rows.filter((r) => !["cleared", "blocked"].includes(r.status ?? "")).length) },
      { label: "Critical", val: String(rows.filter((r) => p(r, "severity") === "critical").length), tone: "#B91C1C" },
      { label: "Blocked", val: String(rows.filter((r) => r.status === "blocked").length), tone: "#B45309" },
      { label: "Total", val: String(rows.length) },
    ],
    columns: [
      { key: "externalId", label: "Case", mono: true },
      { key: "title", label: "Subject" },
      { key: "subtitle", label: "Trigger" },
      { key: "country", label: "Country", render: (r) => p(r, "country") },
      { key: "amount", label: "Amount", align: "right", mono: true, render: (r) => fmtNgn(r.payload.amountNGN) },
      { key: "risk", label: "Risk", align: "right", mono: true, render: (r) => p(r, "riskScore") },
      { key: "status", label: "Status" },
    ],
  },
  fraud: {
    domain: "fraud",
    title: "Fraud cases",
    description: "Fraud typologies, losses, and recovery status.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Fraud" }],
    columns: [
      { key: "externalId", label: "Case", mono: true },
      { key: "title", label: "Subject" },
      { key: "subtitle", label: "Typology" },
      { key: "loss", label: "Loss", align: "right", mono: true, render: (r) => fmtNgn(r.payload.lossNGN) },
      { key: "severity", label: "Severity", render: (r) => p(r, "severity") },
      { key: "status", label: "Status" },
    ],
  },
  sanctions: {
    domain: "sanctions",
    title: "Sanctions screening",
    description: "Watchlist hits and clearance workflow.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Sanctions" }],
    columns: [
      { key: "externalId", label: "Hit", mono: true },
      { key: "title", label: "Subject" },
      { key: "list", label: "List", render: (r) => p(r, "list") },
      { key: "score", label: "Score", align: "right", mono: true, render: (r) => p(r, "score") },
      { key: "status", label: "Status" },
    ],
  },
  pep: {
    domain: "pep",
    title: "PEP screening",
    description: "Politically exposed persons and related parties.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "PEP" }],
    columns: [
      { key: "externalId", label: "ID", mono: true },
      { key: "title", label: "Name" },
      { key: "subtitle", label: "Relation" },
      { key: "country", label: "Country", render: (r) => p(r, "country") },
      { key: "status", label: "Status" },
    ],
  },
  sars: {
    domain: "sars",
    title: "Suspicious activity reports",
    description: "SAR filings and regulatory submissions.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "SARs" }],
    columns: [
      { key: "externalId", label: "SAR", mono: true },
      { key: "title", label: "Subject" },
      { key: "subtitle", label: "Reason" },
      { key: "amount", label: "Amount", align: "right", mono: true, render: (r) => fmtNgn(r.payload.amountNGN) },
      { key: "status", label: "Status" },
    ],
  },
  ticket: {
    domain: "ticket",
    title: "Support tickets",
    description: "Buyer and seller support queue.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Support" }, { label: "Tickets" }],
    columns: [
      { key: "externalId", label: "Ticket", mono: true },
      { key: "title", label: "Subject" },
      { key: "subtitle", label: "User" },
      { key: "priority", label: "Priority", render: (r) => p(r, "priority") },
      { key: "channel", label: "Channel", render: (r) => p(r, "channel") },
      { key: "status", label: "Status" },
    ],
  },
  brand: {
    domain: "brand",
    title: "Brands",
    description: "Verified brand registry for marketplace listings.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Catalog" }, { label: "Brands" }],
    columns: [
      { key: "externalId", label: "Brand", mono: true },
      { key: "title", label: "Name" },
      { key: "listings", label: "Listings", align: "right", mono: true, render: (r) => p(r, "listings") },
      { key: "country", label: "Country", render: (r) => p(r, "country") },
      { key: "status", label: "Status" },
    ],
  },
  collection: {
    domain: "collection",
    title: "Collections",
    description: "Curated marketplace collections and hero slots.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Catalog" }, { label: "Collections" }],
    columns: [
      { key: "externalId", label: "Collection", mono: true },
      { key: "title", label: "Name" },
      { key: "slot", label: "Slot", render: (r) => p(r, "slot") },
      { key: "listings", label: "Listings", align: "right", mono: true, render: (r) => p(r, "listings") },
      { key: "status", label: "Status" },
    ],
  },
  coupon: {
    domain: "coupon",
    title: "Coupons",
    description: "Promotional coupon codes and usage caps.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Marketing" }, { label: "Coupons" }],
    columns: [
      { key: "externalId", label: "Code", mono: true },
      { key: "title", label: "Code" },
      { key: "type", label: "Type", render: (r) => p(r, "type") },
      { key: "uses", label: "Uses", align: "right", mono: true, render: (r) => p(r, "uses") },
      { key: "status", label: "Status" },
    ],
  },
  promotion: {
    domain: "promotion",
    title: "Promotions",
    description: "Running campaigns and category discounts.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Marketing" }, { label: "Promotions" }],
    columns: [
      { key: "externalId", label: "Promo", mono: true },
      { key: "title", label: "Name" },
      { key: "type", label: "Type", render: (r) => p(r, "type") },
      { key: "discount", label: "Offer", render: (r) => p(r, "discount") },
      { key: "status", label: "Status" },
    ],
  },
  banner: {
    domain: "banner",
    title: "Banners",
    description: "Home and category promotional banners.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Content" }, { label: "Banners" }],
    columns: [
      { key: "externalId", label: "Banner", mono: true },
      { key: "title", label: "Title" },
      { key: "placement", label: "Placement", render: (r) => p(r, "placement") },
      { key: "ctr", label: "CTR", render: (r) => p(r, "ctr") },
      { key: "status", label: "Status" },
    ],
  },
  "feature-flag": {
    domain: "feature-flag",
    title: "Feature flags",
    description: "Progressive rollout and environment toggles.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Platform" }, { label: "Feature flags" }],
    columns: [
      { key: "externalId", label: "Key", mono: true },
      { key: "title", label: "Flag" },
      { key: "owner", label: "Owner", render: (r) => p(r, "owner") },
      { key: "prod", label: "Prod %", align: "right", mono: true, render: (r) => p(r, "prod") },
      { key: "status", label: "Env" },
    ],
  },
  webhook: {
    domain: "webhook",
    title: "Webhooks",
    description: "Outbound integration endpoints.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Settings" }, { label: "Webhooks" }],
    columns: [
      { key: "externalId", label: "ID", mono: true },
      { key: "title", label: "Name" },
      { key: "success", label: "Success", render: (r) => (r.payload.successRate != null ? `${r.payload.successRate}%` : "—") },
      { key: "status", label: "Status" },
    ],
  },
  "team-member": {
    domain: "team-member",
    title: "Team",
    description: "Admin staff accounts and roles.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Platform" }, { label: "Team" }],
    columns: [
      { key: "externalId", label: "Staff", mono: true },
      { key: "title", label: "Name" },
      { key: "role", label: "Role", render: (r) => p(r, "role") },
      { key: "email", label: "Email", render: (r) => p(r, "email") },
      { key: "status", label: "Status" },
    ],
  },
  warehouse: {
    domain: "warehouse",
    title: "Warehouses",
    description: "Consolidation hubs and inbound capacity.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Logistics" }, { label: "Warehouses" }],
    columns: [
      { key: "externalId", label: "Hub", mono: true },
      { key: "title", label: "Name" },
      { key: "country", label: "Country", render: (r) => p(r, "country") },
      { key: "capacity", label: "CBM", align: "right", mono: true, render: (r) => p(r, "capacityCbm") },
      { key: "status", label: "Status" },
    ],
  },
  carrier: {
    domain: "carrier",
    title: "Carriers",
    description: "Freight and last-mile carrier partners.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Logistics" }, { label: "Carriers" }],
    columns: [
      { key: "externalId", label: "Carrier", mono: true },
      { key: "title", label: "Name" },
      { key: "onTime", label: "On-time", render: (r) => (r.payload.onTime != null ? `${r.payload.onTime}%` : "—") },
      { key: "status", label: "Status" },
    ],
  },
  "escrow-template": {
    domain: "escrow-template",
    title: "Escrow templates",
    description: "Milestone templates for contract setup.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Escrow" }, { label: "Templates" }],
    columns: [
      { key: "externalId", label: "Template", mono: true },
      { key: "title", label: "Name" },
      { key: "milestones", label: "Milestones", align: "right", mono: true, render: (r) => p(r, "milestones") },
      { key: "status", label: "Status" },
    ],
  },
  "risk-rule": {
    domain: "risk-rule",
    title: "Risk rules",
    description: "Automated velocity and policy triggers.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Risk rules" }],
    columns: [
      { key: "externalId", label: "Rule", mono: true },
      { key: "title", label: "Name" },
      { key: "threshold", label: "Threshold", render: (r) => p(r, "threshold") },
      { key: "action", label: "Action", render: (r) => p(r, "action") },
      { key: "status", label: "Status" },
    ],
  },
  allowlist: {
    domain: "allowlist",
    title: "Allowlist",
    description: "Trusted users, devices, and networks.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Allowlist" }],
    columns: [
      { key: "externalId", label: "Entry", mono: true },
      { key: "title", label: "Value" },
      { key: "kind", label: "Kind", render: (r) => p(r, "kind") },
      { key: "hits", label: "Hits", align: "right", mono: true, render: (r) => p(r, "hits") },
      { key: "status", label: "Status" },
    ],
  },
  blocklist: {
    domain: "blocklist",
    title: "Blocklist",
    description: "Blocked cards, IPs, and identifiers.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "Blocklist" }],
    columns: [
      { key: "externalId", label: "Entry", mono: true },
      { key: "title", label: "Value" },
      { key: "kind", label: "Kind", render: (r) => p(r, "kind") },
      { key: "hits", label: "Hits", align: "right", mono: true, render: (r) => p(r, "hits") },
      { key: "status", label: "Status" },
    ],
  },
  gdpr: {
    domain: "gdpr",
    title: "GDPR requests",
    description: "Data subject access and erasure requests.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Compliance" }, { label: "GDPR" }],
    columns: [
      { key: "externalId", label: "Request", mono: true },
      { key: "title", label: "User" },
      { key: "type", label: "Type", render: (r) => p(r, "type") },
      { key: "daysLeft", label: "Due in", align: "right", mono: true, render: (r) => `${p(r, "daysLeft")}d` },
      { key: "status", label: "Status" },
    ],
  },
  incident: {
    domain: "incident",
    title: "Incidents",
    description: "Platform incidents and postmortems.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Platform" }, { label: "Incidents" }],
    columns: [
      { key: "externalId", label: "Incident", mono: true },
      { key: "title", label: "Title" },
      { key: "severity", label: "Severity", render: (r) => p(r, "severity") },
      { key: "duration", label: "Duration", render: (r) => p(r, "duration") },
      { key: "status", label: "Status" },
    ],
  },
  "email-template": {
    domain: "email-template",
    title: "Email templates",
    description: "Transactional email content.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Content" }, { label: "Email templates" }],
    columns: [
      { key: "externalId", label: "Template", mono: true },
      { key: "title", label: "Name" },
      { key: "locale", label: "Locale", render: (r) => p(r, "locale") },
      { key: "status", label: "Status" },
    ],
  },
  "sms-template": {
    domain: "sms-template",
    title: "SMS templates",
    description: "OTP and notification SMS copy.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Content" }, { label: "SMS templates" }],
    columns: [
      { key: "externalId", label: "Template", mono: true },
      { key: "title", label: "Name" },
      { key: "chars", label: "Chars", align: "right", mono: true, render: (r) => p(r, "chars") },
      { key: "status", label: "Status" },
    ],
  },
  "legal-page": {
    domain: "legal-page",
    title: "Legal pages",
    description: "Terms, privacy, and compliance documents.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Content" }, { label: "Legal" }],
    columns: [
      { key: "externalId", label: "Page", mono: true },
      { key: "title", label: "Title" },
      { key: "version", label: "Version", render: (r) => p(r, "version") },
      { key: "status", label: "Status" },
    ],
  },
  "help-article": {
    domain: "help-article",
    title: "Help center",
    description: "Self-service help articles.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Support" }, { label: "Help" }],
    columns: [
      { key: "externalId", label: "Article", mono: true },
      { key: "title", label: "Title" },
      { key: "views", label: "Views", align: "right", mono: true, render: (r) => p(r, "views") },
      { key: "status", label: "Status" },
    ],
  },
  chargeback: {
    domain: "chargeback",
    title: "Chargebacks",
    description: "Card disputes and representment.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Money" }, { label: "Chargebacks" }],
    columns: [
      { key: "externalId", label: "Case", mono: true },
      { key: "title", label: "Order" },
      { key: "subtitle", label: "Reason" },
      { key: "amount", label: "Amount", align: "right", mono: true, render: (r) => fmtNgn(r.payload.amountNGN) },
      { key: "status", label: "Status" },
    ],
  },
  "seller-tier": {
    domain: "seller-tier",
    title: "Seller tiers",
    description: "Verification tiers and seller program levels.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Sellers", to: "/admin/sellers" }, { label: "Tiers" }],
    columns: [
      { key: "externalId", label: "Tier", mono: true },
      { key: "title", label: "Name" },
      { key: "sellers", label: "Sellers", align: "right", mono: true, render: (r) => p(r, "sellers") },
      { key: "minGmv", label: "Min GMV", align: "right", mono: true, render: (r) => fmtNgn(r.payload.minGmv) },
      { key: "status", label: "Status" },
    ],
  },
  "shipment-exception": {
    domain: "shipment-exception",
    title: "Shipment exceptions",
    description: "Customs holds, address issues, and delivery exceptions.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Logistics", to: "/admin/shipments" }, { label: "Exceptions" }],
    columns: [
      { key: "externalId", label: "Case", mono: true },
      { key: "title", label: "Shipment" },
      { key: "subtitle", label: "Route" },
      { key: "reason", label: "Reason", render: (r) => p(r, "reason") },
      { key: "status", label: "Status" },
    ],
  },
  "platform-config": {
    domain: "platform-config",
    title: "General settings",
    description: "Platform-wide configuration values.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "Settings" }, { label: "General" }],
    columns: [
      { key: "externalId", label: "Key", mono: true },
      { key: "title", label: "Setting" },
      { key: "value", label: "Value", render: (r) => p(r, "value") },
      { key: "status", label: "Status" },
    ],
  },
  "fx-currency": {
    domain: "fx-currency",
    title: "Currencies",
    description: "Supported wallet and settlement currencies.",
    breadcrumbs: [{ label: "Admin", to: "/admin" }, { label: "FX", to: "/admin/fx/rates" }, { label: "Currencies" }],
    columns: [
      { key: "externalId", label: "Code", mono: true },
      { key: "title", label: "Name" },
      { key: "symbol", label: "Symbol", render: (r) => p(r, "symbol") },
      { key: "enabled", label: "Enabled", render: (r) => (r.payload.enabled ? "Yes" : "No") },
      { key: "status", label: "Status" },
    ],
  },
};

/** Map route filename stem to admin record domain (or null = skip / custom). */
export const ROUTE_FILE_DOMAIN: Record<string, string | null> = {
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
  "admin.customs": "customs-config",
  "admin.shipments.exceptions": "shipment-exception",
  "admin.labels": "shipping-label",
  "admin.pickup-points": "pickup-point",
  "admin.zones": "shipping-zone",
  "admin.corridors": "fx-corridor",
  "admin.currencies": "fx-currency",
  "admin.rates": "fx-rate",
  "admin.reconciliation": "chargeback",
  "admin.velocity": "velocity-rule",
  "admin.disputes.sla": "dispute-sla",
  "admin.disputes.$id.evidence": "fraud",
  "admin.disputes.$id.ruling": "fraud",
  "admin.settings.general": "platform-config",
  "admin.settings.branding": "banner",
  "admin.settings.locales": "legal-page",
  "admin.settings.api-keys": "api-key",
  "admin.settings.secrets": "platform-secret",
  "admin.settings.integrations": "integration",
  "admin.security": "security-policy",
  "admin.carriers.index": null,
  "admin.carriers.$id": null,
  "admin.2fa": "team-member",
  "admin.workspaces": "team-member",
  "admin.me": null,
};

export function routeStem(fileName: string) {
  return fileName.replace(/\.tsx$/, "");
}

export function getDomainForRouteFile(fileName: string) {
  const stem = routeStem(fileName);
  return ROUTE_FILE_DOMAIN[stem] ?? inferDomain(stem);
}

function inferDomain(stem: string) {
  if (stem.includes("analytics")) return "incident";
  if (stem.includes("listing") && !stem.includes("history")) return "brand";
  if (stem.includes("order") && stem !== "admin.orders.index" && !stem.includes("orders.$id.index")) return "chargeback";
  if (stem.includes("shipment") && stem !== "admin.shipments.index" && stem !== "admin.shipments.$id") {
    if (stem.includes("exceptions")) return "shipment-exception";
    return "warehouse";
  }
  if (stem.includes("seller") && !stem.includes("sellers.$id") && stem !== "admin.sellers.index" && stem !== "admin.sellers.applications") return "seller-tier";
  if (stem.includes("chat")) return "ticket";
  return "incident";
}

export function isDetailRoute(stem: string) {
  return stem.includes(".$id") && !stem.endsWith(".index");
}
