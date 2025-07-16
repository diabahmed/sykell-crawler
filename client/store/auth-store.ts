import apiClient from "@/api/api";
import { create } from "zustand";

export interface User {
  ID: number;
  firstName: string;
  lastName: string;
  email: string;
}

type AuthStatus = "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  login: (user: User) => void;
  logout: () => void;
  // The initialize function will be used by our hydrator
  initialize: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unauthenticated", // Default to unauthenticated
  login: (user) => set({ user, status: "authenticated" }),
  logout: () => {
    apiClient.post("/auth/logout");
    set({ user: null, status: "unauthenticated" });
  },
  initialize: (user) => {
    if (user) {
      set({ user, status: "authenticated" });
    } else {
      set({ user: null, status: "unauthenticated" });
    }
  },
}));
