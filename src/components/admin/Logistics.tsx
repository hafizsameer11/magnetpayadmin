import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { T } from "@/components/admin/AdminShell";
import { StatusBadgeCustom } from "@/components/admin/StatusBadge";
import { Card, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip } from "@/components/admin/Orders";
import { TablePagerFooter, useTablePage } from "@/components/admin/TablePager";

export { Card, fmtNGN, KPI, FlagEmoji, FilterBar, FilterChip };

export type ShipmentStatus = "label_created" | "picked_up" | "in_transit" | "customs" | "out_for_delivery" | "delivered" | "exception" | "returned";
export type Carrier = "MagnetExpress Air" | "MagnetExpress Sea" | "DHL Express" | "CN-Post Sea" | "Aramex" | "FedEx IP";

export type ShipmentLeg = { city: string; country: string; at: string; status: string; type: "origin" | "transit" | "customs" | "out" | "delivery" | "exception" };

export type Shipment = {
  id: string;
  orderId: string;
  buyer: string;
  buyerCountry: "NG" | "GH" | "KE";
  seller: string;
  carrier: Carrier;
  service: "Air Express" | "Air Economy" | "Sea LCL" | "Sea FCL" | "Courier";
  tracking: string;
  weightKg: number;
  pieces: number;
  declaredValueNGN: number;
  costNGN: number;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  pickup: string;
  eta: string;
  legs: ShipmentLeg[];
  exception?: { reason: string; since: string; severity: "low" | "high" };
  hsCode?: string;
  insurance: boolean;
  warehouseId?: string;
};

