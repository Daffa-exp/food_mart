"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services/chat.service";
import { ChatContextType } from "@/utils/chat-context";
import { useUser } from "@/hooks/useUser";

export function useChatConversations() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => chatService.listConversations(),
    enabled: !!user,
    refetchInterval: 5000, // polling ringan biar kelihatan "real-time" tanpa websocket
  });
}

export function useOpenConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, context, referenceId }: { type: ChatContextType; context?: string; referenceId?: string }) =>
      chatService.openConversation(type, context, referenceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] }),
  });
}

export function useChatMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => chatService.listMessages(conversationId!),
    enabled: !!conversationId,
    refetchInterval: 4000,
  });

  const send = useMutation({
    mutationFn: (message: string) => chatService.sendMessage(conversationId!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  return { ...query, send };
}
