"use client";

import { useRef } from "react";
import { useAuthStore, User } from "./auth-store";

interface AuthStoreHydratorProps {
  user: User | null;
  children: React.ReactNode;
}

export function AuthStoreHydrator({ user, children }: AuthStoreHydratorProps) {
  // Use a ref to ensure the store is initialized only once
  const initialized = useRef(false);

  // Get the initialize function from the store
  const { initialize } = useAuthStore();

  // Run the initialization on the first render
  if (!initialized.current) {
    initialize(user);
    initialized.current = true;
  }

  return <>{children}</>;
}
