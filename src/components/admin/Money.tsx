import { T } from "@/components/admin/AdminShell";
import { StatusBadge, StatusBadgeCustom, formatStatusLabel } from "@/components/admin/StatusBadge";
import { Card, Pill, fmtCNY, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip } from "@/components/admin/Orders";

export { Card, Pill, fmtCNY, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip };

export function fmtUSD(n: number) { return "$" + n.toLocaleString("en-US"); }
export function fmtGHS(n: number) { return "GHΓé╡" + n.toLocaleString("en-US"); }
export function fmtKES(n: number) { return "KSh" + n.toLocaleString("en-US"); }
export function fmtAmt(cur: string, n: number) {
  switch (cur) {
    case "CNY": return fmtCNY(n);
    case "NGN": return fmtNGN(n);
    case "USD": return fmtUSD(n);
    case "GHS": return fmtGHS(n);
    case "KES": return fmtKES(n);
    default: return n.toLocaleString();
  }
}

export type Currency = "CNY" | "NGN" | "USD" | "GHS" | "KES";

export type Wallet = {
  userId: string;
  user: string;
  email: string;
  country: "NG" | "GH" | "KE" | "CN";
  type: "buyer" | "seller" | "platform";
  status: "active" | "frozen" | "limited";
  balances: Partial<Record<Currency, number>>;
  pendingNGN: number;
  escrowNGN: number;
  lifetimeNGN: number;
  lastTx: string;
};

export const WALLETS: Wallet[] = [
  { userId: "USR-10241", user: "Adaeze Okafor",  email: "adaeze.o@magnetpay.ng", country: "NG", type: "buyer",  status: "active",  balances: { NGN: 412000, USD: 220 },          pendingNGN: 18000,  escrowNGN: 1618000, lifetimeNGN: 8420000,  lastTx: "12 min ago" },
  { userId: "USR-10182", user: "Tolu Bankole",   email: "tolu.b@magnetpay.ng",   country: "NG", type: "buyer",  status: "active",  balances: { NGN: 88500 },                       pendingNGN: 0,      escrowNGN: 809100,  lifetimeNGN: 3120000,  lastTx: "1 hr ago" },
  { userId: "USR-09812", user: "Kwame Asante",   email: "kwame.a@magnetpay.gh",  country: "GH", type: "buyer",  status: "active",  balances: { GHS: 4200, USD: 410 },              pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 5640000,  lastTx: "2 days ago" },
  { userId: "USR-09701", user: "Ngozi Eze",      email: "ngozi.e@magnetpay.ng",  country: "NG", type: "buyer",  status: "limited", balances: { NGN: 1240000 },                     pendingNGN: 42000,  escrowNGN: 1380000, lifetimeNGN: 14200000, lastTx: "3 hr ago" },
  { userId: "USR-09584", user: "Femi Adeyemi",   email: "femi.a@magnetpay.ng",   country: "NG", type: "buyer",  status: "active",  balances: { NGN: 62100 },                       pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 980000,   lastTx: "8 min ago" },
  { userId: "SLR-2041", user: "Shenzhen TopMax", email: "ops@topmax.cn",         country: "CN", type: "seller", status: "active",  balances: { CNY: 188400, USD: 2400 },           pendingNGN: 0,      escrowNGN: 4028000, lifetimeNGN: 142000000, lastTx: "44 min ago" },
  { userId: "SLR-1187", user: "Guangzhou Aisha", email: "ops@aisha-tex.cn",      country: "CN", type: "seller", status: "active",  balances: { CNY: 62800 },                       pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 38400000, lastTx: "1 hr ago" },
  { userId: "SLR-2810", user: "Qingdao GoldStrand", email: "ops@goldstrand.cn", country: "CN", type: "seller", status: "active",  balances: { CNY: 211400, USD: 980 },            pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 96200000, lastTx: "5 hr ago" },
  { userId: "SLR-3092", user: "Yiwu PowerLine",  email: "ops@powerline.cn",     country: "CN", type: "seller", status: "frozen",  balances: { CNY: 14200 },                       pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 6800000,  lastTx: "1 day ago" },
  { userId: "PLT-FEE", user: "MagnetPay Fees",   email: "ΓÇö",                     country: "NG", type: "platform", status: "active", balances: { NGN: 18420000, USD: 41200, CNY: 88000 }, pendingNGN: 0, escrowNGN: 0,    lifetimeNGN: 0,        lastTx: "just now" },
  { userId: "PLT-ESC", user: "MagnetPay Escrow", email: "ΓÇö",                     country: "NG", type: "platform", status: "active", balances: { NGN: 412800000, CNY: 1820000 },    pendingNGN: 0,      escrowNGN: 0,       lifetimeNGN: 0,        lastTx: "just now" },
];

