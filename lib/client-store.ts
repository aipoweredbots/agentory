"use client";

import { create } from "zustand";

type UpgradeState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useUpgradeStore = create<UpgradeState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}));
