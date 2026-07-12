"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, Search, Send, Soup, Headset } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RequireAuth from "@/components/auth/RequireAuth";
import { cn } from "@/utils/format";
import { ChatContextType, buildTemplateMessage, sellerNameFor, labelFor } from "@/utils/chat-context";
import { useChatConversations, useOpenConversation, useChatMessages } from "@/hooks/useChat";
import ChatContextCard from "@/components/chat/ChatContextCard";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex h-[calc(100vh-73px)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-ink-900 sm:text-2xl">
            <MessageSquareText className="h-6 w-6 text-primary-500" />
            Live Chat
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            Chat langsung dengan Admin FoodMart soal produk, pesanan, atau pertanyaan umum.
          </p>
        </div>

        <RequireAuth message="Masuk untuk mulai chat dengan Admin FoodMart">
          <Suspense fallback={<div className="h-full animate-pulse rounded-card border border-surface-border bg-surface-cream" />}>
            <ChatPageInner />
          </Suspense>
        </RequireAuth>
      </main>
    </>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const initializedFromParams = useRef(false);

  const { data: conversations, isLoading } = useChatConversations();
  const openConversation = useOpenConversation();
  const { data: messages, isLoading: messagesLoading, send } = useChatMessages(activeId);

  // Kalau datang dari halaman Produk / Checkout / Pesanan dengan query
  // param, buat (atau buka) percakapan yang sesuai secara otomatis.
  useEffect(() => {
    if (initializedFromParams.current) return;
    const type = searchParams.get("type") as ChatContextType | null;
    if (!type) return;
    initializedFromParams.current = true;
    const context = searchParams.get("context") ?? undefined;
    const referenceId = searchParams.get("refId") ?? undefined;

    openConversation.mutate(
      { type, context, referenceId },
      {
        onSuccess: (conv) => {
          setActiveId(conv.id);
          setDraft(buildTemplateMessage({ type, context }));
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const activeConversation = conversations?.find((c) => c.id === activeId) ?? null;
  const filteredConversations = (conversations ?? []).filter((c) =>
    sellerNameFor(c.type).toLowerCase().includes(search.toLowerCase())
  );

  function handleSend() {
    if (!draft.trim() || !activeId) return;
    send.mutate(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-card border border-surface-border bg-white shadow-sm">
      {/* Daftar percakapan */}
      <aside className={cn("flex w-full max-w-xs flex-col border-r border-surface-border", activeConversation && "hidden sm:flex")}>
        <div className="border-b border-surface-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari percakapan..."
              className="w-full rounded-input border border-surface-border bg-surface-cream/60 py-2.5 pl-9 pr-3.5 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="space-y-2 p-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-input bg-surface-cream" />)}</div>}

          {!isLoading && filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-cream text-ink-400">
                <MessageSquareText className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">Belum ada percakapan</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">
                  Mulai chat dari halaman produk, checkout, atau pesanan — nanti akan muncul di sini.
                </p>
              </div>
            </div>
          ) : (
            <ul>
              {filteredConversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-surface-border px-4 py-3.5 text-left transition-colors hover:bg-surface-cream",
                      activeId === conv.id && "bg-primary-50"
                    )}
                  >
                    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                      {conv.type === "support" ? <Headset className="h-5 w-5" /> : <Soup className="h-5 w-5" />}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink-900">{sellerNameFor(conv.type)}</p>
                        {conv.lastMessageAt && <span className="shrink-0 text-[11px] text-ink-400">{formatTime(conv.lastMessageAt)}</span>}
                      </div>
                      {labelFor(conv.type, conv.context) && (
                        <p className="truncate text-[11px] font-medium text-primary-500">{labelFor(conv.type, conv.context)}</p>
                      )}
                      {conv.lastMessage && <p className="mt-0.5 truncate text-xs text-ink-700">{conv.lastMessage}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Area chat */}
      <section className={cn("flex min-w-0 flex-1 flex-col", !activeConversation && "hidden sm:flex")}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 border-b border-surface-border px-5 py-3.5">
              <button onClick={() => setActiveId(null)} className="text-sm text-ink-400 hover:text-primary-500 sm:hidden">← Kembali</button>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white">
                {activeConversation.type === "support" ? <Headset className="h-4 w-4" /> : <Soup className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{sellerNameFor(activeConversation.type)}</p>
                {labelFor(activeConversation.type, activeConversation.context) && (
                  <p className="text-xs text-ink-400">{labelFor(activeConversation.type, activeConversation.context)}</p>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-surface-cream/40 p-5">
              {messagesLoading && <div className="h-20 animate-pulse rounded-input bg-white" />}
              <AnimatePresence initial={false}>
                {messages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex", msg.sender === "customer" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] space-y-2 rounded-2xl px-4 py-2.5 text-sm",
                        msg.sender === "customer" ? "bg-primary-500 text-white" : "border border-surface-border bg-white text-ink-900"
                      )}
                    >
                      {msg.metadata && <ChatContextCard metadata={msg.metadata} />}
                      <p className="whitespace-pre-line">{msg.message}</p>
                      <p className={cn("mt-1 text-[10px]", msg.sender === "customer" ? "text-white/70" : "text-ink-400")}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {!messagesLoading && messages?.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-400">Mulai percakapan dengan mengirim pesan pertama.</p>
              )}
            </div>

            <ChatInput draft={draft} setDraft={setDraft} onSend={handleSend} isSending={send.isPending} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <MessageSquareText className="h-7 w-7" />
            </span>
            <div>
              <p className="font-semibold text-ink-900">Belum ada percakapan yang dipilih</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-700">
                Pilih percakapan di sebelah kiri, atau mulai chat baru dari halaman produk, checkout, maupun pesananmu.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ChatInput({
  draft, setDraft, onSend, isSending,
}: {
  draft: string; setDraft: (v: string) => void; onSend: () => void; isSending: boolean;
}) {
  return (
    <div className="border-t border-surface-border p-4">
      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={draft.split("\n").length > 2 ? 3 : 1}
          placeholder="Tulis pesan..."
          className="flex-1 resize-none rounded-input border border-surface-border bg-surface-cream/60 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
        <button
          onClick={onSend}
          disabled={!draft.trim() || isSending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Kirim pesan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-ink-400">Tekan Enter untuk kirim, Shift+Enter untuk baris baru.</p>
    </div>
  );
}