export function findWallet(uid: string | undefined) {
  if (!uid) return WALLETS[0];
  return WALLETS.find((w) => w.userId === uid || w.userId.endsWith(uid)) ?? WALLETS[0];
}

export type TxnType = "deposit" | "withdrawal" | "payout" | "transfer" | "fee" | "fx" | "escrow_hold" | "escrow_release" | "refund" | "chargeback";
export type TxnStatus = "succeeded" | "pending" | "failed" | "reversed" | "review";

export type Txn = {
  id: string;
  type: TxnType;
  status: TxnStatus;
  party: string;
  partyId: string;
  counter?: string;
  currency: Currency;
  amount: number;
  amountNGN: number;
  fee: number;
  rail: "Stripe" | "Paystack" | "Flutterwave" | "Wise" | "Alipay" | "MagnetPay Internal" | "Wallet" | "Bank";
  ref: string;
  orderId?: string;
  at: string;
};

export const TXNS: Txn[] = [
  { id: "TXN-9020441", type: "deposit",        status: "succeeded", party: "Adaeze Okafor",   partyId: "USR-10241", currency: "NGN", amount: 1618000, amountNGN: 1618000, fee: 16180, rail: "Paystack",          ref: "ps_3PqX829jKLM",     orderId: "ORD-528104", at: "12 min ago" },
  { id: "TXN-9020439", type: "escrow_hold",    status: "succeeded", party: "Adaeze Okafor",   partyId: "USR-10241", counter: "MagnetPay Escrow", currency: "NGN", amount: 1576000, amountNGN: 1576000, fee: 0, rail: "MagnetPay Internal", ref: "esc_77120_hold",   orderId: "ORD-528104", at: "10 min ago" },
  { id: "TXN-9020430", type: "fx",             status: "succeeded", party: "MagnetPay Treasury", partyId: "PLT-ESC", counter: "TopMax", currency: "CNY", amount: 6880, amountNGN: 1575795, fee: 4720, rail: "Wise",         ref: "fx_2026062801",     orderId: "ORD-528104", at: "9 min ago" },
  { id: "TXN-9020412", type: "withdrawal",     status: "pending",   party: "Shenzhen TopMax", partyId: "SLR-2041",  currency: "CNY", amount: 88400,   amountNGN: 20247000, fee: 880, rail: "Wise",              ref: "wd_998812",         at: "44 min ago" },
  { id: "TXN-9020404", type: "deposit",        status: "succeeded", party: "Tolu Bankole",    partyId: "USR-10182", currency: "NGN", amount: 809100,  amountNGN: 809100,   fee: 8091, rail: "Stripe",            ref: "pi_3PqX111KMN",     orderId: "ORD-528098", at: "1 hr ago" },
  { id: "TXN-9020388", type: "payout",         status: "succeeded", party: "Qingdao GoldStrand", partyId: "SLR-2810", currency: "USD", amount: 14400, amountNGN: 22680000, fee: 22,  rail: "Wise",              ref: "po_b440289_qgs",    at: "5 hr ago" },
  { id: "TXN-9020366", type: "fee",            status: "succeeded", party: "MagnetPay Fees",  partyId: "PLT-FEE",   currency: "NGN", amount: 40450,   amountNGN: 40450,    fee: 0,   rail: "MagnetPay Internal", ref: "fee_ord_528098",    orderId: "ORD-528098", at: "1 hr ago" },
  { id: "TXN-9020320", type: "refund",         status: "succeeded", party: "Chiamaka Obi",    partyId: "USR-09080", currency: "NGN", amount: 909000,  amountNGN: 909000,   fee: 0,   rail: "Paystack",          ref: "ps_rfd_88102",      orderId: "ORD-527964", at: "1 wk ago" },
  { id: "TXN-9020301", type: "chargeback",     status: "review",    party: "Ibrahim Yusuf",   partyId: "USR-09221", currency: "NGN", amount: 603400,  amountNGN: 603400,   fee: 4500, rail: "Stripe",            ref: "cb_3PqX44ZZA",      orderId: "ORD-527990", at: "2 days ago" },
  { id: "TXN-9020284", type: "withdrawal",     status: "failed",    party: "Yiwu PowerLine",  partyId: "SLR-3092",  currency: "CNY", amount: 14200,   amountNGN: 3252368,  fee: 142, rail: "Alipay",            ref: "wd_alipay_22041",   at: "yesterday" },
  { id: "TXN-9020260", type: "escrow_release", status: "succeeded", party: "MagnetPay Escrow", partyId: "PLT-ESC",  counter: "TopMax", currency: "NGN", amount: 4920000, amountNGN: 4920000, fee: 0, rail: "MagnetPay Internal", ref: "esc_77011_release", at: "2 days ago" },
  { id: "TXN-9020241", type: "transfer",       status: "succeeded", party: "Ade Internal Ops", partyId: "STF-0011", counter: "PLT-FEE", currency: "NGN", amount: 250000, amountNGN: 250000, fee: 0, rail: "MagnetPay Internal", ref: "tr_ops_88812", at: "3 days ago" },
];

