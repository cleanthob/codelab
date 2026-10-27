import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  autoplay: boolean;
  expandedModule?: string | null;
  modulesListCollapsed: boolean;
};

type Actions = {
  setAutoplay: (autoplay: boolean) => void;
  setExpandedModule: (expandedModule: string | undefined) => void;
  setModulesListCollapsed: (modulesListCollapsed: boolean) => void;
};

type Store = State & Actions;

export const usePreferencesStore = create<Store>()(
  persist(
    (set) => ({
      autoplay: false,
      expandedModule: null,
      modulesListCollapsed: false,

      setAutoplay: (autoplay) => set({ autoplay }),

      setExpandedModule: (expandedModule) => set({ expandedModule }),

      setModulesListCollapsed: (modulesListCollapsed) =>
        set({ modulesListCollapsed }),
    }),
    { name: "codelab:preferences" },
  ),
);
