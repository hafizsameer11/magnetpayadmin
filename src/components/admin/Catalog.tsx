import type { ReactNode } from "react";
import { T } from "@/components/admin/AdminShell";
import { StatusBadge, StatusBadgeCustom, formatStatusLabel, type BadgeTone } from "./StatusBadge";
import imgCharger from "@/assets/listings/charger.jpg";
import imgAnkara from "@/assets/listings/ankara.jpg";
import imgSurge from "@/assets/listings/surge.jpg";
import imgHair from "@/assets/listings/hair.jpg";
import imgInverter from "@/assets/listings/inverter.jpg";
import imgSpeaker from "@/assets/listings/speaker.jpg";
import imgPots from "@/assets/listings/pots.jpg";
import imgTablet from "@/assets/listings/tablet.jpg";

export const LISTING_IMAGES = {
  charger: imgCharger, ankara: imgAnkara, surge: imgSurge, hair: imgHair,
  inverter: imgInverter, speaker: imgSpeaker, pots: imgPots, tablet: imgTablet,
};

export type Listing = {
  id: string;
  title: string;
  sku: string;
  seller: string;
  sellerId: string;
  category: string;
  brand: string;
  priceCNY: number;
  priceNGN: number;
  stock: number;
  moq: number;
  status: "active" | "pending" | "reported" | "draft" | "delisted";
  image: string;
  updated: string;
  views30d: number;
  orders30d: number;
  rating: number;
  flagReason?: string;
};

export const LISTINGS: Listing[] = [
  { id: "LST-90412", title: "USB-C 100W Fast Charger Bundle (NG plug)", sku: "CHG-100W-NG-BLK", seller: "Shenzhen TopMax Trading", sellerId: "SLR-2041", category: "Electronics / Accessories", brand: "TopMax", priceCNY: 86, priceNGN: 19700, stock: 1240, moq: 50, status: "active", image: imgCharger, updated: "12 min ago", views30d: 18420, orders30d: 312, rating: 4.7 },
  { id: "LST-90418", title: "Ankara Print Cotton Roll (6 yds) ΓÇö Mixed Lot", sku: "FAB-ANK-6YD-MIX", seller: "Guangzhou Aisha Textiles", sellerId: "SLR-1187", category: "Textiles / Fabrics", brand: "Aisha", priceCNY: 142, priceNGN: 32550, stock: 480, moq: 20, status: "active", image: imgAnkara, updated: "1 hr ago", views30d: 9220, orders30d: 184, rating: 4.5 },
  { id: "LST-90422", title: "Generic Surge Protector 4-Outlet (NG pin)", sku: "ELE-SRG-4P-WHT", seller: "Yiwu PowerLine Co.", sellerId: "SLR-3092", category: "Electronics / Power", brand: "PowerLine", priceCNY: 38, priceNGN: 8710, stock: 84, moq: 100, status: "pending", image: imgSurge, updated: "32 min ago", views30d: 0, orders30d: 0, rating: 0, flagReason: "Awaiting NCC compliance docs" },
  { id: "LST-90428", title: "Hair Bundle ΓÇö 100% Virgin Body Wave 18\" (4pc)", sku: "BTY-HRB-18-BDW", seller: "Qingdao GoldStrand Hair", sellerId: "SLR-2810", category: "Beauty / Hair", brand: "GoldStrand", priceCNY: 612, priceNGN: 140250, stock: 220, moq: 4, status: "active", image: imgHair, updated: "3 hr ago", views30d: 24100, orders30d: 410, rating: 4.8 },
  { id: "LST-90431", title: "Solar Inverter 3kW Hybrid (NG-tuned)", sku: "SOL-INV-3K-HYB", seller: "Shenzhen TopMax Trading", sellerId: "SLR-2041", category: "Electronics / Solar", brand: "TopMax", priceCNY: 2840, priceNGN: 651000, stock: 36, moq: 1, status: "reported", image: imgInverter, updated: "5 hr ago", views30d: 3120, orders30d: 22, rating: 4.2, flagReason: "Counterfeit brand claim (3 reports)" },
  { id: "LST-90437", title: "Bluetooth Speaker BoomX Mini", sku: "AUD-BT-BMX-MNI", seller: "Yiwu PowerLine Co.", sellerId: "SLR-3092", category: "Electronics / Audio", brand: "BoomX", priceCNY: 54, priceNGN: 12380, stock: 0, moq: 50, status: "active", image: imgSpeaker, updated: "8 hr ago", views30d: 6700, orders30d: 98, rating: 4.3 },
  { id: "LST-90442", title: "Stainless Steel Cooking Pot Set (7pc)", sku: "HMK-POT-7PC-SS", seller: "Foshan KitchenPlus", sellerId: "SLR-4421", category: "Home & Kitchen", brand: "KitchenPlus", priceCNY: 198, priceNGN: 45390, stock: 312, moq: 10, status: "pending", image: imgPots, updated: "1 day ago", views30d: 0, orders30d: 0, rating: 0, flagReason: "Pending category review" },
  { id: "LST-90446", title: "Children's Reading Tablet 7\" (Hausa+Eng)", sku: "EDU-TAB-7-HAU", seller: "Shenzhen LearnEasy", sellerId: "SLR-5512", category: "Electronics / Education", brand: "LearnEasy", priceCNY: 312, priceNGN: 71550, stock: 168, moq: 5, status: "reported", image: imgTablet, updated: "2 days ago", views30d: 8900, orders30d: 64, rating: 3.9, flagReason: "Misleading specs (2 reports)" },
];

