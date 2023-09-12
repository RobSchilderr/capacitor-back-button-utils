import { create } from "zustand";

/**
 * useBackButtonStore: A Zustand store for managing back button handlers.
 *
 * Why do we need this store?
 * Capacitor provides a way to listen to the native back button events, but it doesn't offer a built-in system to prioritize 
 * different back button actions based on the current context or UI state. For example, if multiple UI elements (like drawers, 
 * modals, etc.) can respond to the back button, we need a way to determine which action should be executed first.
 * 
 * Ionic, on the other hand, has a built-in priority system for back button actions. However, if we're not using the full Ionic 
 * framework or only using parts of it, we lack this priority feature.
 * 
 * To bridge this gap, we've created this Zustand store to implement our own priority-based system for back button handlers.
 
 
 */

type BackButtonHandler = {
  id?: string;
  handler: () => boolean;
  priority: number;
};

type BackButtonStore = {
  backButtonHandlers: BackButtonHandler[];
  backButtonEvent?: any; // Adjust the type based on the CapApp.addListener return type
  addBackButtonHandler: (handler: () => boolean, priority: number) => string;
  removeBackButtonHandler: (id: string) => void;
  handleBackButton: () => void;
};

export const backButtonStore = create<BackButtonStore>((set, get) => ({
  backButtonHandlers: [],
  backButtonEvent: undefined,

  addBackButtonHandler: (handler, priority) => {
    const id = Math.random().toString(36).substring(2);
    set((state) => ({
      backButtonHandlers: [
        ...state.backButtonHandlers,
        { id, handler, priority },
      ].sort((a, b) => b.priority - a.priority),
    }));
    return id;
  },
  removeBackButtonHandler: (id) => {
    set((state) => ({
      backButtonHandlers: state.backButtonHandlers.filter((h) => h.id !== id),
    }));
  },
  handleBackButton: () => {
    const handlers = get().backButtonHandlers;
    handlers.some((handlerObj) => {
      const shouldContinue = handlerObj.handler();
      return !shouldContinue;
    });
  },
}));

// This is a React hook that wraps the Zustand store.
export const useBackButtonStore = () => {
  const state = backButtonStore.getState();
  // React-specific logic goes here.
  return state;
};
