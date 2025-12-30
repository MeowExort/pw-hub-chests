import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ChestFull, ChestId, ChestRewardItem, InventoryItem } from '../types';

interface ChestState {
  chestIds: ChestId[];
  data: Record<ChestId, ChestFull | undefined>;
  loading: boolean;
  progress: { done: number; total: number };
  
  // Layout switch state
  layout: 'dashboard' | 'lottery';
  setLayout: (l: 'dashboard' | 'lottery') => void;

  // Theme state
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Session Inventory
  sessionInventory: Record<number, InventoryItem>;
  setSessionInventory: (inv: Record<number, InventoryItem>) => void;
  addToInventory: (items: ChestRewardItem[]) => void;
  clearInventory: () => void;

  setChestIds: (ids: ChestId[]) => void;
  setData: (id: ChestId, data?: ChestFull) => void;
  setProgress: (done: number, total: number) => void;
  setLoading: (v: boolean) => void;
}

export const useChestStore = create<ChestState>()(
  persist(
    (set) => ({
      chestIds: [88702], // Default IDs
      data: {},
      loading: false,
      progress: { done: 0, total: 0 },
      layout: 'dashboard',
      sessionInventory: {},
      theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      
      setLayout: (l) => set({ layout: l }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      setSessionInventory: (inv) => set({ sessionInventory: inv }),
      addToInventory: (items) => set((state) => {
        const newInv = { ...state.sessionInventory };
        items.forEach(item => {
          if (newInv[item.itemId]) {
            newInv[item.itemId] = { 
              ...newInv[item.itemId], 
              count: newInv[item.itemId].count + 1 
            };
          } else {
            newInv[item.itemId] = { item, count: 1 };
          }
        });
        return { sessionInventory: newInv };
      }),
      clearInventory: () => set({ sessionInventory: {} }),

      setChestIds: (ids) => set({ chestIds: ids }),
      setData: (id, data) => set((s) => ({ data: { ...s.data, [id]: data } })),
      setProgress: (done, total) => set({ progress: { done, total } }),
      setLoading: (v) => set({ loading: v }),
    }),
    {
      name: 'pw-chest-storage', // unique name
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chestIds: state.chestIds,
        data: state.data,
        theme: state.theme,
        sessionInventory: state.sessionInventory,
        layout: state.layout,
      }),
    }
  )
);