export const SHIPMENTS: Shipment[] = [
  { id: "SHP-44120", orderId: "ORD-528104", buyer: "Adaeze Okafor", buyerCountry: "NG", seller: "Shenzhen TopMax",
    carrier: "MagnetExpress Air", service: "Air Express", tracking: "MEX1Z9920411NG", weightKg: 12.4, pieces: 4,
    declaredValueNGN: 1576000, costNGN: 42000, status: "in_transit",
    origin: "Shenzhen, CN", destination: "Lagos, NG", pickup: "Jun 25, 14:00", eta: "Jul 04",
    insurance: true, hsCode: "8504.40", warehouseId: "WH-SZ1",
    legs: [
      { city: "Shenzhen", country: "CN", at: "Jun 25, 14:20", status: "Pickup by carrier", type: "origin" },
      { city: "Hong Kong", country: "HK", at: "Jun 26, 09:14", status: "Departed origin facility", type: "transit" },
      { city: "Doha", country: "QA", at: "Jun 27, 22:08", status: "Transit hub ΓÇö sorted", type: "transit" },
      { city: "Lagos", country: "NG", at: "Jun 28, 11:42", status: "Arrived at destination", type: "transit" },
    ] },
  { id: "SHP-44108", orderId: "ORD-528098", buyer: "Tolu Bankole", buyerCountry: "NG", seller: "Guangzhou Aisha",
    carrier: "CN-Post Sea", service: "Sea LCL", tracking: "CNP552980411NG", weightKg: 88.0, pieces: 6,
    declaredValueNGN: 780600, costNGN: 28500, status: "customs",
    origin: "Guangzhou, CN", destination: "Lagos, NG", pickup: "Jun 18, 08:00", eta: "Jul 09",
    insurance: false, hsCode: "5208.42", warehouseId: "WH-GZ1",
    legs: [
      { city: "Guangzhou", country: "CN", at: "Jun 18, 08:30", status: "Container sealed", type: "origin" },
      { city: "Singapore", country: "SG", at: "Jun 23, 11:00", status: "Transhipment", type: "transit" },
      { city: "Lagos Apapa", country: "NG", at: "Jun 27, 16:00", status: "Awaiting customs clearance", type: "customs" },
    ] },
  { id: "SHP-44091", orderId: "ORD-528077", buyer: "Kwame Asante", buyerCountry: "GH", seller: "Yiwu PowerLine",
    carrier: "DHL Express", service: "Air Express", tracking: "DHL44102239GH", weightKg: 24.8, pieces: 2,
    declaredValueNGN: 1683000, costNGN: 51000, status: "delivered",
    origin: "Yiwu, CN", destination: "Accra, GH", pickup: "Jun 18, 12:00", eta: "Jun 27",
    insurance: true, hsCode: "8504.40", warehouseId: "WH-YW1",
    legs: [
      { city: "Yiwu", country: "CN", at: "Jun 18, 12:14", status: "Pickup", type: "origin" },
      { city: "Shanghai PVG", country: "CN", at: "Jun 19, 02:30", status: "Departed hub", type: "transit" },
      { city: "Leipzig", country: "DE", at: "Jun 20, 18:00", status: "Transit hub", type: "transit" },
      { city: "Accra", country: "GH", at: "Jun 26, 09:00", status: "Customs cleared", type: "customs" },
      { city: "Accra", country: "GH", at: "Jun 26, 14:00", status: "Out for delivery", type: "out" },
      { city: "Accra ΓÇö Osu", country: "GH", at: "Jun 26, 16:20", status: "Delivered (signed K. ASANTE)", type: "delivery" },
    ] },
  { id: "SHP-44074", orderId: "ORD-528060", buyer: "Ngozi Eze", buyerCountry: "NG", seller: "Qingdao GoldStrand",
    carrier: "MagnetExpress Sea", service: "Sea LCL", tracking: "MEX2X8810044NG", weightKg: 142.0, pieces: 12,
    declaredValueNGN: 1302000, costNGN: 78000, status: "exception",
    origin: "Qingdao, CN", destination: "Lagos, NG", pickup: "Jun 14, 09:00", eta: "Jul 12",
    insurance: true, hsCode: "8517.62",
    exception: { reason: "Customs hold ΓÇö NCC compliance docs missing (SONCAP/FCC)", since: "Jun 24, 14:00", severity: "high" },
    legs: [
      { city: "Qingdao", country: "CN", at: "Jun 14, 10:00", status: "Pickup", type: "origin" },
      { city: "Lagos Apapa", country: "NG", at: "Jun 24, 14:00", status: "Customs hold ΓÇö NCC compliance", type: "exception" },
    ] },
  { id: "SHP-44036", orderId: "ORD-528022", buyer: "Mary Wanjiru", buyerCountry: "KE", seller: "Dongguan SunBead",
    carrier: "DHL Express", service: "Air Express", tracking: "DHL44102241KE", weightKg: 6.2, pieces: 1,
    declaredValueNGN: 681000, costNGN: 34000, status: "delivered",
    origin: "Dongguan, CN", destination: "Nairobi, KE", pickup: "Jun 10, 16:00", eta: "Jun 22",
    insurance: true, hsCode: "6703.00",
    legs: [
      { city: "Dongguan", country: "CN", at: "Jun 10, 16:30", status: "Pickup", type: "origin" },
      { city: "Nairobi", country: "KE", at: "Jun 22, 13:00", status: "Delivered", type: "delivery" },
    ] },
  { id: "SHP-44022", orderId: "ORD-528013", buyer: "James Mwangi", buyerCountry: "KE", seller: "Shenzhen TopMax",
    carrier: "Aramex", service: "Air Economy", tracking: "ARMX998120KE", weightKg: 4.0, pieces: 1,
    declaredValueNGN: 184000, costNGN: 9800, status: "out_for_delivery",
    origin: "Shenzhen, CN", destination: "Mombasa, KE", pickup: "Jun 22, 10:00", eta: "Jun 29",
    insurance: false, hsCode: "8504.40",
    legs: [
      { city: "Shenzhen", country: "CN", at: "Jun 22, 10:14", status: "Pickup", type: "origin" },
      { city: "Dubai", country: "AE", at: "Jun 24, 02:00", status: "Transit", type: "transit" },
      { city: "Mombasa", country: "KE", at: "Jun 28, 08:00", status: "Out for delivery", type: "out" },
    ] },
  { id: "SHP-44008", orderId: "ORD-527990", buyer: "Ibrahim Yusuf", buyerCountry: "NG", seller: "Foshan IronCraft",
    carrier: "FedEx IP", service: "Air Express", tracking: "FX771029900NG", weightKg: 18.0, pieces: 3,
    declaredValueNGN: 572400, costNGN: 31000, status: "returned",
    origin: "Foshan, CN", destination: "Abuja, NG", pickup: "Jun 20, 11:00", eta: "Jun 30",
    insurance: true, hsCode: "7323.99",
    exception: { reason: "Buyer refused delivery ΓÇö wrong variant", since: "Jun 26, 10:00", severity: "low" },
    legs: [
      { city: "Foshan", country: "CN", at: "Jun 20, 11:30", status: "Pickup", type: "origin" },
      { city: "Abuja", country: "NG", at: "Jun 26, 09:30", status: "Delivery attempted ΓÇö refused", type: "exception" },
      { city: "Abuja", country: "NG", at: "Jun 27, 12:00", status: "Return to origin in progress", type: "transit" },
    ] },
  { id: "SHP-44002", orderId: "ORD-527964", buyer: "Chiamaka Obi", buyerCountry: "NG", seller: "Hangzhou WokWise",
    carrier: "CN-Post Sea", service: "Sea LCL", tracking: "CNP552980388NG", weightKg: 96.0, pieces: 10,
    declaredValueNGN: 871000, costNGN: 38000, status: "exception",
    origin: "Hangzhou, CN", destination: "Lagos, NG", pickup: "Jun 02, 09:00", eta: "Jun 30",
    insurance: false, hsCode: "7323.99",
    exception: { reason: "Items damaged on arrival ΓÇö 2 cartons crushed", since: "Jun 24, 14:00", severity: "high" },
    legs: [
      { city: "Hangzhou", country: "CN", at: "Jun 02, 09:00", status: "Pickup", type: "origin" },
      { city: "Lagos", country: "NG", at: "Jun 24, 14:00", status: "Damaged on arrival", type: "exception" },
    ] },
  { id: "SHP-43990", orderId: "ORD-527942", buyer: "Joy Mensah", buyerCountry: "GH", seller: "Yiwu PowerLine",
    carrier: "MagnetExpress Air", service: "Air Express", tracking: "MEX1Z9920399GH", weightKg: 3.6, pieces: 2,
    declaredValueNGN: 218000, costNGN: 12400, status: "label_created",
    origin: "Yiwu, CN", destination: "Kumasi, GH", pickup: "Pending pickup", eta: "Jul 06",
    insurance: false, hsCode: "8504.40", warehouseId: "WH-YW1",
    legs: [
      { city: "Yiwu", country: "CN", at: "Jun 28, 09:00", status: "Label created ΓÇö awaiting pickup", type: "origin" },
    ] },
  { id: "SHP-43974", orderId: "ORD-527908", buyer: "Femi Adeyemi", buyerCountry: "NG", seller: "Xiamen LiteBox",
    carrier: "MagnetExpress Air", service: "Air Express", tracking: "MEX1Z9920374NG", weightKg: 7.8, pieces: 2,
    declaredValueNGN: 412000, costNGN: 22000, status: "picked_up",
    origin: "Xiamen, CN", destination: "Port Harcourt, NG", pickup: "Jun 28, 11:00", eta: "Jul 07",
    insurance: true, hsCode: "9403.20",
    legs: [
      { city: "Xiamen", country: "CN", at: "Jun 28, 11:14", status: "Picked up by carrier", type: "origin" },
    ] },
];

