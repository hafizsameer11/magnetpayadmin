import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";
import { listWishlist, removeWish, subscribeWishlist, type WishItem } from "@/lib/wishlist";

export const Route = createFileRoute("/me/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — MagnetPay" }] }),
  component: WishlistPage,
});

const CNY_NGN = 215;
const cnyToNgn = (p: string) => {
  const n = parseFloat(p.replace(/[^\d.]/g, ""));
  if (!isFinite(n)) return "";
  return "₦" + Math.round(n * CNY_NGN).toLocaleString();
};

function WishlistPage() {
  const t = escrowTheme;
  const [items, setItems] = useState<WishItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(listWishlist());
    setReady(true);
    return subscribeWishlist(() => setItems(listWishlist()));
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div className="relative min-h-full pb-8" style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}>
          <header className="px-4 pt-12 pb-3 flex items-center justify-between">
            <Link to="/me" className="size-9 grid place-items-center rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <p className="text-[13px] font-bold">Wishlist</p>
            <span className="text-[11px] font-bold tabular-nums font-mono px-2 py-0.5 rounded-full" style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.muted }}>
              {items.length}
            </span>
          </header>

          {ready && items.length === 0 && (
            <section className="px-6 mt-16 text-center">
              <div className="mx-auto size-16 rounded-full grid place-items-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <Heart className="size-7" strokeWidth={2.2} style={{ color: t.muted }} />
              </div>
              <h2 className="mt-4 text-[16px] font-bold">No saved products yet</h2>
              <p className="mt-1 text-[12px]" style={{ color: t.muted }}>
                Tap the heart on any product to save it here for later.
              </p>
              <Link
                to="/market"
                className="mt-6 inline-flex items-center gap-1.5 h-11 px-4 rounded-2xl text-[12.5px] font-bold text-white"
                style={{ background: t.navy }}
              >
                <ShoppingBag className="size-4" strokeWidth={2.4} /> Browse marketplace
              </Link>
            </section>
          )}

          {items.length > 0 && (
            <section className="px-4 mt-3 grid grid-cols-2 gap-3">
              {items.map((p) => (
                <div key={p.id} className="rounded-[22px] overflow-hidden flex flex-col relative"
                  style={{ background: t.surface, boxShadow: "var(--mp-shadow-card)", border: `1px solid ${t.border}` }}>
                  <Link to="/market/product/$id" params={{ id: p.id }} className="block">
                    <div className="relative m-2 rounded-[16px] overflow-hidden aspect-square" style={{ background: t.bg }}>
                      <img src={p.img} alt={p.title} className="size-full object-cover" loading="lazy" width={512} height={512} />
                    </div>
                  </Link>
                  <button
                    onClick={() => removeWish(p.id)}
                    aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 size-7 rounded-full grid place-items-center active:scale-95"
                    style={{ background: "color-mix(in oklab, white 92%, transparent)", border: `1px solid ${t.border}` }}
                  >
                    <Trash2 className="size-3.5" strokeWidth={2.2} style={{ color: t.muted }} />
                  </button>
                  <Link to="/market/product/$id" params={{ id: p.id }} className="px-3 pb-3 pt-1 flex-1 flex flex-col">
                    <p className="text-[12px] font-semibold leading-tight line-clamp-2 min-h-[30px]" style={{ color: t.ink }}>{p.title}</p>
                    <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-[15px] font-bold tabular-nums font-mono" style={{ color: t.ink }}>{p.price}</p>
                      <p className="text-[10.5px] font-semibold tabular-nums font-mono" style={{ color: t.sub }}>≈ {cnyToNgn(p.price)}</p>
                    </div>
                    {p.moq !== undefined && (
                      <p className="mt-2 pt-2 text-[10px] font-semibold" style={{ borderTop: `1px solid ${t.border}`, color: t.muted }}>
                        MOQ <span className="tabular-nums font-mono" style={{ color: t.sub }}>{p.moq}</span>
                      </p>
                    )}
                  </Link>
                </div>
              ))}
            </section>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}
