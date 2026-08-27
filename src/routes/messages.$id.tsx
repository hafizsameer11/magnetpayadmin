import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Languages } from "lucide-react";
import {
  ChevronLeft,
  Send,
  Paperclip,
  Star,
  ShieldCheck,
  FileText,
  Package2,
  CheckCheck,
  Phone,
  MoreVertical,
  Languages as LanguagesIcon,
  X,
  Search,
  BellOff,
  Pin,
  Archive,
  Flag,
  Trash2,
  UserX,
  FileSearch,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/messages/$id")({
  head: () => ({ meta: [{ title: "Chat — MagnetPay" }] }),
  component: Thread,
});

type Attach =
  | { kind: "quote"; ref: string; title: string; price: string; lead: string }
  | { kind: "order"; ref: string; title: string; status: string; total: string }
  | { kind: "escrow"; ref: string; title: string; held: string; ms: string };

type Msg = {
  who: "you" | "them" | "system";
  text?: string;
  time: string;
  read?: boolean;
  attach?: Attach;
  file?: { name: string; size: string };
};

const SEED: Msg[] = [
  { who: "system", text: "Quote thread opened · Q-441", time: "Yesterday" },
  {
    who: "them",
    text: "Hi Chidi, attaching our latest quote for the 200-unit run.",
    time: "14:02",
    attach: {
      kind: "quote",
      ref: "Q-441",
      title: "Pump body PB-A2 · 200 units",
      price: "¥54/unit",
      lead: "21d",
    },
  },
  { who: "you", text: "Can you match ¥49 if I bump to 300 units?", time: "14:12", read: true },
  {
    who: "them",
    text: "We can do ¥51 at 300, same FOB Guangzhou terms.",
    time: "14:18",
    attach: {
      kind: "quote",
      ref: "Q-441",
      title: "Pump body PB-A2 · 300 units",
      price: "¥51/unit",
      lead: "21d",
    },
  },
  {
    who: "you",
    time: "14:20",
    read: true,
    file: { name: "Spec-sheet-PB-A2.pdf", size: "1.2 MB" },
  },
  { who: "system", text: "Order placed · funds escrowed", time: "Today · 09:04" },
  {
    who: "them",
    text: "Production confirmed. We'll share QC photos at cartoning.",
    time: "09:15",
    attach: {
      kind: "order",
      ref: "O-1187",
      title: "200 × Pump body PB-A2",
      status: "In production",
      total: "¥13,297.60",
    },
  },
  {
    who: "you",
    text: "Great. Heads-up: inspection will be SGS Lagos on arrival.",
    time: "09:42",
    read: true,
    attach: {
      kind: "escrow",
      ref: "E-2204",
      title: "Milestone breakdown",
      held: "¥13,297.60",
      ms: "1 of 4 released",
    },
  },
];

