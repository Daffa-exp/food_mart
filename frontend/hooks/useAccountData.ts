"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { wishlistService } from "@/services/wishlist.service";
import { notificationService } from "@/services/notification.service";
import { userService } from "@/services/user.service";
import { orderHistoryService } from "@/services/order-history.service";
import { addressService, AddressPayload } from "@/services/address.service";
import { reviewService, CreateReviewPayload } from "@/services/review.service";
import { useUser } from "@/hooks/useUser";

export function useWishlist() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistService.list(),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Ditambahkan ke wishlist");
    },
    onError: () => toast.error("Gagal menambah wishlist"),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Dihapus dari wishlist");
    },
    onError: () => toast.error("Gagal menghapus wishlist"),
  });

  const wishlistedIds = new Set((query.data ?? []).map((w) => w.product.id));

  return {
    ...query,
    wishlistedIds,
    isWishlisted: (productId: string) => wishlistedIds.has(productId),
    add: addMutation.mutate,
    remove: removeMutation.mutate,
  };
}

export function useNotifications() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(),
    enabled: !!user,
    refetchInterval: 20_000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = (query.data ?? []).filter((n) => !n.isRead).length;

  return { ...query, unreadCount, markAsRead: markAsRead.mutate, markAllAsRead: markAllAsRead.mutate };
}

export function useProfile() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
    enabled: !!user,
  });
}

export function useMyOrders() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderHistoryService.listMine(),
    enabled: !!user,
    refetchInterval: 15_000,
  });
}

export function useAddresses() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressService.list(),
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["addresses"] });

  const create = useMutation({
    mutationFn: (payload: AddressPayload) => addressService.create(payload),
    onSuccess: () => { invalidate(); toast.success("Alamat berhasil disimpan"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menyimpan alamat"),
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) =>
      addressService.update(id, payload),
    onSuccess: () => { invalidate(); toast.success("Alamat berhasil diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal memperbarui alamat"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: () => { invalidate(); toast.success("Alamat berhasil dihapus"); },
    onError: (e: Error) => toast.error(e.message || "Gagal menghapus alamat"),
  });
  const setDefault = useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => { invalidate(); toast.success("Alamat utama diperbarui"); },
    onError: (e: Error) => toast.error(e.message || "Gagal mengubah alamat utama"),
  });

  return { ...query, create, update, remove, setDefault };
}

export function useMyReviews() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => reviewService.listMine(),
    enabled: !!user,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      toast.success("Terima kasih atas rating & komentarnya!");
    },
    onError: (e: Error) => toast.error(e.message || "Gagal mengirim rating"),
  });
}
