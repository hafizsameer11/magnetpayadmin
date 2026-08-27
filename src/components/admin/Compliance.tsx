import { T } from "@/components/admin/AdminShell";
import { Card, KPI, FilterBar, FilterChip, FlagEmoji, fmtNGN, Pill } from "@/components/admin/Money";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export { Card, KPI, FilterBar, FilterChip, FlagEmoji, fmtNGN, Pill };

const mono = { fontFamily: "'JetBrains Mono', monospace" } as const;
export const MONO = mono;

// ---------- shared pills ----------
export function sevPill(s: "low" | "medium" | "high" | "critical") {
  const c = s === "critical" ? T.danger : s === "high" ? T.accent : s === "medium" ? T.warn : T.muted;
  return (
    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-md text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${c}14`, color: c }}>
      <span className="size-1.5 rounded-full" style={{ background: c }} /> {s}
    </span>
  );
}

export function statePill(s: string, color?: string) {
  const c = color ?? T.info;
  return (
    <span className="inline-flex items-center gap-1 px-2 h-5 rounded-md text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${c}14`, color: c }}>
      <span className="size-1.5 rounded-full" style={{ background: c }} /> {s.replace(/_/g, " ")}
    </span>
  );
}

export function riskBar(score: number) {
  const c = score >= 80 ? T.danger : score >= 60 ? T.accent : score >= 40 ? T.warn : T.success;
  return (
    <div className="flex items-center gap-2 w-[120px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.bg }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, score)}%`, background: c }} />
      </div>
      <span className="tabular-nums text-[11px] font-bold" style={{ ...mono, color: c, width: 22 }}>{score}</span>
    </div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div>
        <h3 className="text-[14px] font-bold">{title}</h3>
        {sub && <p className="text-[11.5px]" style={{ color: T.sub }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ====================================================================
//  AML
// ====================================================================
export type AMLCaseStatus = "new" | "investigating" | "escalated" | "filed" | "cleared" | "blocked";
export type AMLCase = {
  id: string;
  user: string;
  userId: string;
  country: "NG" | "GH" | "KE" | "CN";
  amountNGN: number;
  txnId: string;
  trigger: string;
  riskScore: number;
  severity: "low" | "medium" | "high" | "critical";
  status: AMLCaseStatus;
  assignee?: string;
  opened: string;
  ageHours: number;
  notes: number;
};

export const AML_CASES: AMLCase[] = [
  { id: "AML-7741", user: "Ngozi Eze",      userId: "USR-09701", country: "NG", amountNGN: 1380000, txnId: "DEP-44112", trigger: "Velocity — 4 deposits / 24h",      riskScore: 82, severity: "high",     status: "investigating", assignee: "Tunde A.", opened: "3 hr ago",  ageHours: 3,  notes: 4 },
  { id: "AML-7740", user: "Ibrahim Yusuf",  userId: "USR-09221", country: "NG", amountNGN: 603400,  txnId: "TXN-9020301", trigger: "Chargeback cluster on card BIN", riskScore: 74, severity: "high",     status: "escalated",     assignee: "Funke O.", opened: "2 days ago", ageHours: 49, notes: 7 },
  { id: "AML-7738", user: "Shenzhen TopMax",userId: "SLR-2041",  country: "CN", amountNGN: 20247000,txnId: "WDR-22041", trigger: "Large CNY withdrawal vs avg 30d",   riskScore: 58, severity: "medium",   status: "new",          assignee: undefined,  opened: "44 min ago",ageHours: 1,  notes: 0 },
  { id: "AML-7735", user: "Mary Wanjiru",   userId: "USR-09410", country: "KE", amountNGN: 681000,  txnId: "DEP-44102", trigger: "M-Pesa funded → CNY corridor",      riskScore: 41, severity: "medium",   status: "investigating", assignee: "Tunde A.", opened: "5 days ago",ageHours: 124,notes: 2 },
  { id: "AML-7730", user: "Femi Adeyemi",   userId: "USR-09584", country: "NG", amountNGN: 4820000, txnId: "DEP-44109", trigger: "Structuring pattern (smurfing)",    riskScore: 91, severity: "critical", status: "filed",        assignee: "Funke O.", opened: "1 wk ago", ageHours: 168,notes: 12 },
  { id: "AML-7722", user: "Tolu Bankole",   userId: "USR-10182", country: "NG", amountNGN: 122000,  txnId: "DEP-44118", trigger: "Round-amount pattern",              riskScore: 28, severity: "low",      status: "cleared",      assignee: "Tunde A.", opened: "2 wks ago",ageHours: 380,notes: 3 },
  { id: "AML-7714", user: "Yiwu PowerLine", userId: "SLR-3092",  country: "CN", amountNGN: 3252368, txnId: "WDR-22033", trigger: "Beneficiary mismatch vs KYB",       riskScore: 88, severity: "critical", status: "blocked",      assignee: "Funke O.", opened: "yesterday",ageHours: 18, notes: 6 },
];

export function findAML(id: string | undefined) {
  if (!id) return AML_CASES[0];
  return AML_CASES.find(c => c.id === id || c.id.endsWith(id)) ?? AML_CASES[0];
}

export const AML_STATUS_COLOR: Record<AMLCaseStatus, string> = {
  new: T.info, investigating: T.warn, escalated: T.accent, filed: "#7C3AED", cleared: T.success, blocked: T.danger,
};

// ====================================================================
//  Sanctions
// ====================================================================
export type SanctionsHit = {
  id: string;
  subject: string;
  subjectId: string;
  type: "user" | "seller" | "beneficiary" | "device";
  list: "OFAC SDN" | "EU Consolidated" | "UN 1267" | "UK HMT" | "Nigeria NSCDC" | "PEP";
  score: number;
  matchOn: string;
  dob?: string;
  country: string;
  status: "open" | "confirmed" | "false_positive" | "cleared";
  hitAt: string;
};

export const SANCTIONS: SanctionsHit[] = [
  { id: "SAN-9041", subject: "Abdul A. Khalid",    subjectId: "USR-10911", type: "user",       list: "OFAC SDN",        score: 96, matchOn: "Name + DOB",    dob: "1981-04-12", country: "NG", status: "open",           hitAt: "12 min ago" },
  { id: "SAN-9040", subject: "Yiwu PowerLine Ltd", subjectId: "SLR-3092",  type: "seller",     list: "EU Consolidated", score: 72, matchOn: "Director name", country: "CN", status: "open",           hitAt: "1 hr ago" },
  { id: "SAN-9038", subject: "Olu Bankole",        subjectId: "USR-10182", type: "user",       list: "UN 1267",         score: 48, matchOn: "Partial name",   country: "NG", status: "false_positive", hitAt: "yesterday" },
  { id: "SAN-9035", subject: "TopMax HK Holdings", subjectId: "BEN-44120", type: "beneficiary",list: "UK HMT",          score: 88, matchOn: "Entity match",   country: "HK", status: "confirmed",      hitAt: "2 days ago" },
  { id: "SAN-9030", subject: "Joy Mensah",         subjectId: "USR-08741", type: "user",       list: "PEP",             score: 64, matchOn: "Spouse relation",country: "GH", status: "cleared",        hitAt: "1 wk ago" },
];

// ====================================================================
//  PEP
// ====================================================================
export type PEP = {
  id: string;
  user: string;
  userId: string;
  country: string;
  category: "Head of State" | "Minister" | "Judiciary" | "Military" | "SOE Executive" | "Family / RCA";
  position: string;
  source: "Dow Jones" | "World-Check" | "Internal" | "ComplyAdvantage";
  score: number;
  status: "pending_edd" | "edd_complete" | "monitor" | "cleared";
  lastReview: string;
};

export const PEPS: PEP[] = [
  { id: "PEP-2210", user: "Hon. Chinedu Okeke",   userId: "USR-10412", country: "NG", category: "Minister",        position: "Special Adviser, Finance",      source: "Dow Jones",      score: 88, status: "pending_edd",  lastReview: "—" },
  { id: "PEP-2208", user: "Joy Mensah",           userId: "USR-08741", country: "GH", category: "Family / RCA",    position: "Spouse of Deputy Minister",     source: "World-Check",    score: 64, status: "edd_complete", lastReview: "2 wks ago" },
  { id: "PEP-2205", user: "Col. Ibrahim Yusuf",   userId: "USR-09221", country: "NG", category: "Military",        position: "Retired Colonel, NA",           source: "ComplyAdvantage",score: 72, status: "monitor",      lastReview: "1 mo ago" },
  { id: "PEP-2201", user: "Justice A. Adebayo",   userId: "USR-10044", country: "NG", category: "Judiciary",       position: "Appeal Court Judge",            source: "Dow Jones",      score: 81, status: "monitor",      lastReview: "3 wks ago" },
  { id: "PEP-2199", user: "Daniel Mwangi",        userId: "USR-09410", country: "KE", category: "SOE Executive",   position: "CFO, Kenya Power & Lighting",   source: "Internal",       score: 58, status: "edd_complete", lastReview: "1 mo ago" },
  { id: "PEP-2195", user: "Aisha Bello",          userId: "USR-08902", country: "NG", category: "Family / RCA",    position: "Daughter of former Senator",    source: "World-Check",    score: 44, status: "cleared",      lastReview: "2 mo ago" },
];

// ====================================================================
//  SARs
// ====================================================================
export type SARStatus = "draft" | "submitted" | "acknowledged" | "responded";
export type SAR = {
  id: string;
  filingRef: string;
  authority: "NFIU" | "FCA" | "FinCEN" | "FIC-GH" | "FRC-KE";
  subject: string;
  subjectId: string;
  amountNGN: number;
  amlCaseId: string;
  status: SARStatus;
  filedBy: string;
  filedAt: string;
  daysOpen: number;
};

export const SARS: SAR[] = [
  { id: "SAR-1041", filingRef: "NFIU-2026-78821", authority: "NFIU",    subject: "Femi Adeyemi",  subjectId: "USR-09584", amountNGN: 4820000,  amlCaseId: "AML-7730", status: "submitted",    filedBy: "Funke O.", filedAt: "1 wk ago",   daysOpen: 7 },
  { id: "SAR-1038", filingRef: "NFIU-2026-78814", authority: "NFIU",    subject: "Yiwu PowerLine", subjectId: "SLR-3092", amountNGN: 3252368,  amlCaseId: "AML-7714", status: "acknowledged", filedBy: "Funke O.", filedAt: "yesterday",  daysOpen: 1 },
  { id: "SAR-1035", filingRef: "FIC-GH-2026-2241",authority: "FIC-GH",  subject: "Joy Mensah",     subjectId: "USR-08741", amountNGN: 561000,  amlCaseId: "AML-7702", status: "responded",    filedBy: "Tunde A.", filedAt: "3 wks ago",  daysOpen: 21 },
  { id: "SAR-1030", filingRef: "—",                authority: "NFIU",    subject: "Ibrahim Yusuf",  subjectId: "USR-09221", amountNGN: 603400,  amlCaseId: "AML-7740", status: "draft",        filedBy: "Funke O.", filedAt: "—",          daysOpen: 0 },
  { id: "SAR-1027", filingRef: "FRC-KE-2026-440", authority: "FRC-KE",  subject: "Mary Wanjiru",   subjectId: "USR-09410", amountNGN: 681000,  amlCaseId: "AML-7735", status: "submitted",    filedBy: "Tunde A.", filedAt: "4 days ago", daysOpen: 4 },
];

export const SAR_STATUS_COLOR: Record<SARStatus, string> = {
  draft: T.muted, submitted: T.info, acknowledged: T.warn, responded: T.success,
};

// ====================================================================
//  Risk Rules
// ====================================================================
export type RiskRule = {
  id: string;
  name: string;
  scope: "deposit" | "withdrawal" | "checkout" | "login" | "kyc" | "any";
  condition: string;
  action: "review" | "block" | "challenge" | "alert";
  hits24h: number;
  hits30d: number;
  fpRate: number; // false positive %
  enabled: boolean;
  lastEdited: string;
  author: string;
};

export const RISK_RULES: RiskRule[] = [
  { id: "RR-101", name: "Card BIN velocity",          scope: "checkout",   condition: "Same card BIN > 5 distinct users / 1h",       action: "review",    hits24h: 28,  hits30d: 412,  fpRate: 12, enabled: true,  lastEdited: "3 days ago", author: "Funke O." },
  { id: "RR-102", name: "First withdrawal > ₦100k",   scope: "withdrawal", condition: "is_first_withdrawal AND amount > 100000 NGN", action: "review",    hits24h: 14,  hits30d: 188,  fpRate: 28, enabled: true,  lastEdited: "1 wk ago",   author: "Tunde A." },
  { id: "RR-103", name: "Sanctioned country IP",      scope: "login",      condition: "ip_country IN ('IR','KP','SY','CU')",          action: "block",     hits24h: 7,   hits30d: 92,   fpRate: 1,  enabled: true,  lastEdited: "2 wks ago",  author: "Funke O." },
  { id: "RR-104", name: "Structuring pattern",        scope: "deposit",    condition: "≥3 deposits 90-110% of tier cap in 24h",       action: "alert",     hits24h: 2,   hits30d: 18,   fpRate: 4,  enabled: true,  lastEdited: "yesterday",  author: "Funke O." },
  { id: "RR-105", name: "Impossible travel",          scope: "login",      condition: "geo distance > 1500km in < 1h",                action: "challenge", hits24h: 41,  hits30d: 612,  fpRate: 34, enabled: true,  lastEdited: "4 days ago", author: "Tunde A." },
  { id: "RR-106", name: "New device + high-cart",     scope: "checkout",   condition: "new_device AND cart_value > ₦1M",              action: "challenge", hits24h: 22,  hits30d: 312,  fpRate: 18, enabled: true,  lastEdited: "1 wk ago",   author: "Tunde A." },
  { id: "RR-107", name: "KYC selfie liveness fail",   scope: "kyc",        condition: "liveness_score < 0.6",                         action: "review",    hits24h: 11,  hits30d: 142,  fpRate: 22, enabled: true,  lastEdited: "2 wks ago",  author: "Funke O." },
  { id: "RR-108", name: "Mule account heuristic",     scope: "any",        condition: "in_amount==out_amount within 60s, >3x",        action: "block",     hits24h: 1,   hits30d: 8,    fpRate: 2,  enabled: false, lastEdited: "1 mo ago",   author: "Funke O." },
];

// ====================================================================
//  Blocklist / Allowlist
// ====================================================================
export type ListKind = "user" | "device" | "ip" | "card" | "currency" | "country" | "email_domain";
export type ListEntry = {
  id: string;
  kind: ListKind;
  value: string;
  reason: string;
  addedBy: string;
  addedAt: string;
  hits: number;
  expiresAt?: string;
};

export const BLOCKLIST: ListEntry[] = [
  { id: "BLK-4401", kind: "card",        value: "BIN 484340 ****",                reason: "Chargeback cluster — 6 disputes",          addedBy: "Funke O.", addedAt: "2 days ago", hits: 88 },
  { id: "BLK-4400", kind: "ip",          value: "102.89.43.0/24",                 reason: "Credential stuffing source",                addedBy: "Tunde A.", addedAt: "1 wk ago",   hits: 412 },
  { id: "BLK-4398", kind: "device",      value: "fp_8821xkz019",                  reason: "Used by 12 fraud-flagged accounts",         addedBy: "Funke O.", addedAt: "5 days ago", hits: 22 },
  { id: "BLK-4395", kind: "user",        value: "USR-08410 · Bayo Akinbode",      reason: "Confirmed fraud — internal investigation",   addedBy: "Funke O.", addedAt: "3 wks ago",  hits: 0 },
  { id: "BLK-4390", kind: "country",     value: "🇮🇷 Iran",                        reason: "Sanctions program",                         addedBy: "system",   addedAt: "—",          hits: 14 },
  { id: "BLK-4388", kind: "country",     value: "🇰🇵 North Korea",                 reason: "Sanctions program",                         addedBy: "system",   addedAt: "—",          hits: 0 },
  { id: "BLK-4385", kind: "currency",    value: "RUB · Russian Ruble",            reason: "Corridor disabled — sanctions",             addedBy: "system",   addedAt: "—",          hits: 0 },
  { id: "BLK-4380", kind: "email_domain",value: "@mailinator.com",                reason: "Disposable email — KYC abuse",              addedBy: "Tunde A.", addedAt: "1 mo ago",   hits: 188, expiresAt: "—" },
];

export const ALLOWLIST: ListEntry[] = [
  { id: "ALW-2201", kind: "user",        value: "SLR-2041 · Shenzhen TopMax",     reason: "Tier S strategic seller — bypass velocity",addedBy: "Funke O.", addedAt: "2 mo ago",   hits: 9821 },
  { id: "ALW-2198", kind: "ip",          value: "203.0.113.0/24 (Office Lagos)",  reason: "Internal staff network",                    addedBy: "Tunde A.", addedAt: "3 mo ago",   hits: 41200 },
  { id: "ALW-2195", kind: "card",        value: "BIN 478892 (Corporate Amex)",    reason: "Treasury reload card",                      addedBy: "Funke O.", addedAt: "1 mo ago",   hits: 1844 },
  { id: "ALW-2192", kind: "email_domain",value: "@magnetpay.ng",                  reason: "Internal staff accounts",                   addedBy: "system",   addedAt: "—",          hits: 188400 },
  { id: "ALW-2190", kind: "user",        value: "USR-10241 · Adaeze Okafor",      reason: "VIP buyer — manual whitelist",              addedBy: "Funke O.", addedAt: "2 wks ago",  hits: 142 },
];

export const LIST_KIND_COLOR: Record<ListKind, string> = {
  user: T.info, device: "#7C3AED", ip: T.warn, card: T.accent, currency: T.success, country: T.navy, email_domain: T.sub,
};

export function listKindPill(k: ListKind) {
  const c = LIST_KIND_COLOR[k];
  return (
    <span className="inline-flex items-center px-2 h-5 rounded-md text-[10.5px] font-bold uppercase tracking-wider" style={{ background: `${c}14`, color: c }}>
      {k.replace("_", " ")}
    </span>
  );
}

// ====================================================================
//  Velocity
// ====================================================================
export type VelocityRule = {
  id: string;
  name: string;
  target: "user" | "device" | "ip" | "card" | "tier:1" | "tier:2" | "tier:3";
  metric: "deposits" | "withdrawals" | "logins" | "checkouts" | "kyc_attempts";
  limit: number;
  window: "1m" | "5m" | "1h" | "24h" | "7d" | "30d";
  action: "block" | "review" | "challenge";
  enabled: boolean;
  triggered24h: number;
};

export const VELOCITY_RULES: VelocityRule[] = [
  { id: "V-201", name: "Deposit floodgate", target: "user",    metric: "deposits",     limit: 5,  window: "1h",  action: "review",    enabled: true,  triggered24h: 14 },
  { id: "V-202", name: "Tier-1 withdrawal cap", target: "tier:1", metric: "withdrawals", limit: 3, window: "24h", action: "block",     enabled: true,  triggered24h: 8 },
  { id: "V-203", name: "Login burst",         target: "ip",     metric: "logins",       limit: 20, window: "5m",  action: "challenge", enabled: true,  triggered24h: 142 },
  { id: "V-204", name: "Card retry abuse",    target: "card",   metric: "checkouts",    limit: 4,  window: "1h",  action: "block",     enabled: true,  triggered24h: 22 },
  { id: "V-205", name: "Device KYC abuse",    target: "device", metric: "kyc_attempts", limit: 3,  window: "24h", action: "block",     enabled: true,  triggered24h: 4 },
  { id: "V-206", name: "Tier-3 large deposit",target: "tier:3", metric: "deposits",     limit: 10, window: "24h", action: "review",    enabled: false, triggered24h: 0 },
];

// ====================================================================
//  Fraud Cases
// ====================================================================
export type FraudCaseStatus = "open" | "investigating" | "confirmed" | "false_positive" | "recovered";
export type FraudCase = {
  id: string;
  user: string;
  userId: string;
  country: "NG" | "GH" | "KE" | "CN";
  typology: "Account takeover" | "Card testing" | "Mule" | "Friendly fraud" | "Triangulation" | "Seller collusion";
  lossNGN: number;
  recoveredNGN: number;
  status: FraudCaseStatus;
  severity: "low" | "medium" | "high" | "critical";
  assignee?: string;
  linkedCases: number;
  evidence: number;
  opened: string;
};

export const FRAUD_CASES: FraudCase[] = [
  { id: "FRC-5521", user: "Bayo Akinbode",  userId: "USR-08410", country: "NG", typology: "Account takeover", lossNGN: 1820000, recoveredNGN: 0,        status: "confirmed",     severity: "critical", assignee: "Funke O.", linkedCases: 4, evidence: 18, opened: "3 wks ago" },
  { id: "FRC-5520", user: "Ibrahim Yusuf",  userId: "USR-09221", country: "NG", typology: "Friendly fraud",   lossNGN: 603400,  recoveredNGN: 0,        status: "investigating", severity: "high",     assignee: "Tunde A.", linkedCases: 1, evidence: 7,  opened: "2 days ago" },
  { id: "FRC-5518", user: "unknown · BIN 484340", userId: "—",   country: "NG", typology: "Card testing",     lossNGN: 88400,   recoveredNGN: 0,        status: "open",          severity: "high",     assignee: undefined,   linkedCases: 22,evidence: 4,  opened: "12 hr ago" },
  { id: "FRC-5515", user: "Yiwu PowerLine", userId: "SLR-3092",  country: "CN", typology: "Seller collusion", lossNGN: 3252368, recoveredNGN: 1200000,  status: "investigating", severity: "critical", assignee: "Funke O.", linkedCases: 3, evidence: 22, opened: "1 wk ago" },
  { id: "FRC-5510", user: "Chioma Eze",     userId: "USR-08801", country: "NG", typology: "Triangulation",    lossNGN: 412000,  recoveredNGN: 412000,   status: "recovered",     severity: "medium",   assignee: "Tunde A.", linkedCases: 2, evidence: 9,  opened: "1 mo ago" },
  { id: "FRC-5505", user: "Daniel Mwangi",  userId: "USR-09410", country: "KE", typology: "Mule",             lossNGN: 188000,  recoveredNGN: 0,        status: "false_positive",severity: "low",      assignee: "Tunde A.", linkedCases: 0, evidence: 3,  opened: "2 wks ago" },
];

export function findFraud(id: string | undefined) {
  if (!id) return FRAUD_CASES[0];
  return FRAUD_CASES.find(c => c.id === id || c.id.endsWith(id)) ?? FRAUD_CASES[0];
}

export const FRAUD_STATUS_COLOR: Record<FraudCaseStatus, string> = {
  open: T.info, investigating: T.warn, confirmed: T.danger, false_positive: T.muted, recovered: T.success,
};

// ====================================================================
//  Audit Log
// ====================================================================
export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  actorId: string;
  role: "Admin" | "Compliance" | "Support" | "Finance" | "System" | "Engineer";
  action: string;
  category: "auth" | "money" | "user" | "policy" | "data" | "system";
  target: string;
  ip: string;
  result: "success" | "denied" | "error";
};

export const AUDIT: AuditEvent[] = [
  { id: "AUD-91041", at: "Jun 28 09:18 UTC", actor: "Funke Oladipo",   actorId: "STF-0014", role: "Compliance", action: "Approved KYC tier upgrade",     category: "user",   target: "USR-10241",    ip: "203.0.113.42", result: "success" },
  { id: "AUD-91040", at: "Jun 28 09:14 UTC", actor: "system",          actorId: "BOT-RR",   role: "System",     action: "Risk rule RR-104 triggered",     category: "policy", target: "DEP-44112",    ip: "—",            result: "success" },
  { id: "AUD-91038", at: "Jun 28 09:02 UTC", actor: "Tunde Aremu",     actorId: "STF-0011", role: "Finance",    action: "Released escrow ESC-77011",      category: "money",  target: "ESC-77011",    ip: "203.0.113.42", result: "success" },
  { id: "AUD-91036", at: "Jun 28 08:51 UTC", actor: "Funke Oladipo",   actorId: "STF-0014", role: "Compliance", action: "Added blocklist entry",          category: "policy", target: "BLK-4401",     ip: "203.0.113.42", result: "success" },
  { id: "AUD-91032", at: "Jun 28 08:30 UTC", actor: "Mariam Issah",    actorId: "STF-0008", role: "Support",    action: "Viewed user PII",                category: "data",   target: "USR-09701",    ip: "203.0.113.42", result: "success" },
  { id: "AUD-91029", at: "Jun 28 07:48 UTC", actor: "Engineering Bot", actorId: "BOT-CI",   role: "Engineer",   action: "Deployed release v8.2.4",        category: "system", target: "production",   ip: "10.0.0.1",     result: "success" },
  { id: "AUD-91024", at: "Jun 28 07:12 UTC", actor: "Tunde Aremu",     actorId: "STF-0011", role: "Finance",    action: "Attempted manual refund",        category: "money",  target: "ORD-527990",   ip: "203.0.113.42", result: "denied" },
  { id: "AUD-91020", at: "Jun 28 06:58 UTC", actor: "Funke Oladipo",   actorId: "STF-0014", role: "Compliance", action: "Filed SAR with NFIU",            category: "policy", target: "SAR-1038",     ip: "203.0.113.42", result: "success" },
  { id: "AUD-91015", at: "Jun 28 06:31 UTC", actor: "Mariam Issah",    actorId: "STF-0008", role: "Support",    action: "Login from new device",          category: "auth",   target: "STF-0008",     ip: "102.89.10.4",  result: "success" },
  { id: "AUD-91011", at: "Jun 28 05:44 UTC", actor: "unknown",         actorId: "—",        role: "System",     action: "Failed admin login (4x)",        category: "auth",   target: "STF-0008",     ip: "185.220.101.41",result:"denied" },
];

export const AUDIT_CAT_COLOR: Record<AuditEvent["category"], string> = {
  auth: T.info, money: T.success, user: "#7C3AED", policy: T.accent, data: T.warn, system: T.muted,
};

// ====================================================================
//  GDPR
// ====================================================================
export type GDPRType = "export" | "deletion" | "rectification" | "restriction";
export type GDPRStatus = "received" | "verified" | "processing" | "completed" | "rejected";
export type GDPRRequest = {
  id: string;
  user: string;
  userId: string;
  country: "NG" | "GH" | "KE" | "CN";
  type: GDPRType;
  reason: string;
  status: GDPRStatus;
  receivedAt: string;
  dueAt: string;
  daysLeft: number;
  handler?: string;
  artifacts: number;
};

export const GDPR: GDPRRequest[] = [
  { id: "GDR-880", user: "Adaeze Okafor", userId: "USR-10241", country: "NG", type: "export",      reason: "Wants full data archive (Art. 15)",         status: "processing", receivedAt: "3 days ago", dueAt: "Jul 28",  daysLeft: 27, handler: "Funke O.", artifacts: 0 },
  { id: "GDR-878", user: "Tolu Bankole",  userId: "USR-10182", country: "NG", type: "deletion",    reason: "Closing account — right to erasure",        status: "verified",   receivedAt: "5 days ago", dueAt: "Jul 30",  daysLeft: 29, handler: "Tunde A.", artifacts: 0 },
  { id: "GDR-875", user: "Kwame Asante",  userId: "USR-09812", country: "GH", type: "export",      reason: "Loan application — wants statements",       status: "completed",  receivedAt: "2 wks ago", dueAt: "Jul 12",  daysLeft: 0,  handler: "Funke O.", artifacts: 4 },
  { id: "GDR-871", user: "Mary Wanjiru",  userId: "USR-09410", country: "KE", type: "rectification",reason: "Update legal name after marriage",         status: "completed",  receivedAt: "3 wks ago", dueAt: "Jul 04",  daysLeft: 0,  handler: "Tunde A.", artifacts: 1 },
  { id: "GDR-868", user: "Ibrahim Yusuf", userId: "USR-09221", country: "NG", type: "deletion",    reason: "Erasure request",                           status: "rejected",   receivedAt: "1 wk ago",  dueAt: "—",       daysLeft: 0,  handler: "Funke O.", artifacts: 0 },
  { id: "GDR-864", user: "Femi Adeyemi",  userId: "USR-09584", country: "NG", type: "restriction", reason: "Dispute pending — restrict processing",     status: "received",   receivedAt: "yesterday", dueAt: "Aug 01",  daysLeft: 33, handler: undefined,   artifacts: 0 },
];

export const GDPR_STATUS_COLOR: Record<GDPRStatus, string> = {
  received: T.info, verified: T.warn, processing: T.accent, completed: T.success, rejected: T.danger,
};

// ====================================================================
//  Tiny helpers for tables
// ====================================================================
export function LinkId({ to, params, children, color }: { to: any; params: any; children: ReactNode; color?: string }) {
  return (
    <Link to={to} params={params} className="font-bold tabular-nums hover:underline" style={{ ...mono, color: color ?? T.ink }}>
      {children}
    </Link>
  );
}

export function MutedMono({ children }: { children: ReactNode }) {
  return <span className="tabular-nums text-[10.5px]" style={{ ...mono, color: T.muted }}>{children}</span>;
}
