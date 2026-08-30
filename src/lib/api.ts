import { clearSession, getAccessToken, setSession } from "./session";

export { clearSession, getAccessToken, setSession, getSessionUser } from "./session";

const API_URL = import.meta.env.VITE_API_URL ?? "https://magnetpay.amctraders.online";

export async function api<T>(path: string, opts: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  } catch {
    throw new Error(`Could not reach MagnetPay API at ${API_URL}`);
  }
  let json: unknown = {};
  try {
    json = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(res.status === 401 ? "Sign in required" : res.statusText || "Request failed");
    }
  }
  if (!res.ok) {
    const err = (json as { error?: { message: string } }).error ?? {
      message: res.status === 401 ? "Sign in required" : res.statusText || "Request failed",
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
  quote?: { estimatedMinor?: string | number } | null;
  marketOrder?: { id: string; status: string; tracking?: string | null; supplier?: string; escrowId?: string | null } | null;
};

export type AdminParcelType = {
  id: string;
  code: string;
  name: string;
  baseMinor: number;
  ratePerKgMinor: number;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminLogisticsEstimateConfig = {
  id: string;
  usdNgnEstimateRate: number;
  estimateDisclaimer: string;
  updatedAt: string;
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

export type AdminLogisticsPartnerRate = {
  id: string;
  partnerId: string;
  parcelTypeId?: string | null;
  mode: "AIR" | "SEA" | "EXPRESS" | "CONSOLIDATED";
  baseSurchargeMinor: number;
  rateMultiplierBps: number;
  etaLabel: string;
  badgeLabel?: string | null;
  includes?: string[];
  ecoFriendly: boolean;
  active: boolean;
  sortOrder: number;
  parcelType?: { id: string; code: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
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
  rates?: AdminLogisticsPartnerRate[];
  createdAt: string;
  updatedAt: string;
};

export type AdminDispute = {
  id: string;
  escrowId: string;
  reason: string;
  status?: string;
  priority?: string;
  outcome?: string | null;
  evidence?: unknown;
  createdAt: string;
  updatedAt?: string;
  escrow?: AdminEscrow | null;
  openedBy?: { id: string; name: string; phone: string };
  assignee?: { id: string; name: string; phone: string } | null;
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
  users30d?: number;
  signups7d?: number;
  signups24h?: number;
  signupsToday?: number;
  activeBuyers30d?: number;
  transfers: number;
  escrows: number;
  orders: number;
  orders30d?: number;
  shipments: number;
  shipmentsInTransit?: number;
  delivered30d?: number;
  disputesOpen?: number;
  disputesOpenPrev?: number;
  listingsLive?: number;
  verifiedStores?: number;
  fxOrders24h?: number;
  fxVolume24h?: number;
  fxVolumePrev24h?: number;
  kycPending?: number;
  kycOverSla?: number;
  gmv30d?: number;
  gmv24h?: number;
  gmvPrev24h?: number;
  takeRate?: number;
  disputeRate?: number;
  wallets?: { balanceMinorSum?: string | number; holdMinorSum?: string | number };
  sparklines?: {
    gmv?: { label: string; value: number }[];
    signups?: { label: string; value: number }[];
    disputes?: { label: string; value: number }[];
    fx?: { label: string; value: number }[];
  };
  alerts?: {
    id: string;
    severity: "critical" | "high" | "medium";
    title: string;
    detail: string;
    href: string;
  }[];
  liveActivity?: { id: string; at: string; text: string; tone: "success" | "danger" | "info" }[];
};

export type AdminProductStats = {
  views30d: number;
  orders30d: number;
  conversionRate: number;
  rating: number | null;
};

export type AdminBrand = {
  id: string;
  name: string;
  status: string;
  country: string;
  _count?: { products: number };
};

export type AdminOrderStats = {
  count: number;
  valueMinor: string | number;
  avgMinor: string | number;
  oldest: string | null;
};

export type AdminRecordRow = {
  id: string;
  domain: string;
  externalId?: string | null;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
export async function openAdminChatWithUser(userId: string) {
  return api<{ conversationId: string; created: boolean }>(`/admin/users/${userId}/open-chat`, { method: "POST" });
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

export async function downloadOrdersCsv() {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/admin/export/orders.csv`, {
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
  a.download = `magnetpay-orders-${new Date().toISOString().slice(0, 10)}.csv`;
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
  body: { status?: string; message?: string; skipSellerShipCheck?: boolean } = {},
) {
  return api<AdminShipment>(`/admin/shipments/${id}/advance`, { method: "POST", body: JSON.stringify(body) });
}

export async function markAdminOrderShipped(
  orderId: string,
  body: { tracking?: string; carrier?: string; note?: string } = {},
) {
  return api(`/admin/orders/${orderId}/mark-shipped`, { method: "POST", body: JSON.stringify(body) });
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

export async function fetchAdminLogisticsEstimateConfig() {
  return api<AdminLogisticsEstimateConfig>("/admin/logistics/estimate-config");
}

export async function putAdminLogisticsEstimateConfig(body: {
  usdNgnEstimateRate: number;
  estimateDisclaimer: string;
}) {
  return api<AdminLogisticsEstimateConfig>("/admin/logistics/estimate-config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function fetchAdminParcelTypes() {
  return api<AdminParcelType[]>("/admin/logistics/parcel-types");
}

export async function createAdminParcelType(body: Omit<AdminParcelType, "id" | "createdAt" | "updatedAt">) {
  return api<AdminParcelType>("/admin/logistics/parcel-types", { method: "POST", body: JSON.stringify(body) });
}

export async function patchAdminParcelType(id: string, body: Partial<Omit<AdminParcelType, "id" | "code" | "createdAt" | "updatedAt">>) {
  return api<AdminParcelType>(`/admin/logistics/parcel-types/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function previewAdminParcelEstimate(body: { parcelTypeId: string; weightKg: number; declaredUsd?: number }) {
  return api<{ estimatedMinor: string | number; formula: string; baseMinor: string | number; weightChargeMinor: string | number }>(
    "/admin/logistics/parcel-types/preview",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function fetchAdminShipmentFlow() {
  return api<{ next: Record<string, string>; parcelTypes: AdminParcelType[]; estimateConfig: AdminLogisticsEstimateConfig }>(
    "/admin/logistics/shipment-flow",
  );
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

export async function fetchAdminPartnerRates(partnerId: string) {
  return api<AdminLogisticsPartnerRate[]>(`/admin/logistics/partners/${partnerId}/rates`);
}

export async function createAdminPartnerRate(
  partnerId: string,
  body: {
    parcelTypeId?: string | null;
    mode?: AdminLogisticsPartnerRate["mode"];
    baseSurchargeMinor?: number;
    rateMultiplierBps?: number;
    etaLabel?: string;
    badgeLabel?: string | null;
    includes?: string[];
    ecoFriendly?: boolean;
    active?: boolean;
    sortOrder?: number;
  },
) {
  return api<AdminLogisticsPartnerRate>(`/admin/logistics/partners/${partnerId}/rates`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function patchAdminPartnerRate(
  partnerId: string,
  rateId: string,
  body: Partial<Omit<AdminLogisticsPartnerRate, "id" | "partnerId" | "parcelType" | "createdAt" | "updatedAt">>,
) {
  return api<AdminLogisticsPartnerRate>(`/admin/logistics/partners/${partnerId}/rates/${rateId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminPartnerRate(partnerId: string, rateId: string) {
  return api(`/admin/logistics/partners/${partnerId}/rates/${rateId}`, { method: "DELETE" });
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

export type AdminProduct = {
  id: string;
  title: string;
  description?: string | null;
  priceMinor: string | number;
  currency: string;
  imageUrl?: string | null;
  moq?: string;
  rating?: number;
  stock?: number | null;
  active: boolean;
  moderationStatus?: string;
  flagReason?: string | null;
  updatedAt?: string;
  brand?: { id: string; name: string; status?: string; country?: string } | null;
  cbmPerUnit?: number | null;
  weightKgPerUnit?: number | null;
  originHub?: string | null;
  leadTimeMin?: number | null;
  leadTimeMax?: number | null;
  packagingType?: string | null;
  defaultIncoterm?: string | null;
  variantAxes?: unknown;
  pricingTiers?: unknown;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    verified?: boolean;
    user?: { id: string; name: string; phone: string; email?: string | null };
  };
  category?: { id: string; name: string; slug?: string } | null;
  media?: { id: string; url: string; sortOrder: number }[];
  variants?: {
    id: string;
    sku?: string | null;
    options?: unknown;
    priceMinor: string | number;
    stock?: number | null;
    imageUrl?: string | null;
    active: boolean;
  }[];
  reviews?: {
    id: string;
    rating: number;
    comment?: string | null;
    body?: string | null;
    createdAt: string;
    user?: { id: string; name: string };
  }[];
  _count?: { orderItems: number; reviews: number };
};

export async function fetchAdminProduct(id: string) {
  return api<AdminProduct>(`/admin/products/${id}`);
}

export async function fetchAdminProductStats(id: string) {
  return api<AdminProductStats>(`/admin/products/${id}/stats`);
}

export async function fetchAdminBrands() {
  return api<AdminBrand[]>("/admin/brands");
}

export async function fetchAdminOrderStats(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return api<AdminOrderStats>(`/admin/orders/stats${q}`);
}

export async function fetchAdminOrderNotes(orderId: string) {
  return api<{ id: string; body: string; createdAt: string; author?: { name: string } }[]>(`/admin/orders/${orderId}/notes`);
}

export async function postAdminOrderNote(orderId: string, body: string) {
  return api(`/admin/orders/${orderId}/notes`, { method: "POST", body: JSON.stringify({ body }) });
}

export async function refundAdminOrder(orderId: string, reason?: string) {
  return api(`/admin/orders/${orderId}/refund`, { method: "POST", body: JSON.stringify({ reason }) });
}

export async function fetchAdminSellerStats(id: string) {
  return api<{ tier: string; products: number; orders: number; disputes: number; gmvMinor: string | number; verified: boolean }>(
    `/admin/sellers/${id}/stats`,
  );
}

export async function fetchAdminDispute(id: string) {
  return api<AdminDispute>(`/admin/disputes/${id}`);
}

export async function patchAdminDispute(id: string, body: Record<string, unknown>) {
  return api(`/admin/disputes/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function fetchAdminAnalyticsGmv() {
  return api<{ gmv30d: number; series: { label: string; value: number }[]; byCategory: { name: string; value: number }[] }>(
    "/admin/analytics/gmv",
  );
}

export async function fetchAdminAnalyticsUsers() {
  return api<{ total: number; growth30d: number; series: { label: string; value: number }[]; byCountry: { name: string; value: number }[] }>(
    "/admin/analytics/users",
  );
}

export async function fetchAdminAnalyticsSellers() {
  return api<{ tiers: { name: string; value: number }[]; top: { id: string; name: string; orders: number }[] }>(
    "/admin/analytics/sellers",
  );
}

export async function fetchAdminAnalyticsFx() {
  return api<{ spreadAvg: number; volumeByPair: { name: string; value: number }[]; orders24h: number }>("/admin/analytics/fx");
}

export async function fetchAdminAnalyticsLogistics() {
  return api<{ shipments30d: number; delivered30d: number; inTransit: number; exceptions: number }>("/admin/analytics/logistics");
}

export async function fetchAdminAnalyticsFunnels() {
  return api<{ checkout: { step: string; count: number }[]; onboarding: { step: string; count: number }[] }>("/admin/analytics/funnels");
}

export async function fetchAdminAnalyticsCohorts() {
  return api<{ cohorts: { month: string; size: number; retention: number[] }[] }>("/admin/analytics/cohorts");
}

export async function fetchAdminEscrowStats() {
  return api<{ count: number; heldMinor: string | number; oldest: string | null }>("/admin/escrows/stats");
}

export async function fetchAdminShipmentStats() {
  return api<{ total: number; inTransit: number; delivered30d: number; exceptions: number }>("/admin/shipments/stats");
}

export async function fetchAdminMoneyLedger() {
  return api<unknown[]>("/admin/money/ledger");
}

export async function fetchAdminReconciliation() {
  return api<unknown>("/admin/money/reconciliation");
}

export async function fetchAdminFxSpreads() {
  return api<{ pair?: string; tier?: string; spread?: number; key?: string; value?: string; label?: string }[]>("/admin/money/fx-spreads");
}

export async function fetchAdminSellerTiers() {
  return api<{ id: string; name: string; minOrders?: number; verified?: boolean; title?: string; status?: string }[]>("/admin/sellers/tiers");
}

export async function fetchAdminTickets(status?: string, userId?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (userId) params.set("userId", userId);
  const q = params.toString() ? `?${params.toString()}` : "";
  return api<AdminRecordRow[]>(`/admin/tickets${q}`);
}

export async function fetchAdminWebhooks() {
  return api<AdminRecordRow[]>("/admin/webhooks");
}

export async function fetchAdminFeatureFlags() {
  return api<AdminRecordRow[]>("/admin/feature-flags");
}

export async function fetchAdminJobs() {
  return api<AdminRecordRow[]>("/admin/jobs");
}

export async function fetchAdminIncidents() {
  return api<AdminRecordRow[]>("/admin/incidents");
}

export async function fetchAdminContentPages() {
  return api<AdminRecordRow[]>("/admin/content/pages");
}

export async function fetchAdminHelpArticles() {
  return api<AdminRecordRow[]>("/admin/help/articles");
}

export async function fetchAdminEmailTemplates() {
  return api<AdminRecordRow[]>("/admin/email-templates");
}

export async function fetchAdminSmsTemplates() {
  return api<AdminRecordRow[]>("/admin/sms-templates");
}

export async function moderateProduct(id: string, status: "APPROVED" | "HIDDEN" | "REJECTED") {
  return api(`/admin/products/${id}/moderate`, { method: "POST", body: JSON.stringify({ status }) });
}

export type AdminProductUpdate = {
  title?: string;
  description?: string | null;
  priceMinor?: string | number;
  moq?: string;
  categoryId?: string | null;
  active?: boolean;
  stock?: number | null;
  cbmPerUnit?: number | null;
  weightKgPerUnit?: number | null;
  originHub?: string | null;
  leadTimeMin?: number | null;
  leadTimeMax?: number | null;
  packagingType?: string | null;
  defaultIncoterm?: string | null;
};

export async function updateAdminProduct(id: string, data: AdminProductUpdate) {
  return api<AdminProduct>(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function fetchAdminCategories() {
  return api<unknown[]>("/admin/categories");
}
export async function fetchAdminCategory(id: string) {
  return api<Record<string, unknown>>(`/admin/categories/${id}`);
}
export async function fetchAdminReview(id: string) {
  return api<Record<string, unknown>>(`/admin/reviews/${id}`);
}
export async function fetchAdminConversation(id: string) {
  return api<AdminConversation & { messages?: { id: string; body: string; createdAt: string; senderId?: string }[] }>(`/admin/conversations/${id}`);
}

export async function postAdminConversationMessage(conversationId: string, body: string) {
  return api<{ id: string; body: string; createdAt: string }>(`/admin/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function postAdminTicketMessage(ticketId: string, body: string, author?: string) {
  return api<AdminRecord>(`/admin/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, author }),
  });
}
export async function fetchAdminUserNotes(userId: string) {
  return api<{ id: string; body: string; createdAt: string; author?: { name: string } }[]>(`/admin/users/${userId}/notes`);
}
export async function postAdminUserNote(userId: string, body: string) {
  return api(`/admin/users/${userId}/notes`, { method: "POST", body: JSON.stringify({ body }) });
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

export async function createAdminRecord(body: {
  domain: string;
  externalId?: string;
  title: string;
  subtitle?: string;
  status?: string;
  payload?: Record<string, unknown>;
}) {
  return api<AdminRecord>("/admin/records", { method: "POST", body: JSON.stringify(body) });
}
export async function reportAdminProduct(productId: string, title: string) {
  return createAdminRecord({
    domain: "fraud",
    title,
    externalId: `LST-${productId.slice(0, 8).toUpperCase()}`,
    status: "open",
    payload: { productId, source: "admin_listing_flag" },
  });
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