export function findShipment(id: string | undefined) {
  if (!id) return SHIPMENTS[0];
  return SHIPMENTS.find((s) => s.id === id || s.id.endsWith(id)) ?? SHIPMENTS[0];
}

export const STATUS_META: Record<ShipmentStatus, { c: string; label: string }> = {
  label_created:    { c: T.muted,   label: "Label created" },
  picked_up:        { c: T.info,    label: "Picked up" },
  in_transit:       { c: "#7C3AED", label: "In transit" },
  customs:          { c: T.warn,    label: "Customs" },
  out_for_delivery: { c: T.accent,  label: "Out for delivery" },
  delivered:        { c: T.success, label: "Delivered" },
  exception:        { c: T.danger,  label: "Exception" },
  returned:         { c: T.danger,  label: "Returned" },
};

export function statusPillShip(s: ShipmentStatus) {
  const m = STATUS_META[s];
  return <StatusBadgeCustom color={m.c} label={m.label} />;
}

export function ShipmentTable({ rows }: { rows: Shipment[] }) {
  const pager = useTablePage(rows);
  return (
    <Card padded={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr style={{ background: T.bg, color: T.muted }} className="text-left text-[10px] font-bold uppercase tracking-[0.14em]">
              <th className="px-2 py-2.5 pl-4">Shipment</th>
              <th className="px-2 py-2.5">Carrier ┬╖ Service</th>
              <th className="px-2 py-2.5">Route</th>
              <th className="px-2 py-2.5 text-right">Weight</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">ETA</th>
              <th className="px-2 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {pager.slice.map((s) => (
              <tr key={s.id} className="border-t hover:bg-black/[0.015] transition" style={{ borderColor: T.border }}>
                <td className="px-2 py-3 pl-4">
                  <Link to="/admin/shipments/$id" params={{ id: s.id }} className="font-bold tabular-nums hover:underline" style={{ color: T.ink, fontFamily: "'JetBrains Mono', monospace" }}>{s.id}</Link>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{s.tracking}</p>
                </td>
                <td className="px-2 py-3">
                  <p className="font-medium text-[12px]">{s.carrier}</p>
                  <p className="text-[10.5px]" style={{ color: T.muted }}>{s.service}</p>
                </td>
                <td className="px-2 py-3">
                  <p className="text-[11.5px] font-medium">{s.origin} ΓåÆ {s.destination}</p>
                  <p className="text-[10.5px] flex items-center gap-1" style={{ color: T.muted }}>
                    <FlagEmoji c={"CN"} /> ΓåÆ <FlagEmoji c={s.buyerCountry} /> {s.buyer}
                  </p>
                </td>
                <td className="px-2 py-3 text-right">
                  <p className="font-bold tabular-nums text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.weightKg} kg</p>
                  <p className="text-[10.5px] tabular-nums" style={{ color: T.muted, fontFamily: "'JetBrains Mono', monospace" }}>{s.pieces} pcs</p>
                </td>
                <td className="px-2 py-3">{statusPillShip(s.status)}</td>
                <td className="px-2 py-3 text-[11px] tabular-nums" style={{ color: T.sub, fontFamily: "'JetBrains Mono', monospace" }}>{s.eta}</td>
                <td className="px-2 py-3">
                  <Link to="/admin/shipments/$id" params={{ id: s.id }} className="size-7 grid place-items-center rounded-md hover:bg-black/5">
                    <MoreHorizontal className="size-4" style={{ color: T.muted }} />
                  </Link>
                </td>
              </tr>
            ))}
            {!pager.total && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[12px]" style={{ color: T.muted }}>No shipments match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagerFooter
        from={pager.from}
        to={pager.to}
        total={pager.total}
        page={pager.page}
        pageCount={pager.pageCount}
        onPrev={() => pager.setPage((p) => Math.max(0, p - 1))}
        onNext={() => pager.setPage((p) => Math.min(pager.pageCount - 1, p + 1))}
      />
    </Card>
  );
}

