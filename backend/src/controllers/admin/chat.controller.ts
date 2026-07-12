import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { chatRepository } from "../../repositories/chat.repository";
import { notificationRepository } from "../../repositories/notification.repository";
import { AppError } from "../../middlewares/errorHandler";

function labelFor(type: string, context: string | null) {
  switch (type) {
    case "produk": return `Produk: ${context ?? "-"}`;
    case "pesanan": return `Pesanan #${context ?? "-"}`;
    case "checkout": return "Pertanyaan Checkout";
    case "support":
    default: return "Customer Support";
  }
}

function toConversationDTO(row: Record<string, unknown>) {
  const messages = (row.chat_messages as Array<{ message: string; sender: string; created_at: string; is_read: boolean }>) ?? [];
  const sorted = [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = sorted[sorted.length - 1];
  const unreadCount = messages.filter((m) => m.sender === "customer" && !m.is_read).length;
  const customer = row.users as unknown as { full_name: string; email: string } | null;
  return {
    id: row.id,
    type: row.type,
    context: row.context,
    label: labelFor(row.type as string, row.context as string | null),
    customerName: customer?.full_name ?? "Pengguna",
    customerEmail: customer?.email ?? "",
    lastMessage: last?.message ?? null,
    lastMessageAt: row.last_message_at,
    unreadCount,
  };
}

function toMessageDTO(row: Record<string, unknown>) {
  return {
    id: row.id,
    sender: row.sender,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    metadata: row.metadata ?? null,
  };
}

const sendSchema = z.object({ message: z.string().min(1, "Pesan tidak boleh kosong") });

export const adminChatController = {
  async listConversations(_req: Request, res: Response, next: NextFunction) {
    try {
      const rows = await chatRepository.listAllConversations();
      res.json({ success: true, data: rows.map(toConversationDTO) });
    } catch (err) { next(err); }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await chatRepository.getConversationById(req.params.id);
      if (!conversation) throw new AppError("Percakapan tidak ditemukan", 404);

      const rows = await chatRepository.listMessages(req.params.id);
      await chatRepository.markRead(req.params.id, true);
      res.json({ success: true, data: rows.map(toMessageDTO) });
    } catch (err) { next(err); }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = sendSchema.parse(req.body);
      const conversation = await chatRepository.getConversationById(req.params.id);
      if (!conversation) throw new AppError("Percakapan tidak ditemukan", 404);

      const row = await chatRepository.createMessage(req.params.id, "admin", message);

      // Beri tahu customer lewat sistem notifikasi (bel di navbar + halaman /notifikasi).
      await notificationRepository.create({
        userId: conversation.user_id as string,
        type: "system",
        title: "Admin membalas chat kamu",
        message,
        referenceId: conversation.id as string,
      });

      res.status(201).json({ success: true, data: toMessageDTO(row) });
    } catch (err) { next(err); }
  },
};
