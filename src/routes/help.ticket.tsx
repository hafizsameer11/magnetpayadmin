import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  Paperclip,
  Send,
  CheckCheck,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { PhoneFrame } from "@/components/magnetpay/PhoneFrame";
import { escrowTheme } from "@/components/magnetpay/EscrowStepper";

export const Route = createFileRoute("/help/ticket")({
  head: () => ({ meta: [{ title: "Support — MagnetPay" }] }),
  component: SupportChat,
});

const TOPICS = [
  "Payment didn't arrive",
  "Escrow release stuck",
  "Shipment delay",
  "KYC / verification",
  "Refund request",
  "Other",
];

type Msg = {
  who: "you" | "agent" | "system";
  text: string;
  time: string;
};

function SupportChat() {
  const t = escrowTheme;
  const [topic, setTopic] = useState<string | null>(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { who: "system", text: "Ticket #SP-4421 opened · Avg response < 6 min", time: "Today" },
    {
      who: "agent",
      text: "Hi Chidi, this is Amaka from MagnetPay support. How can I help today?",
      time: "10:21",
    },
  ]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { who: "you", text: draft.trim(), time: "now" }]);
    setDraft("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          who: "agent",
          text: "Thanks — I'm pulling up the escrow now. Could you share the order reference (O-…)?",
          time: "now",
        },
      ]);
    }, 1200);
  };

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
              to="/help"
              className="size-9 grid place-items-center rounded-full"
              style={{ background: t.bg, border: `1px solid ${t.border}` }}
            >
              <ChevronLeft className="size-4" strokeWidth={2.4} />
            </Link>
            <div
              className="size-9 rounded-full grid place-items-center shrink-0"
              style={{ background: `${t.navy}10`, color: t.navy }}
            >
              <Headphones className="size-4" strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold">MagnetPay support</p>
              <p
                className="text-[10px] flex items-center gap-1.5"
                style={{ color: t.muted }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: t.success }}
                />
                Avg reply 6 min · Ticket #SP-4421
              </p>
            </div>
          </header>

          {/* Topic */}
          <section
            className="px-3 py-2.5 shrink-0 relative"
            style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
          >
            <button
              onClick={() => setTopicOpen((v) => !v)}
              className="w-full flex items-center gap-2.5 h-10 px-3 rounded-xl"
              style={{ background: t.bg, border: `1px solid ${t.border}` }}
            >
              <span
                className="text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: t.muted }}
              >
                Topic
              </span>
              <span className="flex-1 text-left text-[11.5px] font-bold">
                {topic ?? "Choose a topic"}
              </span>
              <ChevronDown
                className="size-3.5 transition-transform"
                strokeWidth={2.4}
                style={{
                  color: t.muted,
                  transform: topicOpen ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {topicOpen && (
              <div
                className="absolute left-3 right-3 top-full mt-1 z-30 rounded-2xl overflow-hidden"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  boxShadow: `0 18px 40px -12px ${t.navy}40`,
                }}
              >
                {TOPICS.map((tp, i) => (
                  <button
                    key={tp}
                    onClick={() => {
                      setTopic(tp);
                      setTopicOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-[12px] font-semibold"
                    style={{
                      color: t.ink,
                      borderTop: i > 0 ? `1px solid ${t.border}` : "none",
                    }}
                  >
                    {tp}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Messages */}
          <section className="flex-1 px-3 py-3 space-y-2.5 overflow-y-auto">
            {msgs.map((m, i) => {
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
                <div
                  key={i}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
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
                    <div
                      className={`mt-1 px-1 flex items-center gap-1 ${
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
                          style={{ color: t.info }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Composer */}
          <section
            className="px-3 pt-2 pb-5 shrink-0"
            style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}
          >
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
                placeholder="Describe your issue…"
                className="flex-1 bg-transparent outline-none text-[12.5px]"
                style={{ color: t.ink }}
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                className="size-8 grid place-items-center rounded-full text-white disabled:opacity-40"
                style={{ background: t.accent }}
              >
                <Send className="size-3.5" strokeWidth={2.6} />
              </button>
            </div>
            <p
              className="mt-1.5 text-center text-[9px] uppercase tracking-[0.14em] font-bold"
              style={{ color: t.muted }}
            >
              Replies are saved to your ticket history
            </p>
          </section>
        </div>
      </PhoneFrame>
    </>
  );
}
