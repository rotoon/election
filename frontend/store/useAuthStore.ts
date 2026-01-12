import { create } from "zustand";
import { persist } from "zustand/middleware";

// type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  national_id: string;
  address: string;
  role: "admin" | "ec" | "voter";
  constituency_id?: number | null;
  created_at?: string;
}

interface AuthState {
  user: Profile | null;
  token: string | null;
  setUser: (user: Profile | null) => void;
  setToken: (token: string | null) => void;
  login: (user: Profile, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);
