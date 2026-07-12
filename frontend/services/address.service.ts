import { apiClient } from "@/services/api-client";

export interface SavedAddress {
  id: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  addressNote: string | null;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressPayload {
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  addressNote?: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

export const addressService = {
  async list(): Promise<SavedAddress[]> {
    const { data } = await apiClient.get("/addresses");
    return data.data;
  },
  async create(payload: AddressPayload) {
    const { data } = await apiClient.post("/addresses", payload);
    return data.data as SavedAddress;
  },
  async update(id: string, payload: Partial<AddressPayload>) {
    const { data } = await apiClient.patch(`/addresses/${id}`, payload);
    return data.data as SavedAddress;
  },
  async remove(id: string) {
    await apiClient.delete(`/addresses/${id}`);
  },
  async setDefault(id: string) {
    await apiClient.patch(`/addresses/${id}/set-default`);
  },
};