export function findTxn(id: string | undefined) {
  if (!id) return TXNS[0];
  return TXNS.find((t) => t.id === id || t.id.endsWith(id)) ?? TXNS[0];
}

export const TXN_META: Record<TxnType, { label: string; c: string }> = {
  deposit:         { label: "Deposit",          c: T.success },
  withdrawal:      { label: "Withdrawal",       c: T.warn },
  payout:          { label: "Payout",           c: T.info },
  transfer:        { label: "Transfer",         c: T.sub },
  fee:             { label: "Fee",              c: T.accent },
  fx:              { label: "FX",               c: "#7C3AED" },
  escrow_hold:     { label: "Escrow hold",      c: T.navy },
  escrow_release:  { label: "Escrow release",   c: T.success },
  refund:          { label: "Refund",           c: T.accent },
  chargeback:      { label: "Chargeback",       c: T.danger },
};

export const TXN_STATUS_COLOR: Record<TxnStatus, string> = {
  succeeded: T.success, pending: T.warn, failed: T.danger, reversed: T.muted, review: T.info,
};

export function txnPill(s: TxnStatus) {
  const c = TXN_STATUS_COLOR[s];
  return <StatusBadgeCustom color={c} label={formatStatusLabel(s)} />;
}

export function txnTypePill(t: TxnType) {
  const m = TXN_META[t];
  return <StatusBadgeCustom color={m.c} label={m.label} dot={false} />;
}

// FX
export type FXRate = { pair: string; mid: number; spread: number; buy: number; sell: number; source: "Wise" | "Manual" | "CBN" | "Alipay"; updated: string; override?: boolean };

export const FX_RATES: FXRate[] = [
  { pair: "CNY/NGN", mid: 229.04, spread: 1.8, buy: 226.98, sell: 231.10, source: "Wise",   updated: "2 min ago", override: false },
  { pair: "USD/NGN", mid: 1620.0, spread: 1.2, buy: 1610.2, sell: 1629.7, source: "CBN",    updated: "5 min ago", override: false },
  { pair: "CNY/USD", mid: 0.1413, spread: 0.4, buy: 0.1410, sell: 0.1418, source: "Wise",   updated: "2 min ago", override: false },
  { pair: "GHS/NGN", mid: 108.42, spread: 2.5, buy: 105.71, sell: 111.13, source: "Manual", updated: "1 hr ago",  override: true  },
  { pair: "KES/NGN", mid: 12.41,  spread: 2.0, buy: 12.16,  sell: 12.66,  source: "Manual", updated: "32 min ago",override: true  },
  { pair: "USD/CNY", mid: 7.078,  spread: 0.4, buy: 7.050,  sell: 7.106,  source: "Wise",   updated: "2 min ago", override: false },
];

export type FXOrder = {
  id: string; pair: string; side: "buy" | "sell"; notional: number; notionalCcy: Currency;
  rate: number; received: number; receivedCcy: Currency; status: "filled" | "partial" | "queued" | "failed";
  provider: "Wise" | "Alipay" | "Internal" | "OTC Desk"; user: string; userId: string; orderRef?: string; at: string;
};

