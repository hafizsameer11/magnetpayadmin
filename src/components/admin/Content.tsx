import { T } from "./AdminShell";
import { FileText, BookOpen, Scale, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

// ---------- Types ----------
export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  section: "Marketing" | "Footer" | "Onboarding" | "In-app";
  status: "Published" | "Draft" | "Scheduled";
  locale: string[];
  version: string;
  updatedAt: string;
  updatedBy: string;
  views30d: number;
  body: string;
};

export type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  category: "Escrow" | "Shipping" | "Payments & FX" | "Account" | "Disputes" | "Seller";
  status: "Published" | "Draft" | "Review";
  locale: string[];
  helpful: number; // percentage
  views30d: number;
  updatedAt: string;
  author: string;
  body: string;
};

export type LegalDoc = {
  id: string;
  key: "tos" | "privacy" | "refund" | "aml" | "cookies" | "acceptable-use";
  title: string;
  currentVersion: string;
  effectiveDate: string;
  jurisdictions: string[];
  status: "Active" | "Draft" | "Superseded";
  versions: {
    version: string;
    publishedAt: string;
    author: string;
    summary: string;
    diffLines: { sign: "+" | "-" | " "; text: string }[];
  }[];
};

export type ChangelogEntry = {
  id: string;
  version: string;
  releasedAt: string;
  channel: "Mobile" | "Web" | "API" | "Admin";
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  highlights: string[];
  items: { tag: "New" | "Improved" | "Fixed" | "Security"; text: string }[];
};

