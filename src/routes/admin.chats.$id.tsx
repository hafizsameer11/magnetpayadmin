import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, FileText, Loader2, Lock, Paperclip, Send, X } from "lucide-react";
import { AdminShell, T } from "@/components/admin/AdminShell";
import { closeAdminSupportConversation, fetchAdminConversation, postAdminConversationMessage, resolveApiFileUrl, uploadAdminFile } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/chats/$id")({
  head: () => ({ meta: [{ title: "Conversation — MagnetPay Admin" }] }),
  component: Page,
});

function attachmentKind(url: string) {
  const path = url.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|heic)$/.test(path)) return "image";
  if (/\.(mp4|mov|webm)$/.test(path)) return "video";
  return "file";
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1]! : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function MessageAttachment({ url }: { url: string }) {
  const abs = resolveApiFileUrl(url);
  const kind = attachmentKind(abs);
  if (kind === "image") {
    return (
      <a href={abs} target="_blank" rel="noreferrer" className="block mt-2">
        <img src={abs} alt="Attachment" className="max-w-[220px] max-h-[180px] rounded-lg border object-cover" style={{ borderColor: T.border }} />
      </a>
    );
  }
  const name = abs.split("/").pop() ?? "attachment";
  return (
    <a
      href={abs}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold"
      style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
    >
      <FileText className="size-3.5" />
      <span className="truncate max-w-[180px]">{decodeURIComponent(name)}</span>
    </a>
  );
}

function Page() {
  const { id } = Route.useParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const [row, setRow] = useState<Awaited<ReturnType<typeof fetchAdminConversation>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState<{ url: string; name: string; preview?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const isSupport = Boolean(row?.subject?.startsWith("Support ·"));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRow(await fetchAdminConversation(id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load conversation");
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const uploaded = await uploadAdminFile(file.name, base64, file.type || undefined);
      const preview = file.type.startsWith("image/") ? resolveApiFileUrl(uploaded.url) : undefined;
      setPending({ url: uploaded.url, name: file.name, preview });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const send = async () => {
    if ((!reply.trim() && !pending) || sending) return;
    setSending(true);
    try {
      await postAdminConversationMessage(id, reply.trim(), pending?.url);
      setReply("");
      setPending(null);
      toast.success("Message sent");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  const closeChat = async () => {
    if (!isSupport || closing) return;
    if (!window.confirm("Close this support chat? The customer won't be able to send new messages.")) return;
    setClosing(true);
    try {
      await closeAdminSupportConversation(id);
      toast.success("Support chat closed");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Close failed");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Chat" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
        <div className="py-16 grid place-items-center" style={{ color: T.muted }}><Loader2 className="size-5 animate-spin" /></div>
      </AdminShell>
    );
  }

  if (!row) {
    return (
      <AdminShell title="Chat" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
        <p className="text-[13px]" style={{ color: T.muted }}>Conversation not found.</p>
      </AdminShell>
    );
  }

  const names = (row.participants ?? []).map((p) => p.user.name).join(" · ") || "—";
  const messages = row.messages ?? [];

  return (
    <AdminShell title="Conversation" breadcrumbs={[{ label: "Admin", to: "/admin" }, { label: "Chats", to: "/admin/chats" }, { label: id.slice(0, 8) }]}>
      <Link to="/admin/chats" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold mb-4" style={{ color: T.sub }}>
        <ChevronLeft className="size-3.5" /> Chats
      </Link>
      <div className="rounded-xl p-4 mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: T.muted }}>Participants</p>
          {isSupport ? (
            <button
              type="button"
              disabled={closing}
              onClick={() => void closeChat()}
              className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold disabled:opacity-50"
              style={{ background: `${T.danger}12`, color: T.danger, border: `1px solid ${T.danger}30` }}
            >
              <Lock className="size-3.5" />
              {closing ? "Closing…" : "Close chat"}
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-[13px] font-semibold">{names}</p>
        {row.subject ? <p className="mt-2 text-[12px]" style={{ color: T.sub }}>{row.subject}</p> : null}
      </div>
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {messages.length ? (
          messages.map((m, i) => (
            <div key={m.id} className="px-4 py-3 text-[12px]" style={{ borderBottom: i < messages.length - 1 ? `1px solid ${T.border}` : "none" }}>
              {m.body && m.body !== "Attachment" ? <p style={{ color: T.ink }}>{m.body}</p> : null}
              {m.attachmentUrl ? <MessageAttachment url={m.attachmentUrl} /> : null}
              <p className="text-[10px] mt-1 tabular-nums font-mono" style={{ color: T.muted }}>
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-[12px]" style={{ color: T.muted }}>No messages in thread.</p>
        )}
      </div>
      <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
        {pending ? (
          <div className="mb-3 flex items-center gap-3 p-2 rounded-lg" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
            {pending.preview ? (
              <img src={pending.preview} alt="" className="size-14 rounded-lg object-cover" />
            ) : (
              <div className="size-14 rounded-lg grid place-items-center" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
                <FileText className="size-5" style={{ color: T.navy }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: T.ink }}>{pending.name}</p>
              <p className="text-[10px]" style={{ color: T.muted }}>Ready to send</p>
            </div>
            <button type="button" onClick={() => setPending(null)} className="size-8 grid place-items-center rounded-lg" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <X className="size-3.5" style={{ color: T.muted }} />
            </button>
          </div>
        ) : null}
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="h-9 w-9 rounded-lg grid place-items-center shrink-0 disabled:opacity-60"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.sub }}
            aria-label="Attach file"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Paperclip className="size-3.5" />}
          </button>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Reply as support…"
            rows={3}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-[12px] outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink }}
          />
          <button
            type="button"
            disabled={sending || uploading || (!reply.trim() && !pending)}
            onClick={() => void send()}
            className="self-end h-9 px-4 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: T.navy }}
          >
            <Send className="size-3.5" />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
