const API_URL = import.meta.env.VITE_API_URL ?? "https://magnetpay.amctraders.online";

const TOKEN_KEY = "mp.admin.accessToken";
const USER_KEY = "mp.admin.user";

export function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, user?: unknown) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function api<T>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (json as { error?: { message: string } }).error ?? {
      message: res.statusText || "Request failed",
    };
    throw Object.assign(new Error(err.message), err);
  }
  return (json as { data: T }).data;
}

export async function adminLogin(emailOrPhone: string, passcode: string) {
  let phone = emailOrPhone.trim();
  if (phone.includes("@")) {
    phone = "+2348000000001";
  } else if (!phone.startsWith("+")) {
    phone = `+${phone.replace(/\D/g, "")}`;
  }
  const data = await api<{ accessToken: string; user: { platformRole?: string; name: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ phone, passcode }),
      auth: false,
    },
  );
  if (data.user.platformRole !== "ADMIN" && data.user.platformRole !== "SUPER_ADMIN") {
    throw new Error("Not an admin account");
  }
  setSession(data.accessToken, data.user);
  return data;
}

// —— Types ——
export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: string;
  platformRole: string;
  createdAt: string;
  wallets?: { currency: string; balanceMinor: string | number; holdMinor?: string | number }[];
  kycApplications?: { status: string; type: string }[];
  businessProfile?: { status: string; companyName: string } | null;
};

export type AdminKycRow = {
  id: string;
  status: string;
  type: string;
  tier?: number;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; phone: string; email?: string | null };
};

export type AdminKybRow = {
  id: string;
  status: string;
  companyName: string;
  licenseNo?: string | null;
  documents?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; phone: string; email?: string | null };
};

export type AdminWallet = {
  id: string;
  currency: string;
  balanceMinor: string | number;
  holdMinor: string | number;
  user: { id: string; name: string; phone: string };
};

export type AdminTransfer = {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  createdAt: string;
  nombaRef?: string | null;
  sender?: { id: string; name: string; phone: string };
  recipient?: { name: string; accountHint?: string; rail?: string };
};

export type AdminEscrow = {
  id: string;
  status: string;
  currency: string;
  amountMinor: string | number;
  title?: string;
  createdAt: string;
  milestones?: unknown[];
  disputes?: { id: string; outcome?: string | null }[];
  buyer?: { id: string; name: string; phone: string };
  seller?: { id: string; name: string; phone: string };
};

export type AdminShipmentDocument = {
  id: string;
  kind: string;
  name: string;
  url: string;
  createdAt: string;
};

export type ShipmentCostLine = { label: string; amountMinor: number | string };

export type AdminShipment = {
  id: string;
  ref?: string;
  route?: string;
  status: string;
  mode?: string;
  createdAt: string;
  user?: { id: string; name: string; phone: string };
  events?: { id?: string; status?: string; message?: string; createdAt?: string; [k: string]: unknown }[];
  documents?: AdminShipmentDocument[];
  hold?: { lockedMinor?: string | number; currency?: string } | null;
  settlement?: {
    finalMinor?: string | number;
    cashbackMinor?: string | number;
    topUpMinor?: string | number;
    currency?: string;
    breakdown?: ShipmentCostLine[] | null;
    notes?: string | null;
  } | null;
  quote?: unknown;
};

export type AdminFreightPricing = {
  id: string;
  airBaseMinor: number;
  seaBaseMinor: number;
  expressBaseMinor: number;
  consolidatedBaseMinor: number;
  cbmMultiplier: number;
  weightMultiplier: number;
  updatedAt: string;
};

export type AdminComplianceLimits = {
  id: string;
  unverifiedNgnDailyCapMinor: number;
  ngnTier1DailyCapMinor: number;
  ngnTier2DailyCapMinor: number;
  cnyDailyCapMinor: number;
  minTierDeposit: number;
  minTierWithdraw: number;
  minTierCrossBorder: number;
  minTierMarketCheckout: number;
  minTierLogistics: number;
  allowBasicWhilePending: boolean;
  updatedAt: string;
};