// ===== Carriers =====
export type CarrierConfig = {
  id: string;
  name: Carrier;
  logo: string;
  active: boolean;
  services: string[];
  countries: string[];
  monthlyVolume: number;
  onTimePct: number;
  exceptionsPct: number;
  avgTransitDays: number;
  contractEnds: string;
  apiStatus: "healthy" | "degraded" | "down";
  credentials: { label: string; value: string; masked?: boolean }[];
  rateCard: { lane: string; service: string; baseNGN: number; perKgNGN: number; minKg: number }[];
};

export const CARRIERS: CarrierConfig[] = [
  {
    id: "CAR-MEX", name: "MagnetExpress Air", logo: "ME", active: true,
    services: ["Air Express", "Air Economy", "Same-day pickup"],
    countries: ["CN", "NG", "GH", "KE", "ZA"],
    monthlyVolume: 4128, onTimePct: 94.2, exceptionsPct: 2.1, avgTransitDays: 6,
    contractEnds: "2027-03-31", apiStatus: "healthy",
    credentials: [
      { label: "API Key", value: "mex_live_ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó8821", masked: true },
      { label: "Account Number", value: "ME-NG-44120" },
      { label: "Webhook secret", value: "ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó", masked: true },
    ],
    rateCard: [
      { lane: "CN ΓåÆ NG", service: "Air Express", baseNGN: 12000, perKgNGN: 2400, minKg: 0.5 },
      { lane: "CN ΓåÆ NG", service: "Air Economy", baseNGN: 8000,  perKgNGN: 1800, minKg: 0.5 },
      { lane: "CN ΓåÆ GH", service: "Air Express", baseNGN: 14000, perKgNGN: 2600, minKg: 0.5 },
      { lane: "CN ΓåÆ KE", service: "Air Express", baseNGN: 13500, perKgNGN: 2500, minKg: 0.5 },
    ],
  },
  {
    id: "CAR-MES", name: "MagnetExpress Sea", logo: "MS", active: true,
    services: ["Sea LCL", "Sea FCL", "Door-to-door"],
    countries: ["CN", "NG", "GH", "KE"],
    monthlyVolume: 612, onTimePct: 87.8, exceptionsPct: 4.4, avgTransitDays: 28,
    contractEnds: "2026-12-31", apiStatus: "healthy",
    credentials: [
      { label: "API Key", value: "mes_live_ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó4408", masked: true },
      { label: "Account Number", value: "MS-NG-9920" },
    ],
    rateCard: [
      { lane: "CN ΓåÆ NG", service: "Sea LCL", baseNGN: 4000, perKgNGN: 380, minKg: 50 },
      { lane: "CN ΓåÆ NG", service: "Sea FCL (20ft)", baseNGN: 2200000, perKgNGN: 0, minKg: 0 },
      { lane: "CN ΓåÆ GH", service: "Sea LCL", baseNGN: 4400, perKgNGN: 420, minKg: 50 },
    ],
  },
  {
    id: "CAR-DHL", name: "DHL Express", logo: "DH", active: true,
    services: ["Air Express", "Courier"],
    countries: ["CN", "NG", "GH", "KE", "ZA", "EG", "MA"],
    monthlyVolume: 2208, onTimePct: 96.8, exceptionsPct: 1.2, avgTransitDays: 5,
    contractEnds: "2026-06-30", apiStatus: "degraded",
    credentials: [
      { label: "Site ID", value: "MGNTPY01" },
      { label: "API Password", value: "ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó2208", masked: true },
      { label: "Account", value: "DHL-NG-44102239" },
    ],
    rateCard: [
      { lane: "CN ΓåÆ NG", service: "Air Express", baseNGN: 18000, perKgNGN: 3200, minKg: 0.5 },
      { lane: "CN ΓåÆ GH", service: "Air Express", baseNGN: 19500, perKgNGN: 3400, minKg: 0.5 },
      { lane: "CN ΓåÆ KE", service: "Air Express", baseNGN: 17800, perKgNGN: 3100, minKg: 0.5 },
    ],
  },
  {
    id: "CAR-CNP", name: "CN-Post Sea", logo: "CP", active: true,
    services: ["Sea LCL", "Bulk freight"],
    countries: ["CN", "NG", "GH", "KE", "TZ"],
    monthlyVolume: 488, onTimePct: 81.4, exceptionsPct: 6.8, avgTransitDays: 32,
    contractEnds: "2026-09-30", apiStatus: "healthy",
    credentials: [
      { label: "API Key", value: "cnp_live_ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó0411", masked: true },
    ],
    rateCard: [
      { lane: "CN ΓåÆ NG", service: "Sea LCL", baseNGN: 3200, perKgNGN: 320, minKg: 80 },
      { lane: "CN ΓåÆ GH", service: "Sea LCL", baseNGN: 3600, perKgNGN: 360, minKg: 80 },
    ],
  },
  {
    id: "CAR-ARM", name: "Aramex", logo: "AR", active: true,
    services: ["Air Economy", "Courier"],
    countries: ["CN", "NG", "KE", "AE"],
    monthlyVolume: 412, onTimePct: 89.4, exceptionsPct: 3.2, avgTransitDays: 8,
    contractEnds: "2026-12-31", apiStatus: "healthy",
    credentials: [
      { label: "Username", value: "magnetpay@ops" },
      { label: "API Password", value: "ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó8841", masked: true },
    ],
    rateCard: [
      { lane: "CN ΓåÆ KE", service: "Air Economy", baseNGN: 8800, perKgNGN: 1900, minKg: 0.5 },
      { lane: "CN ΓåÆ NG", service: "Air Economy", baseNGN: 9200, perKgNGN: 2000, minKg: 0.5 },
    ],
  },
  {
    id: "CAR-FDX", name: "FedEx IP", logo: "FX", active: false,
    services: ["Air Express"],
    countries: ["CN", "NG", "GH", "ZA"],
    monthlyVolume: 88, onTimePct: 95.1, exceptionsPct: 2.4, avgTransitDays: 5,
    contractEnds: "2025-12-31", apiStatus: "down",
    credentials: [
      { label: "Account", value: "FX-771029900" },
      { label: "API Key", value: "fx_ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó2299", masked: true },
    ],
    rateCard: [
      { lane: "CN ΓåÆ NG", service: "Air Express", baseNGN: 19200, perKgNGN: 3400, minKg: 0.5 },
    ],
  },
];