export const FX_ORDERS: FXOrder[] = [
  { id: "FXO-44210", pair: "NGN/CNY", side: "buy",  notional: 1576000, notionalCcy: "NGN", rate: 0.00437, received: 6880,  receivedCcy: "CNY", status: "filled",  provider: "Wise",     user: "MagnetPay Treasury", userId: "PLT-ESC", orderRef: "ORD-528104", at: "9 min ago" },
  { id: "FXO-44209", pair: "NGN/CNY", side: "buy",  notional: 780600,  notionalCcy: "NGN", rate: 0.00437, received: 3408,  receivedCcy: "CNY", status: "filled",  provider: "Wise",     user: "MagnetPay Treasury", userId: "PLT-ESC", orderRef: "ORD-528098", at: "1 hr ago" },
  { id: "FXO-44208", pair: "CNY/USD", side: "sell", notional: 88400,   notionalCcy: "CNY", rate: 0.1413,  received: 12491, receivedCcy: "USD", status: "partial", provider: "Alipay",   user: "Shenzhen TopMax",    userId: "SLR-2041", orderRef: "TXN-9020412", at: "44 min ago" },
  { id: "FXO-44207", pair: "NGN/GHS", side: "buy",  notional: 1683000, notionalCcy: "NGN", rate: 0.00922, received: 15517, receivedCcy: "GHS", status: "filled",  provider: "OTC Desk", user: "MagnetPay Treasury", userId: "PLT-ESC", orderRef: "ORD-528077", at: "2 days ago" },
  { id: "FXO-44206", pair: "NGN/KES", side: "buy",  notional: 681000,  notionalCcy: "NGN", rate: 0.08059, received: 54881, receivedCcy: "KES", status: "filled",  provider: "OTC Desk", user: "MagnetPay Treasury", userId: "PLT-ESC", orderRef: "ORD-528022", at: "5 days ago" },
  { id: "FXO-44205", pair: "USD/CNY", side: "buy",  notional: 25000,   notionalCcy: "USD", rate: 7.078,   received: 176950,receivedCcy: "CNY", status: "queued",  provider: "Internal", user: "Liquidity Bot",      userId: "BOT-FX",  at: "queued" },
  { id: "FXO-44204", pair: "USD/CNY", side: "buy",  notional: 18000,   notionalCcy: "USD", rate: 7.082,   received: 0,     receivedCcy: "CNY", status: "failed",  provider: "Wise",     user: "Liquidity Bot",      userId: "BOT-FX",  at: "yesterday" },
];

export function findFXOrder(id: string | undefined) {
  if (!id) return FX_ORDERS[0];
  return FX_ORDERS.find((o) => o.id === id || o.id.endsWith(id)) ?? FX_ORDERS[0];
}

// Deposits / Withdrawals (specialized txn views)
export type MoneyMove = {
  id: string;
  kind: "deposit" | "withdrawal";
  user: string; userId: string; country: "NG" | "GH" | "KE" | "CN";
  currency: Currency; amount: number; amountNGN: number;
  rail: Txn["rail"];
  method: string;
  status: "succeeded" | "pending" | "review" | "failed" | "approved" | "rejected";
  riskScore: number;
  ref: string;
  at: string;
  reason?: string;
};

export const DEPOSITS: MoneyMove[] = [
  { id: "DEP-44120", kind: "deposit", user: "Adaeze Okafor", userId: "USR-10241", country: "NG", currency: "NGN", amount: 1618000, amountNGN: 1618000, rail: "Paystack",    method: "Card ┬╖ **4242", status: "succeeded", riskScore: 12, ref: "ps_3PqX829jKLM", at: "12 min ago" },
  { id: "DEP-44118", kind: "deposit", user: "Tolu Bankole",  userId: "USR-10182", country: "NG", currency: "NGN", amount: 809100,  amountNGN: 809100,   rail: "Stripe",      method: "Card ┬╖ **0010", status: "succeeded", riskScore: 8,  ref: "pi_3PqX111KMN", at: "1 hr ago" },
  { id: "DEP-44115", kind: "deposit", user: "Kwame Asante",  userId: "USR-09812", country: "GH", currency: "GHS", amount: 15517,   amountNGN: 1683000,  rail: "Flutterwave", method: "Bank transfer", status: "succeeded", riskScore: 4,  ref: "flw_82920_GH", at: "2 days ago" },
  { id: "DEP-44112", kind: "deposit", user: "Ngozi Eze",     userId: "USR-09701", country: "NG", currency: "NGN", amount: 1380000, amountNGN: 1380000,  rail: "Paystack",    method: "USSD ┬╖ *737#",  status: "review",    riskScore: 68, ref: "ps_3Pq8804AB",  at: "3 hr ago", reason: "Velocity flag ΓÇö 4 deposits in 24h" },
  { id: "DEP-44109", kind: "deposit", user: "Femi Adeyemi",  userId: "USR-09584", country: "NG", currency: "NGN", amount: 764800,  amountNGN: 764800,   rail: "Paystack",    method: "USSD ┬╖ *737#",  status: "pending",   riskScore: 22, ref: "ps_3Pq8780YY",  at: "8 min ago" },
  { id: "DEP-44102", kind: "deposit", user: "Mary Wanjiru",  userId: "USR-09410", country: "KE", currency: "KES", amount: 54881,   amountNGN: 681000,   rail: "Flutterwave", method: "M-Pesa",        status: "succeeded", riskScore: 6,  ref: "flw_mpesa_88102", at: "5 days ago" },
  { id: "DEP-44090", kind: "deposit", user: "Ibrahim Yusuf", userId: "USR-09221", country: "NG", currency: "NGN", amount: 603400,  amountNGN: 603400,   rail: "Stripe",      method: "Card ┬╖ **8841", status: "failed",    riskScore: 41, ref: "pi_3Pq8221FF",  at: "yesterday", reason: "Insufficient funds" },
];