export type AdminLogisticsPartner = {
  id: string;
  name: string;
  code: string;
  kind: "FREIGHT_FORWARDER" | "WAREHOUSE" | "CUSTOMS_BROKER" | "LAST_MILE";
  modes: string[];
  active: boolean;
  rating?: number | null;
  serviceLabel?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDispute = {
  id: string;
  escrowId: string;
  reason: string;
  outcome?: string | null;
  evidence?: unknown;
  createdAt: string;
  updatedAt?: string;
  escrow?: AdminEscrow | null;
  openedBy?: { id: string; name: string; phone: string };
};

export type AdminFxConversion = {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromMinor: string | number;
  toMinor: string | number;
  rateApplied: string | number;
  createdAt: string;
  user?: { id: string; name: string; phone: string };
};

export type AdminAnalytics = {
  users: number;
  transfers: number;
  escrows: number;
  orders: number;
  shipments: number;
  wallets?: { balanceMinorSum?: string | number; holdMinorSum?: string | number };
};

export type AdminConversation = {
  id: string;
  subject?: string | null;
  createdAt: string;
  updatedAt: string;
  participants?: { user: { id: string; name: string; phone: string } }[];
  messages?: { id: string; body: string; createdAt: string; senderId?: string }[];
};

export type AdminAnnouncement = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  meta?: { title?: string; body?: string; audience?: string } | null;
  actorId?: string | null;
};

export type AdminFee = { id: string; key: string; value: string | number; label?: string | null };
export type AdminAudit = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
  meta?: unknown;
};

export function fromMinor(v: string | number | undefined | null) {
  if (v == null) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n / 100 : 0;
}

