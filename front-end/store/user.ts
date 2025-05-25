import { DifficultyLevel } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserStore = {
  userLevel: DifficultyLevel | null;
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUserLevel: (level: DifficultyLevel) => void;
  clearUserStore: () => void;
};

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      userLevel: null,
      setUserLevel: (level: DifficultyLevel) => set({ userLevel: level }),
      clearUserStore: () => set({ userLevel: null }),
      setHasHydrated: (hasHydrated: boolean) =>
        set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: "user-store",
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);

export default useUserStore;
