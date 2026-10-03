import { api, fromMinor } from "./api";

/** Format minor (kobo) units as ₦ major. */
export function fmtNgn(minor: string | number | null | undefined) {
  const n = fromMinor(minor);
  return `₦${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function toNum(v: string | number | null | undefined) {
  if (v == null) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/** Sum of cash + digital float in minor units. */
export function floatTotalMinor(
  m: { float?: { cashMinor?: string | number | null; digitalMinor?: string | number | null } | null },
) {
  return toNum(m.float?.cashMinor) + toNum(m.float?.digitalMinor);
}

export function docLabel(kind: string) {
  const map: Record<string, string> = {
    CAC: "CAC certificate",
    GOV_ID: "Government ID",
    SHOP_PHOTO: "Shop photo",
    UTILITY: "Utility bill",
    cac: "CAC certificate",
    gov_id: "Government ID",
    shop_photo: "Shop photo",
    utility: "Utility bill",
  };
  return map[kind] ?? kind.replace(/_/g, " ");
}

export function kindLabel(kind: string) {
  const map: Record<string, string> = {
    CASH_OUT: "Cash out",
    CASH_IN: "Cash in",
    BILL: "Bill",
    TRANSFER: "Transfer",
    cash_out: "Cash out",
    cash_in: "Cash in",
    bill: "Bill",
    transfer: "Transfer",
  };
  return map[kind] ?? kind.replace(/_/g, " ");
}

// —— Types (API shapes; enums are UPPERCASE; BigInt → string) ——

export type MerchantStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
export type MerchantTier = "SILVER" | "GOLD" | "PLATINUM";

export type AdminMerchantFloat = {
  id: string;
  merchantId: string;
  cashMinor: string | number;
  digitalMinor: string | number;
  updatedAt?: string;
};

export type AdminMerchantDoc = {
  id: string;
  merchantId: string;
  kind: string;
  fileUrl: string;
  status: string;
  rejectReason?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  merchant?: {
    id: string;
    agentId: string;
    businessName: string;
    businessType?: string;
    status: string;
    createdAt: string;
  };
};

export type AdminMerchantListItem = {
  id: string;
  agentId: string;
  tag: string;
  businessName: string;
  businessType: string;
  category?: string;
  address: string;
  state: string;
  lga: string;
  phone: string;
  ownerName?: string;
  status: MerchantStatus | string;
  tier: MerchantTier | string;
  dailyLimit: number;
  premiumPartner: boolean;
  listedInDirectory?: boolean;
  unpaidEarningsMinor?: string | number;
  settlementBank?: string | null;
  settlementAccount?: string | null;
  createdAt: string;
  float?: AdminMerchantFloat | null;
  user?: { id: string; email?: string | null; phone?: string | null; name?: string | null };
};

export type AdminMerchantDetail = AdminMerchantListItem & {
  lat?: number | null;
  lng?: number | null;
  bvnLast4?: string | null;
  bvnVerified?: boolean;
  ninVerified?: boolean;
  settlementAccountName?: string | null;
  openHours?: unknown;
  documents?: AdminMerchantDoc[];
  staff?: { id: string; name: string; role: string; active: boolean; phone?: string }[];
  branches?: { id: string; name: string; address: string }[];
  settlements?: AdminMerchantSettlement[];
};

export type AdminMerchantOverview = {
  counts: { active: number; pending: number; suspended: number; closed: number };
  volumeMinor: string | number;
  txCount: number;
  platformFeeMinor: string | number;
  agentEarningsMinor: string | number;
  kybQueue: number;
  failedOrPendingTx: number;
  lowFloatAgents: number;
  topAgents: {
    id: string;
    agentId: string;
    businessName: string;
    tier: string;
    unpaidEarningsMinor: string | number;
  }[];
  since: string;
};

export type AdminMerchantTx = {
  id: string;
  ref: string;
  merchantId: string;
  kind: string;
  amountMinor: string | number;
  platformFeeMinor: string | number;
  agentFeeMinor: string | number;
  customerTotalMinor: string | number;
  counterparty?: string | null;
  counterpartyName?: string | null;
  billAccount?: string | null;
  token?: string | null;
  status: string;
  meta?: unknown;
  createdAt: string;
  merchant?: { agentId: string; businessName: string };
  biller?: { id: string; name: string; category?: string } | null;
  disputes?: AdminMerchantDispute[];
};

export type AdminMerchantDispute = {
  id: string;
  txRef?: string | null;
  merchantId: string;
  reason: string;
  status: string;
  assigneeId?: string | null;
  createdAt: string;
  merchant?: { agentId: string; businessName: string };
};

export type AdminMerchantSettlement = {
  id: string;
  merchantId: string;
  amountMinor: string | number;
  bank: string;
  accountLast4: string;
  batchDate: string;
  status: string;
  createdAt?: string;
  merchant?: { agentId: string; businessName: string };
};

export type AdminBankChange = {
  id: string;
  merchantId: string;
  oldBank?: string | null;
  oldAccount?: string | null;
  newBank: string;
  newAccount: string;
  newAccountName?: string | null;
  status: string;
  requestedAt: string;
  merchant?: { agentId: string; businessName: string };
};

export type AdminFloatAdjustment = {
  id: string;
  merchantId: string;
  amountMinor: string | number;
  reason: string;
  status: string;
  requestedById: string;
  approvedById?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  merchant?: { agentId: string; businessName: string };
  requestedBy?: { id: string; name?: string | null; email?: string | null };
  approvedBy?: { id: string; name?: string | null; email?: string | null } | null;
};

export type AdminMerchantFeeRule = {
  id: string;
  service: string;
  minAmount: number;
  maxAmount?: number | null;
  feeType: string;
  value: number;
  tier?: string | null;
  effectiveFrom: string;
  version: number;
};

export type AdminMerchantTierRule = {
  id: string;
  tier: MerchantTier | string;
  monthlyVolumeThreshold: string | number;
  dailyLimitMinor: number;
  singleLimitMinor: number;
};

export type AdminBillerPlan = {
  id: string;
  billerId: string;
  name: string;
  priceMinor: number;
  sort: number;
};

export type AdminBiller = {
  id: string;
  category: string;
  name: string;
  logoUrl?: string | null;
  brandColor: string;
  enabled: boolean;
  sort: number;
  plans: AdminBillerPlan[];
};

export type AdminDirectoryRow = {
  id: string;
  agentId: string;
  tag: string;
  businessName: string;
  address: string;
  state: string;
  lga: string;
  lat?: number | null;
  lng?: number | null;
  listedInDirectory: boolean;
  premiumPartner: boolean;
  openHours?: unknown;
};

export type AdminMerchantReferral = {
  id: string;
  referrerId: string;
  referredId: string;
  rewardMinor: string | number;
  status: string;
  createdAt: string;
  referrer?: { agentId: string; businessName: string };
  referred?: { agentId: string; businessName: string; status?: string };
};

export type AdminMerchantReports = {
  days: number;
  byService: Record<
    string,
    { count: number; volume: string; platformFee: string; agentFee: string }
  >;
  byState: { state: string | null; _count: { id: number } }[];
  totalTx: number;
};

export type AdminMerchantAudit = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  meta?: unknown;
  actorId?: string | null;
  actor?: { id: string; name?: string | null; email?: string | null } | null;
};

function qs(params: Record<string, string | undefined | null>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "" && v !== "all") sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// —— Overview / list / detail ——

export async function fetchMerchantOverview(since?: string) {
  return api<AdminMerchantOverview>(`/admin/merchants/overview${qs({ since })}`);
}

export async function fetchMerchants(opts?: { status?: string; q?: string; tier?: string; state?: string }) {
  return api<AdminMerchantListItem[]>(
    `/admin/merchants${qs({
      status: opts?.status?.toUpperCase(),
      q: opts?.q,
      tier: opts?.tier?.toUpperCase(),
      state: opts?.state,
    })}`,
  );
}

export async function fetchMerchant(id: string) {
  return api<AdminMerchantDetail>(`/admin/merchants/${encodeURIComponent(id)}`);
}

export async function patchMerchant(
  id: string,
  body: {
    status?: MerchantStatus;
    tier?: MerchantTier;
    dailyLimit?: number;
    premiumPartner?: boolean;
    listedInDirectory?: boolean;
    reason?: string;
  },
) {
  return api<AdminMerchantDetail>(`/admin/merchants/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function approveMerchant(id: string) {
  return api<AdminMerchantDetail>(`/admin/merchants/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    body: "{}",
  });
}

// —— KYB ——

export async function fetchMerchantKybQueue() {
  return api<AdminMerchantDoc[]>("/admin/merchants/kyb");
}

export async function decideMerchantKybDoc(
  docId: string,
  status: "APPROVED" | "REJECTED",
  rejectReason?: string,
) {
  return api<AdminMerchantDoc>(`/admin/merchants/kyb/${encodeURIComponent(docId)}/decide`, {
    method: "POST",
    body: JSON.stringify({ status, rejectReason }),
  });
}

// —— Transactions ——

export async function fetchMerchantTransactions(opts?: {
  kind?: string;
  status?: string;
  merchantId?: string;
}) {
  return api<AdminMerchantTx[]>(
    `/admin/merchants/transactions${qs({
      kind: opts?.kind?.toUpperCase(),
      status: opts?.status?.toUpperCase(),
      merchantId: opts?.merchantId,
    })}`,
  );
}

export async function fetchMerchantTransaction(ref: string) {
  return api<AdminMerchantTx>(`/admin/merchants/transactions/${encodeURIComponent(ref)}`);
}

export async function reverseMerchantTransaction(ref: string, reason: string, approverId?: string) {
  return api<AdminMerchantTx>(`/admin/merchants/transactions/${encodeURIComponent(ref)}/reverse`, {
    method: "POST",
    body: JSON.stringify({ reason, approverId }),
  });
}

// —— Disputes ——

export async function fetchMerchantDisputes() {
  return api<AdminMerchantDispute[]>("/admin/merchants/disputes");
}

export async function createMerchantDispute(body: {
  merchantId: string;
  txRef?: string | null;
  reason: string;
  assigneeId?: string | null;
}) {
  return api<AdminMerchantDispute>("/admin/merchants/disputes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// —— Settlements ——

export async function fetchMerchantSettlements(status?: string) {
  return api<AdminMerchantSettlement[]>(
    `/admin/merchants/settlements${qs({ status: status?.toUpperCase() })}`,
  );
}

export async function retryMerchantSettlement(id: string) {
  return api<AdminMerchantSettlement>(`/admin/merchants/settlements/${encodeURIComponent(id)}/retry`, {
    method: "POST",
    body: "{}",
  });
}

export async function holdMerchantSettlement(id: string) {
  return api<AdminMerchantSettlement>(`/admin/merchants/settlements/${encodeURIComponent(id)}/hold`, {
    method: "POST",
    body: "{}",
  });
}

export async function fetchMerchantBankChanges() {
  return api<AdminBankChange[]>("/admin/merchants/bank-changes");
}

export async function decideMerchantBankChange(id: string, status: "APPROVED" | "DENIED") {
  return api<AdminBankChange>(`/admin/merchants/bank-changes/${encodeURIComponent(id)}/decide`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

// —— Float ——

export async function fetchFloatAdjustments() {
  return api<AdminFloatAdjustment[]>("/admin/merchants/float-adjustments");
}

export async function requestFloatAdjustment(body: {
  merchantId: string;
  amountMinor: number | string;
  reason: string;
}) {
  return api<AdminFloatAdjustment>("/admin/merchants/float-adjustments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function decideFloatAdjustment(id: string, status: "APPROVED" | "DENIED") {
  return api<AdminFloatAdjustment>(
    `/admin/merchants/float-adjustments/${encodeURIComponent(id)}/decide`,
    { method: "POST", body: JSON.stringify({ status }) },
  );
}

// —— Fees / tiers ——

export async function fetchMerchantFees() {
  return api<AdminMerchantFeeRule[]>("/admin/merchants/fees");
}

export async function createMerchantFee(body: {
  service: string;
  minAmount?: number;
  maxAmount?: number | null;
  feeType: "percent" | "flat";
  value: number;
  tier?: string | null;
  version?: number;
}) {
  return api<AdminMerchantFeeRule>("/admin/merchants/fees", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchMerchantTiers() {
  return api<AdminMerchantTierRule[]>("/admin/merchants/tiers");
}

export async function upsertMerchantTier(body: {
  tier: MerchantTier;
  monthlyVolumeThreshold: number | string;
  dailyLimitMinor: number;
  singleLimitMinor: number;
}) {
  return api<AdminMerchantTierRule>("/admin/merchants/tiers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// —— Billers ——

export async function fetchMerchantBillers() {
  return api<AdminBiller[]>("/admin/merchants/billers");
}

export async function createMerchantBiller(body: {
  category: "AIRTIME" | "DATA" | "POWER" | "CABLE";
  name: string;
  logoUrl?: string | null;
  brandColor?: string;
  enabled?: boolean;
  sort?: number;
}) {
  return api<AdminBiller>("/admin/merchants/billers", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchMerchantBiller(
  id: string,
  body: {
    name?: string;
    logoUrl?: string | null;
    brandColor?: string;
    enabled?: boolean;
    sort?: number;
  },
) {
  return api<AdminBiller>(`/admin/merchants/billers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function createBillerPlan(
  billerId: string,
  body: { name: string; priceMinor: number; sort?: number },
) {
  return api<AdminBillerPlan>(`/admin/merchants/billers/${encodeURIComponent(billerId)}/plans`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// —— Directory ——

export async function fetchMerchantDirectory(q?: string) {
  return api<AdminDirectoryRow[]>(`/admin/merchants/directory${qs({ q })}`);
}

export async function patchMerchantDirectory(
  id: string,
  body: {
    listedInDirectory?: boolean;
    premiumPartner?: boolean;
    lat?: number | null;
    lng?: number | null;
    openHours?: unknown;
    address?: string;
  },
) {
  return api(`/admin/merchants/directory/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// —— Referrals / broadcasts / reports / audit ——

export async function fetchMerchantReferrals() {
  return api<AdminMerchantReferral[]>("/admin/merchants/referrals");
}

export async function payoutMerchantReferral(id: string) {
  return api<AdminMerchantReferral>(`/admin/merchants/referrals/${encodeURIComponent(id)}/payout`, {
    method: "POST",
    body: "{}",
  });
}

export async function sendMerchantBroadcast(body: {
  title: string;
  body?: string;
  href?: string | null;
  tier?: MerchantTier;
  state?: string;
  status?: MerchantStatus;
  channels?: Array<"push" | "sms">;
}) {
  return api<{ sent: number; channels: string[] }>("/admin/merchants/broadcasts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type AdminMerchantBroadcast = {
  id: string;
  title: string;
  body: string;
  sent: number;
  channels: string[];
  tier?: string | null;
  state?: string | null;
  createdAt: string;
};

export async function fetchMerchantBroadcasts() {
  return api<AdminMerchantBroadcast[]>("/admin/merchants/broadcasts");
}

export async function fetchMerchantReferralConfig() {
  return api<{ rewardMinor: number }>("/admin/merchants/referral-config");
}

export async function updateMerchantReferralConfig(rewardMinor: number) {
  return api<{ rewardMinor: number }>("/admin/merchants/referral-config", {
    method: "PUT",
    body: JSON.stringify({ rewardMinor }),
  });
}

export async function fetchMerchantReports(days?: number) {
  return api<AdminMerchantReports>(`/admin/merchants/reports${qs({ days: days != null ? String(days) : undefined })}`);
}

export async function fetchMerchantAudit() {
  return api<AdminMerchantAudit[]>("/admin/merchants/audit");
}

export async function patchMerchantDispute(
  id: string,
  body: { status?: string; assigneeId?: string | null; note?: string },
) {
  return api(`/admin/merchants/disputes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchMerchantNotes(id: string) {
  return api<{ id: string; meta?: { note?: string }; createdAt: string; actorId?: string | null }[]>(
    `/admin/merchants/${encodeURIComponent(id)}/notes`,
  );
}

export async function addMerchantNote(id: string, note: string) {
  return api(`/admin/merchants/${encodeURIComponent(id)}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export async function forceMerchantPasscodeReset(id: string) {
  return api(`/admin/merchants/${encodeURIComponent(id)}/force-passcode-reset`, {
    method: "POST",
    body: "{}",
  });
}

export async function logoutMerchantSessions(id: string) {
  return api<{ cleared: number }>(`/admin/merchants/${encodeURIComponent(id)}/logout-sessions`, {
    method: "POST",
    body: "{}",
  });
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
