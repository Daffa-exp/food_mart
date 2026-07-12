import { apiClient } from "@/services/api-client";
import { ChatContextType } from "@/utils/chat-context";

export interface ChatConversation {
  id: string;
  type: ChatContextType;
  context: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "admin";
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    kind: "product_card" | "order_card";
    name?: string;
    slug?: string;
    imageUrl?: string | null;
    price?: number;
    originalPrice?: number | null;
    orderNumber?: string;
    status?: string;
    itemsSummary?: string;
    totalAmount?: number;
  } | null;
}

export const chatService = {
  async listConversations(): Promise<ChatConversation[]> {
    const { data } = await apiClient.get("/chat/conversations");
    return data.data;
  },
  async openConversation(type: ChatContextType, context?: string, referenceId?: string): Promise<ChatConversation> {
    const { data } = await apiClient.post("/chat/conversations", { type, context, referenceId });
    return data.data;
  },
  async listMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
    return data.data;
  },
  async sendMessage(conversationId: string, message: string): Promise<ChatMessage> {
    const { data } = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { message });
    return data.data;
  },
};
