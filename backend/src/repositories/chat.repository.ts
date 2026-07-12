import { supabaseAdmin } from "../config/supabase";
import { AppError } from "../middlewares/errorHandler";

export type ChatContextType = "produk" | "pesanan" | "checkout" | "support";

export const chatRepository = {
  // ---------- Customer side ----------

  async listConversationsByUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("*, chat_messages(message, sender, created_at, is_read)")
      .eq("user_id", userId)
      .order("last_message_at", { ascending: false });
    if (error) throw new AppError(`Gagal mengambil percakapan: ${error.message}`, 500);
    return data ?? [];
  },

  async getOrCreateConversation(userId: string, type: ChatContextType, context?: string, referenceId?: string) {
    let query = supabaseAdmin
      .from("chat_conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type);
    query = context ? query.eq("context", context) : query.is("context", null);

    const { data: existing, error: findError } = await query.maybeSingle();
    if (findError) throw new AppError(`Gagal mencari percakapan: ${findError.message}`, 500);
    if (existing) return { conversation: existing, isNew: false };

    const { data: created, error: createError } = await supabaseAdmin
      .from("chat_conversations")
      .insert({ user_id: userId, type, context: context ?? null, reference_id: referenceId ?? null })
      .select()
      .single();
    if (createError) throw new AppError(`Gagal membuat percakapan: ${createError.message}`, 500);
    return { conversation: created, isNew: true };
  },

  async getConversationById(id: string) {
    const { data, error } = await supabaseAdmin.from("chat_conversations").select("*").eq("id", id).maybeSingle();
    if (error) throw new AppError(`Gagal mengambil percakapan: ${error.message}`, 500);
    return data;
  },

  async listMessages(conversationId: string) {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new AppError(`Gagal mengambil pesan: ${error.message}`, 500);
    return data ?? [];
  },

  async createMessage(
    conversationId: string,
    sender: "customer" | "admin",
    message: string,
    metadata?: Record<string, unknown>
  ) {
    const { data, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({ conversation_id: conversationId, sender, message, metadata: metadata ?? null })
      .select()
      .single();
    if (error) throw new AppError(`Gagal mengirim pesan: ${error.message}`, 500);

    await supabaseAdmin
      .from("chat_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    return data;
  },

  async markRead(conversationId: string, readerIsAdmin: boolean) {
    // Kalau admin yang baca -> tandai pesan dari customer sebagai terbaca, dan sebaliknya.
    const senderToMark = readerIsAdmin ? "customer" : "admin";
    const { error } = await supabaseAdmin
      .from("chat_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("sender", senderToMark)
      .eq("is_read", false);
    if (error) throw new AppError(`Gagal memperbarui status baca: ${error.message}`, 500);
  },

  // ---------- Admin side ----------

  async listAllConversations() {
    const { data, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("*, users(full_name, email), chat_messages(message, sender, created_at, is_read)")
      .order("last_message_at", { ascending: false });
    if (error) throw new AppError(`Gagal mengambil percakapan: ${error.message}`, 500);
    return data ?? [];
  },
};