export const WITHDRAWALS: MoneyMove[] = [
  { id: "WDR-22041", kind: "withdrawal", user: "Shenzhen TopMax",  userId: "SLR-2041", country: "CN", currency: "CNY", amount: 88400, amountNGN: 20247000, rail: "Wise",     method: "Wise CN ΓåÆ CNY bank",       status: "pending",  riskScore: 14, ref: "wd_998812",       at: "44 min ago" },
  { id: "WDR-22038", kind: "withdrawal", user: "Qingdao GoldStrand", userId: "SLR-2810", country: "CN", currency: "USD", amount: 14400, amountNGN: 22680000, rail: "Wise",     method: "Wise USD ΓåÆ CN HSBC",       status: "approved", riskScore: 6,  ref: "po_b440289_qgs", at: "5 hr ago" },
  { id: "WDR-22033", kind: "withdrawal", user: "Yiwu PowerLine",   userId: "SLR-3092", country: "CN", currency: "CNY", amount: 14200, amountNGN: 3252368,  rail: "Alipay",   method: "Alipay merchant payout",   status: "failed",   riskScore: 22, ref: "wd_alipay_22041", at: "yesterday", reason: "Beneficiary KYC expired" },
  { id: "WDR-22029", kind: "withdrawal", user: "Adaeze Okafor",    userId: "USR-10241", country: "NG", currency: "NGN", amount: 220000, amountNGN: 220000,  rail: "Paystack", method: "GTBank ┬╖ 0123****12",       status: "review",   riskScore: 51, ref: "wd_ps_44120",     at: "1 hr ago", reason: "First withdrawal > Γéª100k" },
  { id: "WDR-22024", kind: "withdrawal", user: "Tolu Bankole",     userId: "USR-10182", country: "NG", currency: "NGN", amount: 80000,  amountNGN: 80000,   rail: "Paystack", method: "Access ┬╖ 9876****55",       status: "succeeded",riskScore: 4,  ref: "wd_ps_44118",     at: "2 days ago" },
  { id: "WDR-22020", kind: "withdrawal", user: "Shenzhen TopMax",  userId: "SLR-2041", country: "CN", currency: "CNY", amount: 142000, amountNGN: 32524000, rail: "Wise",     method: "Wise CN ΓåÆ CNY bank",       status: "succeeded",riskScore: 6,  ref: "wd_998801",       at: "1 wk ago" },
];

export function findMove(id: string | undefined, list: MoneyMove[]) {
  if (!id) return list[0];
  return list.find((m) => m.id === id || m.id.endsWith(id)) ?? list[0];
}

export const STATUS_COLORS: Record<string, string> = {
  succeeded: T.success, approved: T.success, pending: T.warn, review: T.info, failed: T.danger, rejected: T.danger, queued: T.warn, filled: T.success, partial: T.warn,
};

export function statusPill(s: string) {
  const c = STATUS_COLORS[s] ?? T.muted;
  return <StatusBadgeCustom color={c} label={formatStatusLabel(s)} />;
}

// Chargebacks
export type Chargeback = {
  id: string; orderId: string; txnId: string; user: string; userId: string; country: "NG" | "GH" | "KE";
  amountNGN: number; currency: Currency; rail: "Stripe" | "Paystack" | "Flutterwave"; reasonCode: string; reason: string;
  status: "received" | "evidence_due" | "submitted" | "won" | "lost"; dueAt: string; opened: string;
};

