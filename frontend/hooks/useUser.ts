"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useUser() {
  const { user, session, isLoading, isInitialized, init } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) init();
  }, [isInitialized, init]);

  return { user, session, isLoading };
}
