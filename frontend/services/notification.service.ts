import { apiClient } from "@/services/api-client";
import { Notification } from "@/types/entities";

export const notificationService = {
  async list(): Promise<Notification[]> {
    const { data } = await apiClient.get("/notifications");
    return data.data;
  },
  async markAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  async markAllAsRead() {
    await apiClient.patch("/notifications/read-all");
  },
};