export function findCarrier(id: string | undefined) {
  if (!id) return CARRIERS[0];
  return CARRIERS.find((c) => c.id === id || c.id.endsWith(id) || c.name === id) ?? CARRIERS[0];
}

// ===== Warehouses =====
export type Warehouse = {
  id: string;
  name: string;
  type: "consolidation" | "fulfillment" | "returns" | "bonded";
  country: "NG" | "GH" | "KE" | "CN";
  city: string;
  address: string;
  capacityM3: number;
  usedM3: number;
  pendingInbound: number;
  pendingOutbound: number;
  staff: number;
  manager: string;
  hours: string;
  services: string[];
};

export const WAREHOUSES: Warehouse[] = [
  { id: "WH-SZ1", name: "Shenzhen Consolidation Hub", type: "consolidation", country: "CN", city: "Shenzhen", address: "Bao'an District, Hangcheng St 8th Industrial Zone", capacityM3: 4200, usedM3: 3088, pendingInbound: 142, pendingOutbound: 88, staff: 24, manager: "Li Wei", hours: "24/7", services: ["Consolidation", "QC inspection", "Repackaging", "Photo verification"] },
  { id: "WH-GZ1", name: "Guangzhou Sea Freight Hub", type: "consolidation", country: "CN", city: "Guangzhou", address: "Baiyun District, Shihua Rd 102", capacityM3: 6800, usedM3: 4128, pendingInbound: 88, pendingOutbound: 42, staff: 18, manager: "Zhang Mei", hours: "MonΓÇôSat 07:00ΓÇô22:00", services: ["Container loading", "Pallet wrapping", "Bonded storage"] },
  { id: "WH-YW1", name: "Yiwu Small Goods Hub", type: "consolidation", country: "CN", city: "Yiwu", address: "Beiyuan St, International Trade City Sec 3", capacityM3: 2200, usedM3: 1480, pendingInbound: 68, pendingOutbound: 22, staff: 12, manager: "Chen Hao", hours: "MonΓÇôSat 08:00ΓÇô20:00", services: ["Consolidation", "Small parcel sortation"] },
  { id: "WH-LOS", name: "Lagos Fulfillment Center", type: "fulfillment", country: "NG", city: "Lagos", address: "Lekki Free Zone, Plot 22 Logistics Park", capacityM3: 3800, usedM3: 2204, pendingInbound: 42, pendingOutbound: 188, staff: 32, manager: "Funmi Adekunle", hours: "24/7", services: ["Last-mile dispatch", "Returns", "B2C pick-pack"] },
  { id: "WH-ABV", name: "Abuja Returns Depot", type: "returns", country: "NG", city: "Abuja", address: "Idu Industrial Area, Block 14", capacityM3: 1200, usedM3: 420, pendingInbound: 18, pendingOutbound: 0, staff: 8, manager: "Aisha Mohammed", hours: "MonΓÇôFri 08:00ΓÇô18:00", services: ["Returns inspection", "Refurbishment", "Disposal"] },
  { id: "WH-ACC", name: "Accra Fulfillment Center", type: "fulfillment", country: "GH", city: "Accra", address: "Tema Industrial Area, Plot 4", capacityM3: 2200, usedM3: 1620, pendingInbound: 22, pendingOutbound: 88, staff: 14, manager: "Kwame Asante", hours: "24/7", services: ["Last-mile dispatch", "Customs brokerage"] },
  { id: "WH-NBO", name: "Nairobi Bonded Warehouse", type: "bonded", country: "KE", city: "Nairobi", address: "Industrial Area, Lusaka Rd 22", capacityM3: 2800, usedM3: 1240, pendingInbound: 32, pendingOutbound: 42, staff: 16, manager: "Mary Wanjiru", hours: "24/7", services: ["Bonded storage", "Customs clearance", "Last-mile"] },
];