export const CHARGEBACKS: Chargeback[] = [
  { id: "CHB-3041", orderId: "ORD-527990", txnId: "TXN-9020301", user: "Ibrahim Yusuf", userId: "USR-09221", country: "NG", amountNGN: 603400, currency: "NGN", rail: "Stripe",      reasonCode: "10.4", reason: "Fraudulent ΓÇö card-not-present",       status: "evidence_due", dueAt: "Jul 04",  opened: "2 days ago" },
  { id: "CHB-3038", orderId: "ORD-527940", txnId: "TXN-9020260", user: "Aisha Bello",   userId: "USR-08902", country: "NG", amountNGN: 4028000, currency: "NGN", rail: "Paystack",    reasonCode: "13.1", reason: "Merchandise/services not received",   status: "submitted",    dueAt: "Jul 12",  opened: "5 days ago" },
  { id: "CHB-3034", orderId: "ORD-527918", txnId: "TXN-9020241", user: "Joy Mensah",    userId: "USR-08741", country: "GH", amountNGN: 561000,  currency: "GHS", rail: "Flutterwave", reasonCode: "13.3", reason: "Not as described or defective",       status: "received",     dueAt: "Jul 09",  opened: "1 day ago" },
  { id: "CHB-3029", orderId: "ORD-527880", txnId: "TXN-9020188", user: "Mary Wanjiru",  userId: "USR-09410", country: "KE", amountNGN: 220000,  currency: "KES", rail: "Stripe",      reasonCode: "10.1", reason: "EMV liability shift",                 status: "won",          dueAt: "ΓÇö",       opened: "2 wks ago" },
  { id: "CHB-3024", orderId: "ORD-527812", txnId: "TXN-9020130", user: "Chiamaka Obi",  userId: "USR-09080", country: "NG", amountNGN: 88000,   currency: "NGN", rail: "Paystack",    reasonCode: "12.5", reason: "Incorrect amount",                    status: "lost",         dueAt: "ΓÇö",       opened: "3 wks ago" },
];

export const CB_STATUS_COLOR: Record<Chargeback["status"], string> = {
  received: T.warn, evidence_due: T.danger, submitted: T.info, won: T.success, lost: T.muted,
};

export function findChargeback(id: string | undefined) {
  if (!id) return CHARGEBACKS[0];
  return CHARGEBACKS.find((c) => c.id === id || c.id.endsWith(id)) ?? CHARGEBACKS[0];
}

// Currencies / Corridors / Limits / Fees
export const CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira",       symbol: "Γéª",   decimals: 2, enabled: true,  reserves: 412800000, holders: 18420 },
  { code: "CNY", name: "Chinese Yuan",         symbol: "┬Ñ",   decimals: 2, enabled: true,  reserves: 1820000,   holders: 248 },
  { code: "USD", name: "US Dollar",            symbol: "$",   decimals: 2, enabled: true,  reserves: 412000,    holders: 1840 },
  { code: "GHS", name: "Ghanaian Cedi",        symbol: "GHΓé╡", decimals: 2, enabled: true,  reserves: 88000,     holders: 612 },
  { code: "KES", name: "Kenyan Shilling",      symbol: "KSh", decimals: 2, enabled: true,  reserves: 4800000,   holders: 340 },
  { code: "ZAR", name: "South African Rand",   symbol: "R",   decimals: 2, enabled: false, reserves: 0,         holders: 0 },
  { code: "XAF", name: "Central African CFA",  symbol: "FCFA",decimals: 0, enabled: false, reserves: 0,         holders: 0 },
];

export const CORRIDORS = [
  { id: "COR-NG-CN", from: "NG", to: "CN", pair: "NGNΓåÆCNY", enabled: true,  monthlyVolNGN: 4820000000, fee: "2.5% + Γéª200", settle: "T+1", note: "Primary marketplace corridor" },
  { id: "COR-GH-CN", from: "GH", to: "CN", pair: "GHSΓåÆCNY", enabled: true,  monthlyVolNGN: 412000000,  fee: "2.8% + GHΓé╡5", settle: "T+1", note: "" },
  { id: "COR-KE-CN", from: "KE", to: "CN", pair: "KESΓåÆCNY", enabled: true,  monthlyVolNGN: 188000000,  fee: "2.8% + KSh50",settle: "T+2", note: "M-Pesa funded" },
  { id: "COR-NG-NG", from: "NG", to: "NG", pair: "NGNΓåöNGN", enabled: true,  monthlyVolNGN: 1620000000, fee: "0.5%",        settle: "T+0", note: "Domestic wallet transfers" },
  { id: "COR-NG-US", from: "NG", to: "US", pair: "NGNΓåÆUSD", enabled: true,  monthlyVolNGN: 88000000,   fee: "3.5% + $2",   settle: "T+2", note: "Limited beta" },
  { id: "COR-ZA-CN", from: "ZA", to: "CN", pair: "ZARΓåÆCNY", enabled: false, monthlyVolNGN: 0,          fee: "ΓÇö",           settle: "ΓÇö",   note: "Planned Q3 2026" },
];

