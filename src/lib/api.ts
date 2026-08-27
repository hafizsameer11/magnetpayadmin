const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000";

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

export type AdminShipment = {
  id: string;
  status: string;
  mode?: string;
  createdAt: string;
  user?: { id: string; name: string; phone: string };
  events?: { id?: string; status?: string; message?: string; createdAt?: string; [k: string]: unknown }[];
  documents?: unknown[];
  hold?: unknown;
  settlement?: unknown;
  quote?: unknown;
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
export async function fetchAdminSellers() {
  return api<unknown[]>("/admin/sellers");
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