export function findWarehouse(id: string | undefined) {
  if (!id) return WAREHOUSES[0];
  return WAREHOUSES.find((w) => w.id === id || w.id.endsWith(id)) ?? WAREHOUSES[0];
}

// ===== Zones =====
export type ShippingZone = {
  id: string;
  name: string;
  countries: string[];
  cities?: string[];
  carriers: string[];
  baseTransitDays: number;
  surchargesPct: number;
  active: boolean;
  shipmentsLast30d: number;
};

export const ZONES: ShippingZone[] = [
  { id: "ZON-WAF", name: "West Africa", countries: ["NG", "GH", "BJ", "TG"], carriers: ["MagnetExpress Air", "DHL Express", "CN-Post Sea"], baseTransitDays: 9, surchargesPct: 4.5, active: true, shipmentsLast30d: 3408 },
  { id: "ZON-EAF", name: "East Africa", countries: ["KE", "TZ", "UG", "RW"], carriers: ["MagnetExpress Air", "DHL Express", "Aramex"], baseTransitDays: 11, surchargesPct: 5.2, active: true, shipmentsLast30d: 1240 },
  { id: "ZON-CN-CO", name: "China ΓÇö Coastal Origin", countries: ["CN"], cities: ["Shenzhen", "Guangzhou", "Xiamen", "Shanghai", "Hangzhou"], carriers: ["MagnetExpress Air", "MagnetExpress Sea", "CN-Post Sea", "DHL Express"], baseTransitDays: 0, surchargesPct: 0, active: true, shipmentsLast30d: 4640 },
  { id: "ZON-CN-IN", name: "China ΓÇö Inland Origin", countries: ["CN"], cities: ["Yiwu", "Qingdao", "Foshan", "Dongguan"], carriers: ["MagnetExpress Air", "CN-Post Sea"], baseTransitDays: 1, surchargesPct: 1.5, active: true, shipmentsLast30d: 1108 },
  { id: "ZON-LOS", name: "Lagos Metro (last-mile)", countries: ["NG"], cities: ["Lagos", "Ikeja", "Lekki", "Ajah"], carriers: ["MagnetExpress Air"], baseTransitDays: 1, surchargesPct: 0, active: true, shipmentsLast30d: 2208 },
  { id: "ZON-NER", name: "Northern Nigeria", countries: ["NG"], cities: ["Abuja", "Kano", "Kaduna"], carriers: ["MagnetExpress Air", "DHL Express"], baseTransitDays: 3, surchargesPct: 8.0, active: true, shipmentsLast30d: 612 },
  { id: "ZON-SAF", name: "Southern Africa", countries: ["ZA", "BW", "ZM"], carriers: ["DHL Express", "FedEx IP"], baseTransitDays: 12, surchargesPct: 6.8, active: false, shipmentsLast30d: 22 },
];