export const CATEGORIES = [
  { id: "CAT-ELE", name: "Electronics", parent: null, listings: 4218, children: 8 },
  { id: "CAT-ELE-ACC", name: "Accessories", parent: "CAT-ELE", listings: 980, children: 0 },
  { id: "CAT-ELE-AUD", name: "Audio", parent: "CAT-ELE", listings: 612, children: 0 },
  { id: "CAT-ELE-PWR", name: "Power", parent: "CAT-ELE", listings: 488, children: 0 },
  { id: "CAT-ELE-SOL", name: "Solar", parent: "CAT-ELE", listings: 244, children: 0 },
  { id: "CAT-TEX", name: "Textiles", parent: null, listings: 1820, children: 4 },
  { id: "CAT-TEX-FAB", name: "Fabrics", parent: "CAT-TEX", listings: 1240, children: 0 },
  { id: "CAT-BTY", name: "Beauty", parent: null, listings: 2412, children: 5 },
  { id: "CAT-BTY-HAR", name: "Hair", parent: "CAT-BTY", listings: 1180, children: 0 },
  { id: "CAT-HMK", name: "Home & Kitchen", parent: null, listings: 1680, children: 6 },
];

export const BRANDS = [
  { id: "BRD-TM", name: "TopMax", listings: 142, status: "verified", country: "CN" },
  { id: "BRD-AI", name: "Aisha", listings: 88, status: "verified", country: "CN" },
  { id: "BRD-PL", name: "PowerLine", listings: 64, status: "pending", country: "CN" },
  { id: "BRD-GS", name: "GoldStrand", listings: 210, status: "verified", country: "CN" },
  { id: "BRD-BX", name: "BoomX", listings: 38, status: "claimed", country: "CN" },
  { id: "BRD-KP", name: "KitchenPlus", listings: 96, status: "verified", country: "CN" },
  { id: "BRD-LE", name: "LearnEasy", listings: 22, status: "pending", country: "CN" },
];

export const COLLECTIONS = [
  { id: "COL-001", name: "Ramadan Essentials", listings: 48, active: true, slot: "Home Hero", ends: "2026-08-14" },
  { id: "COL-002", name: "Back-to-School NG", listings: 124, active: true, slot: "Market Row 1", ends: "2026-09-01" },
  { id: "COL-003", name: "Solar & Power", listings: 86, active: true, slot: "Category Spotlight", ends: "ongoing" },
  { id: "COL-004", name: "Beauty Pro Sellers", listings: 62, active: false, slot: "Draft", ends: "ΓÇö" },
];