export const TIER_LIMITS = [
  { tier: "Tier 0 ΓÇö Unverified", depositDay: 50000,    depositMonth: 250000,    withdrawDay: 0,        withdrawMonth: 0,        singleTxn: 50000,    cur: "NGN" },
  { tier: "Tier 1 ΓÇö Email/Phone", depositDay: 500000,   depositMonth: 5000000,   withdrawDay: 100000,   withdrawMonth: 1000000,  singleTxn: 200000,   cur: "NGN" },
  { tier: "Tier 2 ΓÇö KYC light",   depositDay: 5000000,  depositMonth: 50000000,  withdrawDay: 2000000,  withdrawMonth: 20000000, singleTxn: 2000000,  cur: "NGN" },
  { tier: "Tier 3 ΓÇö KYC full",    depositDay: 25000000, depositMonth: 250000000, withdrawDay: 10000000, withdrawMonth: 100000000,singleTxn: 10000000, cur: "NGN" },
  { tier: "Tier S ΓÇö Seller (KYB)",depositDay: 100000000,depositMonth: 1000000000,withdrawDay: 50000000, withdrawMonth: 500000000,singleTxn: 50000000, cur: "NGN" },
];

export const FEE_SCHEDULE = [
  { scope: "Marketplace order", corridor: "NGNΓåÆCNY", taker: "2.5%", maker: "0%",   floor: "Γéª200",  cap: "Γéª25,000", appliesTo: "Buyer" },
  { scope: "Marketplace order", corridor: "GHSΓåÆCNY", taker: "2.8%", maker: "0%",   floor: "GHΓé╡5",  cap: "GHΓé╡400",  appliesTo: "Buyer" },
  { scope: "Marketplace order", corridor: "KESΓåÆCNY", taker: "2.8%", maker: "0%",   floor: "KSh50", cap: "KSh3000", appliesTo: "Buyer" },
  { scope: "Wallet deposit",    corridor: "NGN",      taker: "1.0%", maker: "1.0%", floor: "Γéª50",   cap: "Γéª1,500",  appliesTo: "Funder" },
  { scope: "Wallet withdrawal", corridor: "NGN",      taker: "Γéª100", maker: "Γéª100", floor: "ΓÇö",     cap: "ΓÇö",        appliesTo: "Holder" },
  { scope: "Seller payout",     corridor: "CNY",      taker: "0.5%", maker: "0.5%", floor: "┬Ñ10",   cap: "┬Ñ500",     appliesTo: "Seller" },
  { scope: "FX conversion",     corridor: "CNY/NGN",  taker: "1.8%", maker: "1.2%", floor: "ΓÇö",     cap: "ΓÇö",        appliesTo: "Spread" },
  { scope: "Chargeback fee",    corridor: "ΓÇö",        taker: "Γéª4,500", maker: "Γéª4,500", floor: "ΓÇö", cap: "ΓÇö",        appliesTo: "Seller (on loss)" },
];

// Liquidity providers
export const LIQUIDITY = [
  { provider: "Wise Business",   balances: { USD: 142000, CNY: 880000, NGN: 0 },         status: "healthy", utilization: 62, capDaily: "$500k", lastSync: "2 min ago" },
  { provider: "Alipay Merchant", balances: { CNY: 412000, USD: 0,      NGN: 0 },         status: "healthy", utilization: 38, capDaily: "┬Ñ3M",   lastSync: "8 min ago" },
  { provider: "OTC Desk (Lagos)",balances: { NGN: 88400000, USD: 88000, GHS: 142000 },   status: "low",     utilization: 91, capDaily: "Γéª200M", lastSync: "22 min ago" },
  { provider: "MagnetPay Internal",balances: { NGN: 412800000, CNY: 1820000, USD: 412000 }, status: "healthy", utilization: 24, capDaily: "ΓÇö",   lastSync: "just now" },
];

// Payouts batches
export const PAYOUT_BATCHES = [
  { id: "PYB-30418", cycle: "Daily ΓÇö Jun 28",  count: 142, totalNGN: 188400000, currency: "CNY", rail: "Wise",   status: "scheduled", runAt: "Today 18:00 UTC" },
  { id: "PYB-30417", cycle: "Daily ΓÇö Jun 27",  count: 156, totalNGN: 212800000, currency: "CNY", rail: "Wise",   status: "completed", runAt: "Yesterday" },
  { id: "PYB-30416", cycle: "Daily ΓÇö Jun 26",  count: 138, totalNGN: 188100000, currency: "CNY", rail: "Wise",   status: "completed", runAt: "2 days ago" },
  { id: "PYB-30415", cycle: "Weekly ΓÇö GHS",    count: 22,  totalNGN: 28400000,  currency: "GHS", rail: "OTC",    status: "completed", runAt: "Monday" },
  { id: "PYB-30414", cycle: "Daily ΓÇö Jun 25",  count: 8,   totalNGN: 12400000,  currency: "USD", rail: "Wise",   status: "failed",    runAt: "3 days ago" },
];

