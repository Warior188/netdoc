import { create } from "zustand";
import type { Device } from "@/types";

export type Step = 0 | 1 | 2;

interface EditorState {
  step: Step;
  setStep: (s: Step) => void;

  // topology interaction
  selectedDeviceId: number | null;
  linkingFromId: number | null;
  setSelectedDevice: (id: number | null) => void;
  setLinkingFrom: (id: number | null) => void;

  // active config tab
  activeConfigDevice: string | null;
  setActiveConfigDevice: (name: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  step: 0,
  setStep: (step) => set({ step }),

  selectedDeviceId: null,
  linkingFromId: null,
  setSelectedDevice: (id) => set({ selectedDeviceId: id }),
  setLinkingFrom: (id) => set({ linkingFromId: id }),

  activeConfigDevice: null,
  setActiveConfigDevice: (name) => set({ activeConfigDevice: name }),
}));