export const PROMOTIONS = [
  { id: "PRM-2026-014", name: "Solar Week 2026", type: "Category discount", scope: "Electronics / Solar", discount: "15% OFF", uses: 412, budget: "$12,000", spent: "$4,820", status: "running", ends: "Jul 12" },
  { id: "PRM-2026-013", name: "First Order ΓÇö Importers", type: "Coupon trigger", scope: "All categories", discount: "$10 OFF", uses: 1820, budget: "$25,000", spent: "$18,200", status: "running", ends: "Aug 30" },
  { id: "PRM-2026-012", name: "Free Shipping CNΓåÆLAG", type: "Shipping promo", scope: "Air Express", discount: "FREE", uses: 96, budget: "$8,000", spent: "$3,140", status: "paused", ends: "Jul 01" },
  { id: "PRM-2026-011", name: "Spring Hair Bundle", type: "BOGO", scope: "Beauty / Hair", discount: "Buy 3 get 1", uses: 248, budget: "ΓÇö", spent: "ΓÇö", status: "ended", ends: "Jun 14" },
];

export const COUPONS = [
  { id: "CPN-WELCOME10", code: "WELCOME10", type: "Percent", value: "10%", uses: 4218, cap: 10000, minOrder: "$50", expires: "2026-12-31", status: "active" },
  { id: "CPN-SOLAR50", code: "SOLAR50", type: "Fixed", value: "$50", uses: 184, cap: 500, minOrder: "$500", expires: "2026-07-12", status: "active" },
  { id: "CPN-FREESHIP", code: "FREESHIP", type: "Shipping", value: "FREE", uses: 96, cap: 200, minOrder: "$200", expires: "2026-07-01", status: "paused" },
  { id: "CPN-RAMADAN", code: "RAMADAN25", type: "Percent", value: "25%", uses: 612, cap: 1000, minOrder: "$100", expires: "2026-04-10", status: "expired" },
];

export const BANNERS = [
  { id: "BAN-001", title: "Solar Week ΓÇö up to 15% OFF", placement: "Home Hero", locale: "NG", status: "live", ctr: "3.42%", impressions: 124000, ends: "Jul 12" },
  { id: "BAN-002", title: "Verified Suppliers Program", placement: "Market Top", locale: "All", status: "live", ctr: "1.18%", impressions: 88200, ends: "Ongoing" },
  { id: "BAN-003", title: "New: Air Express CNΓåÆLOS 5-day", placement: "Category ΓÇö Electronics", locale: "NG", status: "scheduled", ctr: "ΓÇö", impressions: 0, ends: "Jul 05" },
  { id: "BAN-004", title: "Hair Bundle Deals", placement: "Mobile Splash", locale: "NG", status: "draft", ctr: "ΓÇö", impressions: 0, ends: "ΓÇö" },
];

export const REVIEWS = [
  { id: "RVW-44021", listing: "LST-90412", listingTitle: "USB-C 100W Fast Charger Bundle", buyer: "Tunde A.", rating: 5, body: "Arrived in 8 days, NG plug fits perfectly. Will reorder.", status: "published", flagged: false, date: "2 hr ago" },
  { id: "RVW-44020", listing: "LST-90431", listingTitle: "Solar Inverter 3kW Hybrid", buyer: "Chidi O.", rating: 1, body: "Unit DOA. Seller unresponsive. Brand sticker looks fake.", status: "pending", flagged: true, date: "6 hr ago" },
  { id: "RVW-44019", listing: "LST-90428", listingTitle: "Hair Bundle Body Wave 18\"", buyer: "Amaka E.", rating: 5, body: "Premium quality, shed minimal. 4th order from GoldStrand.", status: "published", flagged: false, date: "1 day ago" },
  { id: "RVW-44018", listing: "LST-90446", listingTitle: "Children's Reading Tablet 7\"", buyer: "Fatima B.", rating: 2, body: "Storage advertised 32GB but only 16GB usable. Misleading.", status: "pending", flagged: true, date: "1 day ago" },
  { id: "RVW-44017", listing: "LST-90442", listingTitle: "Stainless Steel Cooking Pot Set", buyer: "Ngozi I.", rating: 4, body: "Solid set. One handle a bit loose but fixable.", status: "published", flagged: false, date: "2 days ago" },
];

