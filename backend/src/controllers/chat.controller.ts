import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { chatRepository } from "../repositories/chat.repository";
import { userRepository } from "../repositories/user.repository";
import { buildWelcomeMessages } from "../services/chat-welcome.service";
import { AppError } from "../middlewares/errorHandler";

async function resolveUserId(authId: string) {
  const user = await userRepository.findOrCreateByAuthId(authId);
  return user.id as string;
}

function toConversationDTO(row: Record<string, unknown>) {
  const messages = (row.chat_messages as Array<{ message: string; sender: string; created_at: string; is_read: boolean }>) ?? [];
  const sorted = [...messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = sorted[sorted.length - 1];
  const unreadCount = messages.filter((m) => m.sender === "admin" && !m.is_read).length;
  return {
    id: row.id,
    type: row.type,
    context: row.context,
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

const openSchema = z.object({
  type: z.enum(["produk", "pesanan", "checkout", "support"]),
  context: z.string().optional(),
  referenceId: z.string().uuid().optional(),
});

const sendSchema = z.object({ message: z.string().min(1, "Pesan tidak boleh kosong") });

export const chatController = {
  async listConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      const rows = await chatRepository.listConversationsByUser(userId);
      res.json({ success: true, data: rows.map(toConversationDTO) });
    } catch (err) { next(err); }
  },

  async openConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, context, referenceId } = openSchema.parse(req.body);
      const userId = await resolveUserId(req.user!.authId);
      const { conversation, isNew } = await chatRepository.getOrCreateConversation(userId, type, context, referenceId);

      if (isNew) {
        const welcomeMessages = await buildWelcomeMessages(type, context, referenceId);
        for (const wm of welcomeMessages) {
          await chatRepository.createMessage(conversation.id, "admin", wm.message, wm.metadata);
        }
      }

      res.status(201).json({ success: true, data: toConversationDTO({ ...conversation, chat_messages: [] }) });
    } catch (err) { next(err); }
  },

  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await resolveUserId(req.user!.authId);
      const conversation = await chatRepository.getConversationById(req.params.id);
      if (!conversation || conversation.user_id !== userId) throw new AppError("Percakapan tidak ditemukan", 404);

      const rows = await chatRepository.listMessages(req.params.id);
      await chatRepository.markRead(req.params.id, false);
      res.json({ success: true, data: rows.map(toMessageDTO) });
    } catch (err) { next(err); }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = sendSchema.parse(req.body);
      const userId = await resolveUserId(req.user!.authId);
      const conversation = await chatRepository.getConversationById(req.params.id);
      if (!conversation || conversation.user_id !== userId) throw new AppError("Percakapan tidak ditemukan", 404);

      const row = await chatRepository.createMessage(req.params.id, "customer", message);
      res.status(201).json({ success: true, data: toMessageDTO(row) });
    } catch (err) { next(err); }
  },
};