export function fmtMoney(currency: string, minor: string | number | undefined | null) {
  const n = fromMinor(minor);
  const sym = currency === "NGN" ? "₦" : currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
  return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// —— Users / KYC / KYB ——
export async function fetchAdminUsers() {
  return api<AdminUser[]>("/admin/users");
}
export async function fetchAdminUser(id: string) {
  return api<AdminUser>(`/admin/users/${id}`);
}
export async function patchAdminUser(id: string, body: Record<string, unknown>) {
  return api(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export async function inviteAdminUser(phone: string, role = "BUYER") {
  return api("/admin/users/invite", { method: "POST", body: JSON.stringify({ phone, role }) });
}

export async function fetchAdminKyc(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<AdminKycRow[]>(`/admin/kyc${q}`);
}
export async function fetchAdminKycById(id: string) {
  return api<AdminKycRow>(`/admin/kyc/${id}`);
}
export async function decideKyc(id: string, status: "APPROVED" | "REJECTED", note?: string) {
  return api(`/admin/kyc/${id}/decide`, { method: "POST", body: JSON.stringify({ status, note }) });
}
export async function fetchAdminKyb(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<AdminKybRow[]>(`/admin/kyb${q}`);
}
export async function fetchAdminKybById(id: string) {
  return api<AdminKybRow>(`/admin/kyb/${id}`);
}
export async function decideKyb(id: string, status: "APPROVED" | "REJECTED", note?: string) {
  return api(`/admin/kyb/${id}/decide`, { method: "POST", body: JSON.stringify({ status, note }) });
}

// —— Money ——
export async function fetchAdminWallets() {
  return api<AdminWallet[]>("/admin/wallets");
}
export async function fetchAdminTransfers() {
  return api<AdminTransfer[]>("/admin/transfers");
}

/** Download transfers CSV (authenticated). Triggers browser save. */
export async function downloadTransfersCsv() {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/admin/export/transfers.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg =
      (json as { error?: { message?: string } }).error?.message || res.statusText || "Export failed";
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `magnetpay-transfers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
export async function fetchAdminDeposits() {
  return api<unknown[]>("/admin/deposits");
}
export async function fetchAdminDeposit(id: string) {
  return api<unknown>(`/admin/deposits/${id}`);
}
export async function fetchAdminWithdrawals() {
  return api<{ id: string; status: string; currency: string; amountMinor: string | number; createdAt: string; user?: AdminUser }[]>(
    "/admin/withdrawals",
  );
}
export async function decideWithdrawal(id: string, status: "APPROVED" | "REJECTED") {
  return api(`/admin/withdrawals/${id}/decide`, { method: "POST", body: JSON.stringify({ status }) });
}
export async function fetchAdminRecipients() {
  return api<unknown[]>("/admin/recipients");
}
export async function fetchAdminLedger() {
  return api<unknown[]>("/admin/ledger");
}

// —— Escrow / shipments ——
export async function fetchAdminEscrows() {
  return api<AdminEscrow[]>("/admin/escrows");
}
export async function fetchAdminEscrow(id: string) {
  return api<AdminEscrow>(`/admin/escrows/${id}`);
}
export async function resolveEscrow(id: string, outcome: string) {
  return api(`/admin/escrows/${id}/resolve`, { method: "POST", body: JSON.stringify({ outcome }) });
}
export async function fetchAdminDisputes() {
  return api<AdminDispute[]>("/admin/disputes");
}
export async function fetchAdminShipments() {
  return api<AdminShipment[]>("/admin/shipments");
}
export async function fetchAdminShipment(id: string) {
  return api<AdminShipment>(`/admin/shipments/${id}`);
}
export async function advanceAdminShipment(
  id: string,
  body: { status?: string; message?: string; skipPodCheck?: boolean } = {},
) {
  return api<AdminShipment>(`/admin/shipments/${id}/advance`, { method: "POST", body: JSON.stringify(body) });
}
export function resolveApiFileUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const base = API_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function uploadAdminFile(filename: string, contentBase64: string, mimeType?: string) {
  return api<{ url: string; name: string; mimeType?: string }>("/uploads", {
    method: "POST",
    body: JSON.stringify({ filename, contentBase64, mimeType }),
  });
}

export async function fetchAdminShipmentDocumentKinds() {
  return api<string[]>("/admin/logistics/document-kinds");
}

export async function addAdminShipmentDocument(
  shipmentId: string,
  body: { kind: string; name: string; url: string; note?: string },
) {
  return api<AdminShipmentDocument>(`/admin/shipments/${shipmentId}/documents`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminShipmentDocument(shipmentId: string, docId: string) {
  return api<{ ok: boolean }>(`/admin/shipments/${shipmentId}/documents/${docId}`, { method: "DELETE" });
}

export async function settleAdminShipment(
  id: string,
  payload: { finalMinor?: number; breakdown?: ShipmentCostLine[]; notes?: string },
) {
  return api<{ shipment: AdminShipment; settlement: NonNullable<AdminShipment["settlement"]> }>(
    `/admin/shipments/${id}/settle`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function fetchAdminFreightPricing() {
  return api<AdminFreightPricing>("/admin/logistics/pricing");
}
export async function putAdminFreightPricing(body: Omit<AdminFreightPricing, "id" | "updatedAt">) {
  return api<AdminFreightPricing>("/admin/logistics/pricing", { method: "PUT", body: JSON.stringify(body) });
}
export async function previewAdminFreightQuote(body: { cbm: number; weightKg: number; mode: string }) {
  return api<{ estimatedMinor: string | number; formula: string }>("/admin/logistics/pricing/preview", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
export async function fetchAdminLogisticsPartners() {
  return api<AdminLogisticsPartner[]>("/admin/logistics/partners");
}
export async function fetchAdminLogisticsPartner(id: string) {
  return api<AdminLogisticsPartner>(`/admin/logistics/partners/${id}`);
}
export async function createAdminLogisticsPartner(body: Partial<AdminLogisticsPartner> & { name: string; code: string; modes: string[] }) {
  return api<AdminLogisticsPartner>("/admin/logistics/partners", { method: "POST", body: JSON.stringify(body) });
}
export async function patchAdminLogisticsPartner(id: string, body: Partial<AdminLogisticsPartner>) {
  return api<AdminLogisticsPartner>(`/admin/logistics/partners/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function fetchAdminComplianceLimits() {
  return api<AdminComplianceLimits>("/admin/compliance/limits");
}

export async function putAdminComplianceLimits(body: Omit<AdminComplianceLimits, "id" | "updatedAt">) {
  return api<AdminComplianceLimits>("/admin/compliance/limits", { method: "PUT", body: JSON.stringify(body) });
}

// —— Market ——
export async function fetchAdminOrders() {
  return api<unknown[]>("/admin/orders");
}
export async function fetchAdminOrder(id: string) {
  return api<unknown>(`/admin/orders/${id}`);
}
export async function cancelAdminOrder(id: string) {
  return api(`/admin/orders/${id}/cancel`, { method: "POST", body: "{}" });
}
export async function fetchAdminProducts() {
  return api<unknown[]>("/admin/products");
}
export async function moderateProduct(id: string, status: "APPROVED" | "HIDDEN" | "REJECTED") {
  return api(`/admin/products/${id}/moderate`, { method: "POST", body: JSON.stringify({ status }) });
}
export async function fetchAdminCategories() {
  return api<unknown[]>("/admin/categories");
}
export async function createAdminCategory(body: Record<string, unknown>) {
  return api("/admin/categories", { method: "POST", body: JSON.stringify(body) });
}
export async function patchAdminCategory(id: string, body: Record<string, unknown>) {
  return api(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export type AdminSeller = {
  id: string;
  name: string;
  description?: string | null;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  verified: boolean;
  createdAt: string;
  user?: { id: string; name: string; phone: string; email?: string | null };
  products?: {
    id: string;
    title: string;
    priceMinor: string | number;
    currency: string;
    rating?: number;
    stock?: number | null;
    active: boolean;
    createdAt: string;
  }[];
  _count?: { products: number; members?: number };
};

export async function fetchAdminSellers() {
  return api<AdminSeller[]>("/admin/sellers");
}

export async function fetchAdminSeller(id: string) {
  return api<AdminSeller>(`/admin/sellers/${id}`);
}

export async function patchAdminSeller(id: string, body: { verified?: boolean; name?: string; description?: string }) {
  return api<AdminSeller>(`/admin/sellers/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export type AdminRecord = {
  id: string;
  domain: string;
  externalId?: string | null;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminRecords(domain: string, status?: string) {
  const q = status ? `?domain=${encodeURIComponent(domain)}&status=${encodeURIComponent(status)}` : `?domain=${encodeURIComponent(domain)}`;
  return api<AdminRecord[]>(`/admin/records${q}`);
}

export async function fetchAdminRecord(id: string) {
  return api<AdminRecord>(`/admin/records/${id}`);
}

export async function patchAdminRecord(id: string, body: Partial<Pick<AdminRecord, "title" | "subtitle" | "status" | "payload">>) {
  return api<AdminRecord>(`/admin/records/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
export async function fetchAdminReviews() {
  return api<unknown[]>("/admin/reviews");
}

// —— FX / fees / audit / analytics ——
export async function fetchAdminFees() {
  return api<AdminFee[]>("/admin/fees");
}
export async function putAdminFees(rows: { key: string; value: string | number; label?: string }[]) {
  return api("/admin/fees", { method: "PUT", body: JSON.stringify({ fees: rows }) });
}
export async function fetchAdminFxRates() {
  return api<AdminFee[]>("/admin/fx/rates");
}
export async function putAdminFxRates(rates: { key: string; value: string | number }[]) {
  return api("/admin/fx/rates", { method: "PUT", body: JSON.stringify({ rates }) });
}
export async function fetchAdminFxConversions() {
  return api<AdminFxConversion[]>("/admin/fx/conversions");
}
export async function fetchAdminAudit() {
  return api<AdminAudit[]>("/admin/audit");
}
export async function fetchAdminAnalytics() {
  return api<AdminAnalytics>("/admin/analytics/overview");
}
export async function fetchAdminHealth() {
  return api<{ ok: boolean; time: string }>("/admin/health");
}
export async function fetchAdminAnnouncements() {
  return api<AdminAnnouncement[]>("/admin/announcements");
}
export async function createAdminAnnouncement(title: string, body: string) {
  return api("/admin/announcements", { method: "POST", body: JSON.stringify({ title, body }) });
}
export async function fetchAdminConversations() {
  return api<AdminConversation[]>("/admin/conversations").catch(() => []);
}