export const ATTRIBUTES = [
  { id: "ATR-color", name: "Color", type: "Select", appliesTo: "Electronics, Beauty, Textiles", values: 24, required: true },
  { id: "ATR-voltage", name: "Voltage", type: "Select", appliesTo: "Electronics / Power, Solar", values: 6, required: true },
  { id: "ATR-plug", name: "Plug type", type: "Select", appliesTo: "Electronics", values: 8, required: true },
  { id: "ATR-fabric", name: "Fabric composition", type: "Text", appliesTo: "Textiles", values: 0, required: true },
  { id: "ATR-length", name: "Hair length", type: "Number", appliesTo: "Beauty / Hair", values: 0, required: true },
  { id: "ATR-capacity", name: "Capacity (kW)", type: "Number", appliesTo: "Electronics / Solar", values: 0, required: false },
  { id: "ATR-weight", name: "Net weight (kg)", type: "Number", appliesTo: "All", values: 0, required: true },
  { id: "ATR-origin", name: "Country of origin", type: "Select", appliesTo: "All", values: 18, required: true },
];

export const INVENTORY_ALERTS = [
  { id: "INV-90437", listing: "LST-90437", title: "Bluetooth Speaker BoomX Mini", seller: "Yiwu PowerLine Co.", level: "out", stock: 0, reorder: 100, sales7d: 42 },
  { id: "INV-90422", listing: "LST-90422", title: "Surge Protector 4-Outlet", seller: "Yiwu PowerLine Co.", level: "low", stock: 84, reorder: 200, sales7d: 28 },
  { id: "INV-90431", listing: "LST-90431", title: "Solar Inverter 3kW Hybrid", seller: "Shenzhen TopMax", level: "low", stock: 36, reorder: 60, sales7d: 6 },
  { id: "INV-90428", listing: "LST-90428", title: "Hair Bundle Body Wave 18\"", seller: "Qingdao GoldStrand", level: "watch", stock: 220, reorder: 200, sales7d: 92 },
];

export function fmtCNY(n: number) {
  return "CNY " + n.toLocaleString("en-US");
}
export function fmtNGN(n: number) {
  return "Γéª" + n.toLocaleString("en-US");
}

export function statusPillCatalog(s: Listing["status"]) {
  const map: Record<Listing["status"], { tone: BadgeTone; label: string }> = {
    active: { tone: "success", label: "Active" },
    pending: { tone: "warn", label: "Pending" },
    reported: { tone: "danger", label: "Reported" },
    draft: { tone: "neutral", label: "Draft" },
    delisted: { tone: "neutral", label: "Delisted" },
  };
  const m = map[s];
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

export function Pill({ tone, children }: { tone: BadgeTone | string; children: ReactNode }) {
  const mapped: Record<string, BadgeTone> = {
    success: "success",
    warn: "warn",
    danger: "danger",
    info: "info",
    neutral: "neutral",
    [T.success]: "success",
    [T.warn]: "warn",
    [T.danger]: "danger",
    [T.info]: "info",
    [T.muted]: "neutral",
    [T.sub]: "neutral",
  };
  const key = String(tone);
  const label = typeof children === "string" ? formatStatusLabel(children) : children;
  if (mapped[key]) return <StatusBadge tone={mapped[key]} dot={false}>{label}</StatusBadge>;
  return <StatusBadgeCustom color={key} label={typeof children === "string" ? formatStatusLabel(children) : String(children)} />;
}

export function Thumb({ src, alt = "", size = 36 }: { src: string; alt?: string; size?: number }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={size}
      height={size}
      className="rounded-lg shrink-0 object-cover"
      style={{
        width: size, height: size,
        background: T.bg, border: `1px solid ${T.border}`,
      }}
    />
  );
}

export function Card({ children, className = "", padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div
      className={`rounded-xl ${padded ? "p-4" : ""} ${className}`}
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted }}>
      {children}
    </p>
  );
}