// ===== Pickup points =====
export type PickupPoint = {
  id: string;
  name: string;
  city: string;
  country: "NG" | "GH" | "KE";
  type: "Locker" | "Partner store" | "Office";
  hours: string;
  partner: string;
  active: boolean;
  parcelsLast7d: number;
  capacity: number;
  currentParcels: number;
};

export const PICKUP_POINTS: PickupPoint[] = [
  { id: "PP-LOS-001", name: "Magnet Locker ΓÇö Lekki Phase 1", city: "Lagos", country: "NG", type: "Locker", hours: "24/7", partner: "MagnetPay", active: true, parcelsLast7d: 188, capacity: 240, currentParcels: 142 },
  { id: "PP-LOS-002", name: "Magnet Locker ΓÇö Victoria Island", city: "Lagos", country: "NG", type: "Locker", hours: "24/7", partner: "MagnetPay", active: true, parcelsLast7d: 162, capacity: 240, currentParcels: 188 },
  { id: "PP-LOS-003", name: "Shop & Pickup ΓÇö Ikeja City Mall", city: "Lagos", country: "NG", type: "Partner store", hours: "MonΓÇôSun 09:00ΓÇô22:00", partner: "Shoprite", active: true, parcelsLast7d: 88, capacity: 120, currentParcels: 42 },
  { id: "PP-ABV-001", name: "Magnet Locker ΓÇö Wuse 2", city: "Abuja", country: "NG", type: "Locker", hours: "24/7", partner: "MagnetPay", active: true, parcelsLast7d: 68, capacity: 180, currentParcels: 88 },
  { id: "PP-ABV-002", name: "Pickup Office ΓÇö Maitama", city: "Abuja", country: "NG", type: "Office", hours: "MonΓÇôFri 08:00ΓÇô18:00, Sat 09:00ΓÇô14:00", partner: "MagnetPay", active: true, parcelsLast7d: 42, capacity: 100, currentParcels: 22 },
  { id: "PP-ACC-001", name: "Magnet Locker ΓÇö Osu Oxford St", city: "Accra", country: "GH", type: "Locker", hours: "24/7", partner: "MagnetPay", active: true, parcelsLast7d: 88, capacity: 180, currentParcels: 122 },
  { id: "PP-ACC-002", name: "Pickup Office ΓÇö East Legon", city: "Accra", country: "GH", type: "Office", hours: "MonΓÇôSat 08:00ΓÇô19:00", partner: "MagnetPay", active: true, parcelsLast7d: 42, capacity: 80, currentParcels: 32 },
  { id: "PP-NBO-001", name: "Pickup Office ΓÇö Westlands", city: "Nairobi", country: "KE", type: "Office", hours: "MonΓÇôSat 08:00ΓÇô19:00", partner: "MagnetPay", active: true, parcelsLast7d: 62, capacity: 120, currentParcels: 48 },
  { id: "PP-NBO-002", name: "Partner Pickup ΓÇö Naivas Karen", city: "Nairobi", country: "KE", type: "Partner store", hours: "MonΓÇôSun 08:00ΓÇô22:00", partner: "Naivas", active: false, parcelsLast7d: 0, capacity: 60, currentParcels: 0 },
];

// ===== Labels =====
export type LabelJob = {
  id: string;
  shipmentId: string;
  carrier: Carrier;
  format: "4x6 PDF" | "A4 PDF" | "ZPL (Zebra)" | "PNG";
  status: "queued" | "rendering" | "ready" | "printed" | "failed";
  pages: number;
  createdAt: string;
  by: string;
  error?: string;
};