// Ledger (double-entry)
export const LEDGER = [
  { id: "JE-822041", at: "Jun 28 09:14 UTC", memo: "Order ORD-528104 payment captured",       ref: "TXN-9020441", lines: [
    { account: "Cash:Paystack:NGN",        debit: 1618000, credit: 0 },
    { account: "Liabilities:UserWallet:USR-10241", debit: 0,       credit: 1618000 },
  ]},
  { id: "JE-822040", at: "Jun 28 09:16 UTC", memo: "Escrow hold ESC-77120",                   ref: "TXN-9020439", lines: [
    { account: "Liabilities:UserWallet:USR-10241", debit: 1576000, credit: 0 },
    { account: "Liabilities:Escrow:Held",          debit: 0,       credit: 1576000 },
  ]},
  { id: "JE-822039", at: "Jun 28 09:17 UTC", memo: "Platform fee 2.5%",                       ref: "TXN-9020438", lines: [
    { account: "Liabilities:UserWallet:USR-10241", debit: 40450,   credit: 0 },
    { account: "Equity:Revenue:Fees:Marketplace",  debit: 0,       credit: 40450 },
  ]},
  { id: "JE-822038", at: "Jun 28 09:17 UTC", memo: "FX conversion NGN ΓåÆ CNY @ 229.04",        ref: "FXO-44210", lines: [
    { account: "Liabilities:Escrow:Held",          debit: 1575795, credit: 0 },
    { account: "Cash:Wise:CNY",                    debit: 0,       credit: 1575795 },
    { account: "Equity:Revenue:Fees:FXSpread",     debit: 0,       credit: 28365 },
    { account: "Cash:Wise:CNY",                    debit: 28365,   credit: 0 },
  ]},
  { id: "JE-822037", at: "Jun 27 14:48 UTC", memo: "Seller payout PYB-30417",                 ref: "TXN-9020388", lines: [
    { account: "Liabilities:UserWallet:SLR-2810",  debit: 22680000, credit: 0 },
    { account: "Cash:Wise:USD",                    debit: 0,        credit: 22680000 },
  ]},
];

// Reconciliation
export const RECON = [
  { rail: "Paystack",    settledNGN: 142800000, ledgerNGN: 142800000, diff: 0,       items: 1842, status: "matched"   },
  { rail: "Stripe",      settledNGN: 28400000,  ledgerNGN: 28398200,  diff: -1800,   items: 412,  status: "mismatch"  },
  { rail: "Flutterwave", settledNGN: 18200000,  ledgerNGN: 18200000,  diff: 0,       items: 220,  status: "matched"   },
  { rail: "Wise",        settledNGN: 88400000,  ledgerNGN: 88445000,  diff: 45000,   items: 188,  status: "mismatch"  },
  { rail: "Alipay",      settledNGN: 12400000,  ledgerNGN: 12400000,  diff: 0,       items: 96,   status: "matched"   },
  { rail: "OTC Desk",    settledNGN: 42800000,  ledgerNGN: 42800000,  diff: 0,       items: 38,   status: "pending"   },
];

// FX Spreads
export const FX_SPREADS = [
  { pair: "CNY/NGN", tier: "Retail",     spread: 1.8, floor: 0.8, cap: 2.5, fallback: "Mid", updated: "2 min ago" },
  { pair: "CNY/NGN", tier: "Pro",        spread: 1.2, floor: 0.6, cap: 2.0, fallback: "Mid", updated: "2 min ago" },
  { pair: "USD/NGN", tier: "Retail",     spread: 1.2, floor: 0.5, cap: 2.0, fallback: "CBN", updated: "5 min ago" },
  { pair: "GHS/NGN", tier: "Retail",     spread: 2.5, floor: 1.5, cap: 3.5, fallback: "Manual", updated: "1 hr ago" },
  { pair: "KES/NGN", tier: "Retail",     spread: 2.0, floor: 1.0, cap: 3.0, fallback: "Manual", updated: "32 min ago" },
  { pair: "CNY/USD", tier: "Treasury",   spread: 0.4, floor: 0.2, cap: 0.8, fallback: "Mid", updated: "2 min ago" },
];
