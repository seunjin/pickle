import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewState {
  listForm: "card" | "list";
  setListForm: (form: "card" | "list") => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      listForm: "card",
      setListForm: (form) => set({ listForm: form }),
    }),
    {
      name: "pickle-view-storage",
    },
  ),
);