function Thread() {
  const t = escrowTheme;
  const navigate = useNavigate();
  const { id } = useParams({ from: "/messages/$id" });
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);

  // Menu-driven state
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [sharedOpen, setSharedOpen] = useState(false);
  type Confirm = {
    title: string;
    desc: string;
    cta: string;
    tone: "warn" | "danger";
    onConfirm: () => void;
  };
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };
  const leaveThread = (msg: string) => {
    flash(msg);
    setTimeout(() => navigate({ to: "/messages" }), 400);
  };


  const LANGUAGES = [
    { code: "zh", label: "Mandarin Chinese", flag: "🇨🇳", sample: "你好,我想确认这份报价的交货期。" },
    { code: "en", label: "English", flag: "🇬🇧", sample: "Hi, I'd like to confirm the lead time on this quote." },
  ];

  const runTranslate = async (lang: typeof LANGUAGES[number]) => {
    if (!draft.trim()) return;
    setTranslating(lang.label);
    await new Promise((r) => setTimeout(r, 600));
    setDraft(lang.sample);
    setTranslating(null);
    setAiOpen(false);
  };

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { who: "you", text: draft.trim(), time: "now", read: false }]);
    setDraft("");
  };

  const quick = ["Confirm order", "Send proforma", "Need lead time", "Counter offer"];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
      />
      <PhoneFrame background={t.navy}>
        <div
          className="relative min-h-full flex flex-col"
          style={{ background: t.bg, color: t.ink, fontFamily: "'Inter', sans-serif" }}
        >
          <header
            className="px-3 pt-12 pb-3 flex items-center gap-2 shrink-0"
            style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
          >
            <Link
              to="/messages"
              className="size-9 grid place-items-center rounded-full shrink-0"
              style={{ background: t.bg, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div
              className="size-9 rounded-full grid place-items-center text-[11px] font-bold shrink-0"
              style={{ background: `${t.navy}10`, color: t.navy }}
            >
              GH
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold truncate">Guangzhou Huayi Co.</p>
              <p
                className="text-[10px] flex items-center gap-1.5"
                style={{ color: t.muted }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: t.success }}
                />
                Online ·{" "}
                <Star className="size-2.5 fill-current" style={{ color: t.warn }} />
                4.8
                {pinned && (
                  <span className="inline-flex items-center gap-0.5" style={{ color: t.accent }}>
                    · <Pin className="size-2.5" strokeWidth={2.6} /> Pinned
                  </span>
                )}
                {muted && (
                  <span className="inline-flex items-center gap-0.5" style={{ color: t.muted }}>
                    · <BellOff className="size-2.5" strokeWidth={2.6} /> Muted
                  </span>
                )}
              </p>
            </div>
            <button
              className="size-9 grid place-items-center rounded-full shrink-0"
              style={{ background: t.bg, border: `1px solid ${t.border}`, color: t.sub }}
            >
              <Phone className="size-4" strokeWidth={2.4} />
            </button>
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="size-9 grid place-items-center rounded-full"
                style={{
                  background: menuOpen ? t.navy : t.bg,
                  border: `1px solid ${menuOpen ? t.navy : t.border}`,
                  color: menuOpen ? "#fff" : t.sub,
                }}
              >
                <MoreVertical className="size-4" strokeWidth={2.4} />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-11 z-40 w-56 rounded-2xl overflow-hidden"
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      boxShadow: `0 18px 40px -12px ${t.navy}40`,
                    }}
                  >
                    {(() => {
                      const items: {
                        I: typeof Search;
                        l: string;
                        c: string;
                        hint?: string;
                        run: () => void;
                      }[] = [
                        {
                          I: Search,
                          l: "Search in chat",
                          c: t.ink,
                          run: () => {
                            setSearchOpen(true);
                            setSearchQ("");
                          },
                        },
                        {
                          I: FileSearch,
                          l: "Shared files",
                          c: t.ink,
                          run: () => setSharedOpen(true),
                        },
                        {
                          I: Pin,
                          l: pinned ? "Unpin conversation" : "Pin conversation",
                          c: t.ink,
                          hint: pinned ? "On" : undefined,
                          run: () => {
                            setPinned((v) => !v);
                            flash(pinned ? "Conversation unpinned" : "Conversation pinned");
                          },
                        },
                        {
                          I: BellOff,
                          l: muted ? "Unmute notifications" : "Mute notifications",
                          c: t.ink,
                          hint: muted ? "Muted" : undefined,
                          run: () => {
                            setMuted((v) => !v);
                            flash(muted ? "Notifications on" : "Notifications muted");
                          },
                        },
                        {
                          I: Archive,
                          l: "Archive thread",
                          c: t.ink,
                          run: () =>
                            setConfirm({
                              title: "Archive thread?",
                              desc: "It will be moved to Archived. You can restore it anytime from the inbox filter.",
                              cta: "Archive",
                              tone: "warn",
                              onConfirm: () => leaveThread("Thread archived"),
                            }),
                        },
                        {
                          I: Flag,
                          l: "Report supplier",
                          c: t.warn,
                          run: () =>
                            setConfirm({
                              title: "Report Guangzhou Huayi Co.?",
                              desc: "Our trust team will review this conversation. False reports may affect your account.",
                              cta: "Submit report",
                              tone: "warn",
                              onConfirm: () => flash("Report submitted to MagnetPay Trust"),
                            }),
                        },
                        {
                          I: UserX,
                          l: "Block supplier",
                          c: t.danger,
                          run: () =>
                            setConfirm({
                              title: "Block Guangzhou Huayi Co.?",
                              desc: "They won't be able to message or quote you. Existing orders are not affected.",
                              cta: "Block supplier",
                              tone: "danger",
                              onConfirm: () => leaveThread("Supplier blocked"),
                            }),
                        },
                        {
                          I: Trash2,
                          l: "Delete conversation",
                          c: t.danger,
                          run: () =>
                            setConfirm({
                              title: "Delete this conversation?",
                              desc: "Messages are removed from your inbox. Linked quotes, orders, and escrow records remain.",
                              cta: "Delete",
                              tone: "danger",
                              onConfirm: () => leaveThread("Conversation deleted"),
                            }),
                        },
                      ];
                      return items.map((item, i, arr) => (
                        <button
                          key={item.l}
                          onClick={() => {
                            setMenuOpen(false);
                            item.run();
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left"
                          style={{
                            color: item.c,
                            borderBottom:
                              i < arr.length - 1 ? `1px solid ${t.border}` : "none",
                          }}
                        >
                          <item.I className="size-3.5 shrink-0" strokeWidth={2.4} />
                          <span className="text-[12px] font-semibold flex-1">{item.l}</span>
                          {item.hint && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded-full"
                              style={{ background: `${t.accent}15`, color: t.accent }}
                            >
                              {item.hint}
                            </span>
                          )}
                        </button>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          </header>

          <section
            className="px-4 py-2 shrink-0 flex items-center gap-2 overflow-x-auto"
            style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
          >
            <span
              className="text-[9.5px] font-bold uppercase tracking-[0.14em] shrink-0"
              style={{ color: t.muted }}
            >
              Linked
            </span>
            <Link
              to="/market/quote/$id"
              params={{ id: "441" }}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
              style={{ background: `${t.accent}10`, color: t.accent }}
            >
              <FileText className="size-3" strokeWidth={2.6} /> Q-441
            </Link>
            <Link
              to="/market/order/$id"
              params={{ id: "1187" }}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
              style={{ background: `${t.navy}10`, color: t.navy }}
            >
              <Package2 className="size-3" strokeWidth={2.6} /> O-1187
            </Link>
            <Link
              to="/escrow/$id"
              params={{ id: "2204" }}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold"
              style={{ background: `${t.info}10`, color: t.info }}
            >
              <ShieldCheck className="size-3" strokeWidth={2.6} /> E-2204
            </Link>
          </section>

          {searchOpen && (
            <section
              className="px-3 py-2 shrink-0 flex items-center gap-2"
              style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
            >
              <div
                className="flex-1 flex items-center gap-2 h-9 px-3 rounded-full"
                style={{ background: t.bg, border: `1px solid ${t.border}` }}
              >
                <Search className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search in this chat…"
                  className="flex-1 bg-transparent outline-none text-[12px]"
                  style={{ color: t.ink }}
                />
                {searchQ && (
                  <button onClick={() => setSearchQ("")}>
                    <X className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQ("");
                }}
                className="text-[11px] font-bold"
                style={{ color: t.accent }}
              >
                Cancel
              </button>
            </section>
          )}

          <section className="flex-1 px-3 py-3 space-y-2.5 overflow-y-auto">
            {msgs
              .filter((m) =>
                !searchQ.trim()
                  ? true
                  : (m.text ?? "").toLowerCase().includes(searchQ.trim().toLowerCase()) ||
                    (m.file?.name ?? "").toLowerCase().includes(searchQ.trim().toLowerCase()) ||
                    (m.attach && "title" in m.attach
                      ? m.attach.title.toLowerCase().includes(searchQ.trim().toLowerCase())
                      : false),
              )
              .map((m, i) => {
              if (m.who === "system") {
                return (
                  <div key={i} className="text-center my-1">
                    <span
                      className="inline-block text-[9.5px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{ background: `${t.muted}15`, color: t.muted }}
                    >
                      {m.text} · {m.time}
                    </span>
                  </div>
                );
              }
              const mine = m.who === "you";
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] space-y-1.5">
                    {m.attach && (
                      <AttachCard a={m.attach} mine={mine} />
                    )}
                    {m.file && (
                      <div
                        className="rounded-xl px-3 py-2 flex items-center gap-2"
                        style={{
                          background: mine ? `${t.navy}` : t.surface,
                          border: mine ? "none" : `1px solid ${t.border}`,
                        }}
                      >
                        <div
                          className="size-8 rounded-lg grid place-items-center shrink-0"
                          style={{
                            background: mine ? "rgba(255,255,255,0.12)" : t.bg,
                          }}
                        >
                          <FileText
                            className="size-4"
                            strokeWidth={2.4}
                            style={{ color: mine ? "#fff" : t.navy }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-[11.5px] font-bold truncate"
                            style={{ color: mine ? "#fff" : t.ink }}
                          >
                            {m.file.name}
                          </p>
                          <p
                            className="text-[10px] tabular-nums"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: mine ? "rgba(255,255,255,0.7)" : t.muted,
                            }}
                          >
                            {m.file.size}
                          </p>
                        </div>
                      </div>
                    )}
                    {m.text && (
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-snug ${
                          mine ? "rounded-tr-md" : "rounded-tl-md"
                        }`}
                        style={{
                          background: mine ? t.navy : t.surface,
                          color: mine ? "#fff" : t.ink,
                          border: mine ? "none" : `1px solid ${t.border}`,
                        }}
                      >
                        {m.text}
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-1 px-1 ${
                        mine ? "justify-end" : ""
                      }`}
                    >
                      <p
                        className="text-[9.5px] tabular-nums"
                        style={{
                          color: t.muted,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {m.time}
                      </p>
                      {mine && (
                        <CheckCheck
                          className="size-3"
                          strokeWidth={2.6}
                          style={{ color: m.read ? t.info : t.muted }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="px-3 pt-2 pb-1 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto">
              {quick.map((q) => (
                <button
                  key={q}
                  onClick={() => setDraft(q)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-[10.5px] font-bold"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    color: t.sub,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </section>

          <section
            className="px-3 pt-2 pb-5 shrink-0"
            style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
          >
            <div className="relative">
              {aiOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => {
                      setAiOpen(false);
                    }}
                  />
                  <div
                    className="absolute bottom-full left-0 right-0 mb-2 z-40 rounded-2xl overflow-hidden"
                    style={{
                      background: t.surface,
                      border: `1px solid ${t.border}`,
                      boxShadow: `0 18px 40px -12px ${t.navy}40`,
                    }}
                  >
                    <div
                      className="flex items-center gap-2 px-3.5 py-2.5"
                      style={{ borderBottom: `1px solid ${t.border}` }}
                    >
                      <Languages
                        className="size-3.5"
                        strokeWidth={2.4}
                        style={{ color: t.accent }}
                      />
                      <p className="text-[11px] font-bold flex-1">Translate draft to…</p>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.14em]"
                        style={{ color: t.muted }}
                      >
                        AI
                      </span>
                    </div>
                    {!draft.trim() ? (
                      <p
                        className="px-3.5 py-3 text-[11.5px]"
                        style={{ color: t.muted }}
                      >
                        Type a draft first, then pick a language.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2">
                        {LANGUAGES.map((lang, i) => {
                          const busy = translating === lang.label;
                          const anyBusy = translating !== null;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => runTranslate(lang)}
                              disabled={anyBusy}
                              className="flex items-center gap-2 px-3 py-2.5 text-left disabled:opacity-50"
                              style={{
                                borderRight:
                                  i % 2 === 0 ? `1px solid ${t.border}` : "none",
                                borderTop: i > 1 ? `1px solid ${t.border}` : "none",
                              }}
                            >
                              <span className="text-[16px] leading-none">{lang.flag}</span>
                              <span className="text-[11.5px] font-semibold flex-1 truncate">
                                {lang.label}
                              </span>
                              {busy && (
                                <Loader2
                                  className="size-3.5 animate-spin shrink-0"
                                  strokeWidth={2.4}
                                  style={{ color: t.accent }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
              <div
                className="flex items-center gap-2 h-11 px-2.5 rounded-full"
                style={{ background: t.bg, border: `1px solid ${t.border}` }}
              >
                <button
                  className="size-7 grid place-items-center rounded-full"
                  style={{ color: t.muted }}
                >
                  <Paperclip className="size-4" strokeWidth={2.4} />
                </button>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Message Huayi…"
                  className="flex-1 bg-transparent outline-none text-[12.5px]"
                  style={{ color: t.ink }}
                />
                {draft && (
                  <button onClick={() => setDraft("")}>
                    <X className="size-3.5" strokeWidth={2.4} style={{ color: t.muted }} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setAiOpen((v) => !v);
                  }}
                  className="size-7 grid place-items-center rounded-full"
                  style={{
                    background: aiOpen ? `${t.accent}15` : "transparent",
                    color: aiOpen ? t.accent : t.muted,
                  }}
                  aria-label="Translate draft"
                >
                  <LanguagesIcon className="size-4" strokeWidth={2.4} />
                </button>
                <button
                  onClick={send}
                  disabled={!draft.trim()}
                  className="size-8 grid place-items-center rounded-full text-white disabled:opacity-40"
                  style={{ background: t.accent }}
                >
                  <Send className="size-3.5" strokeWidth={2.6} />
                </button>
              </div>
            </div>
            <p
              className="mt-1.5 text-center text-[9px] uppercase tracking-[0.14em] font-bold"
              style={{ color: t.muted }}
            >
              Thread #{id} · End-to-end encrypted
            </p>
          </section>

          {/* Toast */}
          {toast && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-24 z-50 px-3.5 py-2 rounded-full text-[11px] font-bold"
              style={{
                background: t.navy,
                color: "#fff",
                boxShadow: `0 12px 30px -10px ${t.navy}80`,
              }}
            >
              {toast}
            </div>
          )}

          {/* Shared files sheet */}
          {sharedOpen && (
            <>
              <div
                className="absolute inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)" }}
                onClick={() => setSharedOpen(false)}
              />
              <div
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl p-4 pb-6"
                style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileSearch className="size-4" strokeWidth={2.4} style={{ color: t.navy }} />
                  <p className="text-[13px] font-bold flex-1">Shared in this chat</p>
                  <button onClick={() => setSharedOpen(false)}>
                    <X className="size-4" strokeWidth={2.4} style={{ color: t.muted }} />
                  </button>
                </div>
                <div className="space-y-2">
                  {msgs
                    .map((m, i) => ({ m, i }))
                    .filter(({ m }) => m.file || m.attach)
                    .map(({ m, i }) => {
                      if (m.file) {
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl"
                            style={{ background: t.bg, border: `1px solid ${t.border}` }}
                          >
                            <div
                              className="size-9 rounded-lg grid place-items-center shrink-0"
                              style={{ background: `${t.navy}10`, color: t.navy }}
                            >
                              <FileText className="size-4" strokeWidth={2.4} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11.5px] font-bold truncate">{m.file.name}</p>
                              <p
                                className="text-[10px] tabular-nums"
                                style={{
                                  color: t.muted,
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {m.file.size} · {m.time}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      if (!m.attach) return null;
                      const a = m.attach;
                      const meta =
                        a.kind === "quote"
                          ? { c: t.accent, I: FileText, label: "Quote" }
                          : a.kind === "order"
                            ? { c: t.navy, I: Package2, label: "Order" }
                            : { c: t.info, I: ShieldCheck, label: "Escrow" };
                      const Icon = meta.I;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl"
                          style={{ background: t.bg, border: `1px solid ${meta.c}30` }}
                        >
                          <div
                            className="size-9 rounded-lg grid place-items-center shrink-0"
                            style={{ background: `${meta.c}15`, color: meta.c }}
                          >
                            <Icon className="size-4" strokeWidth={2.4} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                              style={{ color: meta.c }}
                            >
                              {meta.label} · {a.ref}
                            </p>
                            <p className="text-[11.5px] font-bold truncate">{a.title}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}

          {/* Confirm sheet */}
          {confirm && (
            <>
              <div
                className="absolute inset-0 z-40"
                style={{ background: "rgba(15,23,42,0.45)" }}
                onClick={() => setConfirm(null)}
              />
              <div
                className="absolute left-0 right-0 bottom-0 z-50 rounded-t-3xl p-4 pb-6"
                style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
              >
                <div
                  className="size-10 rounded-full grid place-items-center mb-2.5"
                  style={{
                    background: `${confirm.tone === "danger" ? t.danger : t.warn}15`,
                    color: confirm.tone === "danger" ? t.danger : t.warn,
                  }}
                >
                  {confirm.tone === "danger" ? (
                    <Trash2 className="size-4" strokeWidth={2.4} />
                  ) : (
                    <Flag className="size-4" strokeWidth={2.4} />
                  )}
                </div>
                <p className="text-[14px] font-bold mb-1">{confirm.title}</p>
                <p className="text-[11.5px] leading-snug mb-4" style={{ color: t.sub }}>
                  {confirm.desc}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(null)}
                    className="flex-1 h-10 rounded-full text-[12px] font-bold"
                    style={{
                      background: t.bg,
                      border: `1px solid ${t.border}`,
                      color: t.ink,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const fn = confirm.onConfirm;
                      setConfirm(null);
                      fn();
                    }}
                    className="flex-1 h-10 rounded-full text-[12px] font-bold text-white"
                    style={{
                      background: confirm.tone === "danger" ? t.danger : t.warn,
                    }}
                  >
                    {confirm.cta}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </PhoneFrame>
    </>
  );
}

function AttachCard({ a, mine }: { a: Attach; mine: boolean }) {
  const t = escrowTheme;
  const palette =
    a.kind === "quote"
      ? { c: t.accent, I: FileText, label: "Quote" }
      : a.kind === "order"
        ? { c: t.navy, I: Package2, label: "Order" }
        : { c: t.info, I: ShieldCheck, label: "Escrow" };
  const Icon = palette.I;
  return (
    <div
      className="rounded-2xl p-3"
      style={{
        background: mine ? "#fff" : t.surface,
        border: `1px solid ${palette.c}30`,
        boxShadow: `0 1px 0 ${palette.c}10`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="size-7 rounded-lg grid place-items-center shrink-0"
          style={{ background: `${palette.c}12`, color: palette.c }}
        >
          <Icon className="size-3.5" strokeWidth={2.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: palette.c }}
          >
            {palette.label} · {a.ref}
          </p>
          <p className="text-[11.5px] font-bold truncate" style={{ color: t.ink }}>
            {a.title}
          </p>
        </div>
      </div>
      <div
        className="mt-2 pt-2 flex items-center justify-between"
        style={{ borderTop: `1px solid ${t.border}` }}
      >
        {a.kind === "quote" && (
          <>
            <p
              className="text-[13px] font-bold tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: palette.c }}
            >
              {a.price}
            </p>
            <p className="text-[10px]" style={{ color: t.muted }}>
              {a.lead} lead
            </p>
          </>
        )}
        {a.kind === "order" && (
          <>
            <p className="text-[10.5px] font-bold" style={{ color: t.sub }}>
              {a.status}
            </p>
            <p
              className="text-[12px] font-bold tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }}
            >
              {a.total}
            </p>
          </>
        )}
        {a.kind === "escrow" && (
          <>
            <p
              className="text-[12px] font-bold tabular-nums"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: t.ink }}
            >
              {a.held}
            </p>
            <p className="text-[10px]" style={{ color: t.muted }}>
              {a.ms}
            </p>
          </>
        )}
      </div>
      {(() => {
        const id = a.ref.replace(/^[A-Z]-/, "");
        const cls = "mt-2 w-full h-8 rounded-full text-[10.5px] font-bold inline-flex items-center justify-center";
        const style = { background: palette.c, color: "#fff" };
        const label = `Open ${palette.label.toLowerCase()}`;
        if (a.kind === "quote")
          return (
            <Link to="/market/quote/$id" params={{ id }} className={cls} style={style}>
              {label}
            </Link>
          );
        if (a.kind === "order")
          return (
            <Link to="/market/order/$id" params={{ id }} className={cls} style={style}>
              {label}
            </Link>
          );
        return (
          <Link to="/escrow/$id" params={{ id }} className={cls} style={style}>
            {label}
          </Link>
        );
      })()}
    </div>
  );
}