export const LABEL_JOBS: LabelJob[] = [
  { id: "LBL-99821", shipmentId: "SHP-44120", carrier: "MagnetExpress Air", format: "4x6 PDF", status: "ready", pages: 1, createdAt: "12 min ago", by: "Funmi A." },
  { id: "LBL-99820", shipmentId: "SHP-43974", carrier: "MagnetExpress Air", format: "4x6 PDF", status: "printed", pages: 1, createdAt: "1 hr ago", by: "Daniel K." },
  { id: "LBL-99819", shipmentId: "SHP-44108", carrier: "CN-Post Sea", format: "A4 PDF", status: "ready", pages: 6, createdAt: "1 hr ago", by: "System" },
  { id: "LBL-99818", shipmentId: "SHP-44022", carrier: "Aramex", format: "ZPL (Zebra)", status: "rendering", pages: 1, createdAt: "2 hr ago", by: "Funmi A." },
  { id: "LBL-99817", shipmentId: "SHP-43990", carrier: "MagnetExpress Air", format: "4x6 PDF", status: "queued", pages: 2, createdAt: "3 hr ago", by: "System" },
  { id: "LBL-99816", shipmentId: "SHP-44074", carrier: "MagnetExpress Sea", format: "A4 PDF", status: "failed", pages: 12, createdAt: "5 hr ago", by: "System", error: "Customs invoice missing ΓÇö required for HS 8517.62" },
  { id: "LBL-99815", shipmentId: "SHP-44091", carrier: "DHL Express", format: "4x6 PDF", status: "printed", pages: 2, createdAt: "1 day ago", by: "Daniel K." },
  { id: "LBL-99814", shipmentId: "SHP-44002", carrier: "CN-Post Sea", format: "A4 PDF", status: "printed", pages: 10, createdAt: "2 days ago", by: "System" },
];

// ===== Customs / HS codes =====
export type HSCode = {
  code: string;
  description: string;
  category: string;
  dutyPctNG: number;
  dutyPctGH: number;
  dutyPctKE: number;
  vatPct: number;
  restrictedIn: string[];
  requiresCert: string[];
  shipmentsLast30d: number;
};

export const HS_CODES: HSCode[] = [
  { code: "8504.40", description: "Static converters / power adapters", category: "Electronics", dutyPctNG: 10, dutyPctGH: 12.5, dutyPctKE: 10, vatPct: 7.5, restrictedIn: [], requiresCert: ["SONCAP (NG)", "GS (GH)"], shipmentsLast30d: 1208 },
  { code: "8517.62", description: "Telecom apparatus (modems, routers)", category: "Telecom", dutyPctNG: 20, dutyPctGH: 20, dutyPctKE: 25, vatPct: 7.5, restrictedIn: [], requiresCert: ["NCC type-approval (NG)", "NCA (GH)", "CAK (KE)"], shipmentsLast30d: 488 },
  { code: "5208.42", description: "Cotton fabrics, woven, dyed", category: "Textiles", dutyPctNG: 35, dutyPctGH: 20, dutyPctKE: 25, vatPct: 7.5, restrictedIn: ["NG (seasonal import ban)"], requiresCert: [], shipmentsLast30d: 612 },
  { code: "7323.99", description: "Cookware, iron/steel, household", category: "Kitchenware", dutyPctNG: 20, dutyPctGH: 20, dutyPctKE: 25, vatPct: 7.5, restrictedIn: [], requiresCert: ["SON (NG)"], shipmentsLast30d: 288 },
  { code: "9403.20", description: "Metal furniture (other than office)", category: "Furniture", dutyPctNG: 20, dutyPctGH: 20, dutyPctKE: 25, vatPct: 7.5, restrictedIn: [], requiresCert: [], shipmentsLast30d: 142 },
  { code: "6703.00", description: "Human hair, processed/prepared", category: "Beauty", dutyPctNG: 20, dutyPctGH: 20, dutyPctKE: 25, vatPct: 7.5, restrictedIn: [], requiresCert: ["NAFDAC (NG)"], shipmentsLast30d: 188 },
  { code: "8471.30", description: "Portable digital ADP machines Γëñ10kg (tablets)", category: "Electronics", dutyPctNG: 5, dutyPctGH: 5, dutyPctKE: 0, vatPct: 7.5, restrictedIn: [], requiresCert: ["NCC type-approval (NG)"], shipmentsLast30d: 88 },
  { code: "8544.42", description: "Electric conductors w/ connectors Γëñ1000V (cables)", category: "Electronics", dutyPctNG: 15, dutyPctGH: 12.5, dutyPctKE: 10, vatPct: 7.5, restrictedIn: [], requiresCert: ["SONCAP (NG)"], shipmentsLast30d: 412 },
];