// ---------- Mock data ----------
export const CMS_PAGES: CmsPage[] = [
  { id: "p_about", slug: "/about", title: "About MagnetPay", section: "Marketing", status: "Published", locale: ["en", "zh", "ar"], version: "v8.4", updatedAt: "2026-06-24 14:02", updatedBy: "Adaeze N.", views30d: 18420, body: "MagnetPay is the trusted escrow rail for China ↔ Africa trade…" },
  { id: "p_faq", slug: "/faq", title: "FAQ", section: "Marketing", status: "Published", locale: ["en", "zh"], version: "v2.1", updatedAt: "2026-06-22 09:11", updatedBy: "Tunde K.", views30d: 9210, body: "Common questions about escrow, payouts and disputes…" },
  { id: "p_press", slug: "/press", title: "Press kit", section: "Marketing", status: "Published", locale: ["en"], version: "v1.0", updatedAt: "2026-06-12 16:48", updatedBy: "Adaeze N.", views30d: 412, body: "Logos, photography, factsheet, and contact for press…" },
  { id: "p_careers", slug: "/careers", title: "Careers", section: "Marketing", status: "Draft", locale: ["en"], version: "v0.3", updatedAt: "2026-06-26 19:30", updatedBy: "Olu A.", views30d: 0, body: "Help build cross-border trade infrastructure…" },
  { id: "p_pricing", slug: "/pricing", title: "Pricing", section: "Marketing", status: "Scheduled", locale: ["en", "zh"], version: "v3.0", updatedAt: "2026-06-25 08:00", updatedBy: "Wei Z.", views30d: 6802, body: "0.9% on funded escrow + ¥6 fixed per release…" },
  { id: "p_onb_welcome", slug: "/onboarding/welcome", title: "Onboarding · Welcome", section: "Onboarding", status: "Published", locale: ["en", "zh", "ar"], version: "v5.2", updatedAt: "2026-06-20 12:18", updatedBy: "System", views30d: 24011, body: "Welcome to MagnetPay. Let's get your wallet ready…" },
  { id: "p_inapp_empty_orders", slug: "/inapp/empty/orders", title: "Empty state · Orders", section: "In-app", status: "Published", locale: ["en", "zh"], version: "v1.4", updatedAt: "2026-06-18 10:00", updatedBy: "Mei L.", views30d: 31204, body: "No orders yet — browse the market to get started." },
  { id: "p_footer_partners", slug: "/footer/partners", title: "Footer · Partners", section: "Footer", status: "Published", locale: ["en"], version: "v1.0", updatedAt: "2026-05-30 11:22", updatedBy: "Adaeze N.", views30d: 1245, body: "Banking partners, logistics partners and inspection partners…" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  { id: "h_release", slug: "when-do-milestones-release", title: "When are escrow milestones released?", category: "Escrow", status: "Published", locale: ["en", "zh", "ar"], helpful: 92, views30d: 8421, updatedAt: "2026-06-25 09:14", author: "Adaeze N.", body: "Funds release automatically when the corresponding milestone (deposit, production, B/L, delivery) is approved…" },
  { id: "h_fees", slug: "magnetpay-fees", title: "What does MagnetPay charge?", category: "Payments & FX", status: "Published", locale: ["en", "zh"], helpful: 88, views30d: 7210, updatedAt: "2026-06-22 15:42", author: "Wei Z.", body: "0.9% on funded escrow + ¥6 fixed per release. FX at mid-market + 0.35%." },
  { id: "h_payout_time", slug: "payout-time-ngn", title: "How long do CNY → NGN payouts take?", category: "Payments & FX", status: "Published", locale: ["en"], helpful: 81, views30d: 5402, updatedAt: "2026-06-19 12:01", author: "Tunde K.", body: "Typically 1–2 business hours during banking hours…" },
  { id: "h_cancel", slug: "cancel-after-funding", title: "Can I cancel an order after funding escrow?", category: "Escrow", status: "Published", locale: ["en", "zh"], helpful: 76, views30d: 3120, updatedAt: "2026-06-18 11:23", author: "Adaeze N.", body: "Yes, before production starts…" },
  { id: "h_sgs", slug: "sgs-inspection", title: "Is SGS inspection mandatory?", category: "Shipping", status: "Published", locale: ["en", "zh"], helpful: 84, views30d: 2811, updatedAt: "2026-06-12 14:18", author: "Mei L.", body: "Optional but recommended on first orders above ¥50,000…" },
  { id: "h_dispute", slug: "open-a-dispute", title: "How to open a dispute", category: "Disputes", status: "Published", locale: ["en", "zh", "ar"], helpful: 90, views30d: 4220, updatedAt: "2026-06-26 18:42", author: "Olu A.", body: "Open a dispute within 7 days of delivery via the order page…" },
  { id: "h_2fa", slug: "enable-2fa", title: "Enable 2-factor authentication", category: "Account", status: "Published", locale: ["en", "zh"], helpful: 95, views30d: 1820, updatedAt: "2026-06-08 10:00", author: "System", body: "Go to Settings → Security and tap Enable 2FA…" },
  { id: "h_seller_payout", slug: "seller-payout-setup", title: "Setting up your seller payout", category: "Seller", status: "Review", locale: ["en", "zh"], helpful: 0, views30d: 0, updatedAt: "2026-06-27 09:20", author: "Wei Z.", body: "Add your bank account and verify with a test deposit…" },
  { id: "h_draft", slug: "ramadan-hours", title: "Ramadan support hours", category: "Account", status: "Draft", locale: ["en", "ar"], helpful: 0, views30d: 0, updatedAt: "2026-06-27 17:02", author: "Adaeze N.", body: "Adjusted hours during Ramadan…" },
];

export const LEGAL_DOCS: LegalDoc[] = [
  {
    id: "l_tos", key: "tos", title: "Terms of Service",
    currentVersion: "v8.4", effectiveDate: "2026-06-04",
    jurisdictions: ["NG", "CN", "KE", "GH", "AE"], status: "Active",
    versions: [
      { version: "v8.4", publishedAt: "2026-06-04", author: "Legal · Olu A.", summary: "Clarified dispute window from 5 → 7 days; added force-majeure clause for port closures.",
        diffLines: [
          { sign: " ", text: "8.3 Dispute resolution" },
          { sign: "-", text: "Buyer must open a dispute within 5 calendar days of delivery." },
          { sign: "+", text: "Buyer must open a dispute within 7 calendar days of delivery." },
          { sign: " ", text: "" },
          { sign: "+", text: "8.7 Force majeure (added) — Port closures, customs holds and currency controls beyond MagnetPay's reasonable control suspend SLA timers." },
        ],
      },
      { version: "v8.3", publishedAt: "2026-03-22", author: "Legal · Olu A.", summary: "Added Kenya jurisdiction and CBK references.", diffLines: [] },
      { version: "v8.2", publishedAt: "2026-01-15", author: "Legal · Olu A.", summary: "Updated escrow fee schedule to 0.9% + ¥6 fixed.", diffLines: [] },
    ],
  },
  {
    id: "l_privacy", key: "privacy", title: "Privacy Policy",
    currentVersion: "v6.1", effectiveDate: "2026-06-04",
    jurisdictions: ["NG", "CN", "EU", "AE"], status: "Active",
    versions: [
      { version: "v6.1", publishedAt: "2026-06-04", author: "Legal · Olu A.", summary: "Listed new sub-processor (Twilio CN) and updated retention table.",
        diffLines: [
          { sign: " ", text: "Annex A — Sub-processors" },
          { sign: "+", text: "Twilio Messaging Ltd. (CN region) — SMS OTP delivery" },
        ],
      },
      { version: "v6.0", publishedAt: "2026-02-10", author: "Legal · Olu A.", summary: "GDPR alignment; added data subject rights flow.", diffLines: [] },
    ],
  },
  {
    id: "l_refund", key: "refund", title: "Refund Policy",
    currentVersion: "v3.2", effectiveDate: "2026-05-18",
    jurisdictions: ["NG", "CN"], status: "Active",
    versions: [
      { version: "v3.2", publishedAt: "2026-05-18", author: "Legal · Olu A.", summary: "Added partial-refund schedule for SGS-failed shipments.", diffLines: [] },
      { version: "v3.1", publishedAt: "2026-01-20", author: "Legal · Olu A.", summary: "Clarified FX spread on refunds (mid-market + 0.35%).", diffLines: [] },
    ],
  },
  {
    id: "l_aml", key: "aml", title: "AML & Sanctions Policy",
    currentVersion: "v4.0", effectiveDate: "2026-05-12",
    jurisdictions: ["NG", "CN", "AE"], status: "Active",
    versions: [{ version: "v4.0", publishedAt: "2026-05-12", author: "Compliance · Idris M.", summary: "Adopted FATF 2026 high-risk jurisdictions list.", diffLines: [] }],
  },
  {
    id: "l_cookies", key: "cookies", title: "Cookies & Tracking",
    currentVersion: "v2.0", effectiveDate: "2026-06-04",
    jurisdictions: ["EU", "NG"], status: "Active",
    versions: [{ version: "v2.0", publishedAt: "2026-06-04", author: "Legal · Olu A.", summary: "Added granular consent for analytics, marketing and functional cookies.", diffLines: [] }],
  },
  {
    id: "l_aup", key: "acceptable-use", title: "Acceptable Use Policy",
    currentVersion: "v1.3", effectiveDate: "2026-02-14",
    jurisdictions: ["Global"], status: "Active",
    versions: [{ version: "v1.3", publishedAt: "2026-02-14", author: "Legal · Olu A.", summary: "Banned high-risk categories (firearms, wildlife, fentanyl precursors).", diffLines: [] }],
  },
];

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "c_82", version: "v8.2.0", releasedAt: "2026-06-27", channel: "Mobile", status: "Published", author: "Release · Wei Z.",
    highlights: ["Faster CNY → NGN payouts (avg 38 min, down from 1h 12m)", "New escrow milestone: 'B/L received'", "Arabic localization in checkout"],
    items: [
      { tag: "New", text: "Arabic (ar-AE) localization across checkout and escrow flows." },
      { tag: "New", text: "Escrow milestone 'B/L received' available on FOB / CIF templates." },
      { tag: "Improved", text: "Payout engine routes via NIBSS Instant for amounts ≤ ₦1,000,000." },
      { tag: "Improved", text: "Receipt PDFs now include HS code and customs declaration ref." },
      { tag: "Fixed", text: "Avatar upload failing on Android 14 when image > 4MB." },
      { tag: "Security", text: "Rotated SMS OTP signing key; old tokens invalidated." },
    ],
  },
  {
    id: "c_81", version: "v8.1.2", releasedAt: "2026-06-18", channel: "Mobile", status: "Published", author: "Release · Wei Z.",
    highlights: ["Dispute SLA timer surfaced on order detail", "Bug fixes for FX rate refresh"],
    items: [
      { tag: "Improved", text: "Dispute SLA countdown is now visible on order detail screens." },
      { tag: "Fixed", text: "FX rate sometimes stale for 5+ min on cold app launch." },
      { tag: "Fixed", text: "Wallet history infinite scroll duplicates on slow networks." },
    ],
  },
  {
    id: "c_admin_3", version: "Admin v3.4", releasedAt: "2026-06-15", channel: "Admin", status: "Published", author: "Release · Mei L.",
    highlights: ["Compliance cluster: SARs composer, sanctions screening UI"],
    items: [
      { tag: "New", text: "SARs filing composer with NFIU / FinCEN regulator presets." },
      { tag: "New", text: "Sanctions screening review dialog with OFAC / UN / EU lists." },
      { tag: "Improved", text: "Audit log JSON viewer with signed-event verification." },
    ],
  },
  {
    id: "c_api_22", version: "API v2.2", releasedAt: "2026-06-10", channel: "API", status: "Published", author: "Platform · Sade O.",
    highlights: ["Webhooks for escrow.milestone.released", "Stricter idempotency keys"],
    items: [
      { tag: "New", text: "Webhook event escrow.milestone.released with signed payload." },
      { tag: "Improved", text: "Idempotency-Key required on POST /payouts (was optional)." },
      { tag: "Security", text: "Per-merchant rate limits enforced server-side (was edge-only)." },
    ],
  },
  {
    id: "c_83", version: "v8.3.0", releasedAt: "2026-07-04", channel: "Mobile", status: "Scheduled", author: "Release · Wei Z.",
    highlights: ["Apple Pay top-up", "Saved supplier lists", "Inline FX hedging quotes"],
    items: [
      { tag: "New", text: "Apple Pay top-up for NGN wallet (pilot: 5% of users)." },
      { tag: "New", text: "Saved supplier lists, sharable across an org." },
      { tag: "New", text: "Inline FX hedging quotes on amounts > ¥100,000." },
    ],
  },
];

