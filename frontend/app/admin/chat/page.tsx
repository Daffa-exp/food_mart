"use client";

import { useState } from "react";
import { Send, MessageSquareText } from "lucide-react";
import { cn } from "@/utils/format";
import { useAdminChatConversations, useAdminChatMessages } from "@/hooks/useAdmin";
import ChatContextCard from "@/components/chat/ChatContextCard";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminChatPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { data: conversations, isLoading } = useAdminChatConversations();
  const { data: messages, isLoading: messagesLoading, reply } = useAdminChatMessages(activeId);

  const active = conversations?.find((c) => c.id === activeId) ?? null;

  function handleSend() {
    if (!draft.trim() || !activeId) return;
    reply.mutate(draft.trim());
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Live Chat</h1>
        <p className="text-sm text-ink-700">Balas pesan customer soal produk, pesanan, atau pertanyaan umum.</p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[420px] overflow-hidden rounded-card border border-surface-border bg-white">
        {/* Daftar percakapan */}
        <aside className={cn("flex w-full max-w-xs flex-col border-r border-surface-border", active && "hidden sm:flex")}>
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-input bg-surface-cream" />)}
              </div>
            )}
            {!isLoading && conversations?.length === 0 && (
              <p className="p-6 text-center text-sm text-ink-400">Belum ada percakapan dari customer.</p>
            )}
            <ul>
              {conversations?.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-surface-border px-4 py-3.5 text-left transition-colors hover:bg-surface-cream",
                      activeId === conv.id && "bg-primary-50"
                    )}
                  >
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                      {conv.customerName.charAt(0).toUpperCase()}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink-900">{conv.customerName}</p>
                        {conv.lastMessageAt && <span className="shrink-0 text-[11px] text-ink-400">{formatTime(conv.lastMessageAt)}</span>}
                      </div>
                      <p className="truncate text-[11px] font-medium text-primary-500">{conv.label}</p>
                      {conv.lastMessage && <p className="mt-0.5 truncate text-xs text-ink-700">{conv.lastMessage}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Area chat */}
        <section className={cn("flex min-w-0 flex-1 flex-col", !active && "hidden sm:flex")}>
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-surface-border px-5 py-3.5">
                <button onClick={() => setActiveId(null)} className="text-sm text-ink-400 hover:text-primary-500 sm:hidden">← Kembali</button>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{active.customerName}</p>
                  <p className="text-xs text-ink-400">{active.customerEmail} · {active.label}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-surface-cream/40 p-5">
                {messagesLoading && <div className="h-20 animate-pulse rounded-input bg-white" />}
                {messages?.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.sender === "admin" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] space-y-2 rounded-2xl px-4 py-2.5 text-sm",
                        msg.sender === "admin" ? "bg-primary-500 text-white" : "border border-surface-border bg-white text-ink-900"
                      )}
                    >
                      {msg.metadata && <ChatContextCard metadata={msg.metadata} />}
                      <p className="whitespace-pre-line">{msg.message}</p>
                      <p className={cn("mt-1 text-[10px]", msg.sender === "admin" ? "text-white/70" : "text-ink-400")}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-surface-border p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={draft.split("\n").length > 2 ? 3 : 1}
                    placeholder="Tulis balasan..."
                    className="flex-1 resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim() || reply.isPending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Kirim balasan"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-400">Customer akan langsung dapat notifikasi begitu kamu kirim balasan.</p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
                <MessageSquareText className="h-7 w-7" />
              </span>
              <p className="font-semibold text-ink-900">Pilih percakapan di sebelah kiri untuk membalas</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
