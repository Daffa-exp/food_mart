import { apiClient } from "@/services/api-client";
import { UserProfile } from "@/types/entities";

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await apiClient.get("/users/me");
    return data.data;
  },
  async updateProfile(payload: { fullName?: string; phoneNumber?: string; avatarUrl?: string }) {
    const { data } = await apiClient.patch("/users/me", payload);
    return data.data as UserProfile;
  },
};