// ---------- UI primitives ----------
export function statusPillCms(s: CmsPage["status"] | HelpArticle["status"] | ChangelogEntry["status"] | LegalDoc["status"]) {
  const map: Record<string, { bg: string; fg: string }> = {
    Published: { bg: `${T.success}14`, fg: T.success },
    Active:    { bg: `${T.success}14`, fg: T.success },
    Draft:     { bg: `${T.muted}1F`,   fg: T.sub },
    Review:    { bg: `${T.info}14`,    fg: T.info },
    Scheduled: { bg: `${T.warn}18`,    fg: T.warn },
    Superseded:{ bg: `${T.muted}1F`,   fg: T.muted },
  };
  const c = map[s] ?? map.Draft;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.fg }}>
      <span className="size-1.5 rounded-full" style={{ background: c.fg }} />
      {s}
    </span>
  );
}

export function LocaleChips({ locales }: { locales: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <span key={l} className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase"
          style={{ background: T.bg, color: T.sub, border: `1px solid ${T.border}`, fontFamily: "'JetBrains Mono', monospace" }}>
          {l}
        </span>
      ))}
    </div>
  );
}

export function categoryIcon(cat: HelpArticle["category"]) {
  const map: Record<string, { I: typeof FileText; c: string }> = {
    Escrow:         { I: Scale,    c: T.info },
    Shipping:       { I: BookOpen, c: T.success },
    "Payments & FX":{ I: Sparkles, c: T.accent },
    Account:        { I: FileText, c: T.sub },
    Disputes:       { I: Scale,    c: T.danger },
    Seller:         { I: BookOpen, c: T.navy },
  };
  const m = map[cat] ?? map.Account;
  return (
    <div className="size-7 rounded-lg grid place-items-center shrink-0" style={{ background: `${m.c}14`, color: m.c }}>
      <m.I className="size-3.5" strokeWidth={2.3} />
    </div>
  );
}

export function tagPill(tag: ChangelogEntry["items"][number]["tag"]) {
  const map: Record<string, { bg: string; fg: string }> = {
    New:      { bg: `${T.info}14`,    fg: T.info },
    Improved: { bg: `${T.success}14`, fg: T.success },
    Fixed:    { bg: `${T.warn}18`,    fg: T.warn },
    Security: { bg: `${T.danger}14`,  fg: T.danger },
  };
  const c = map[tag];
  return (
    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wide"
      style={{ background: c.bg, color: c.fg, fontFamily: "'JetBrains Mono', monospace" }}>
      {tag}
    </span>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <header className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
        <p className="text-[12px] font-bold">{title}</p>
        {action}
      </header>
      {children}
    </section>
  );
}

export function KPI({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "success" | "warn" | "info" }) {
  const c = tone === "success" ? T.success : tone === "warn" ? T.warn : tone === "info" ? T.info : T.ink;
  return (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>{label}</p>
      <p className="mt-1.5 text-[20px] font-bold tabular-nums" style={{ color: c, fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px]" style={{ color: T.sub }}>{sub}</p>}
    </div>
  );
}
