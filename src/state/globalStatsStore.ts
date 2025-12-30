import { create } from 'zustand';
import { ChestRewardItem } from '../types';

interface GlobalStatsState {
  totalOpened: number;
  mostPopularChestId: number | null;
  recentDrops: ChestRewardItem[];
  setTotalOpened: (n: number) => void;
  setMostPopularChestId: (id: number | null) => void;
  setRecentDrops: (items: ChestRewardItem[]) => void;
  incrementGlobalCount: (n: number, chestId?: number) => Promise<void>;
  reportDrops: (items: ChestRewardItem[]) => Promise<void>;
}

export const useGlobalStatsStore = create<GlobalStatsState>((set) => ({
  totalOpened: 0,
  mostPopularChestId: null,
  recentDrops: [],
  setTotalOpened: (n) => set({ totalOpened: n }),
  setMostPopularChestId: (id) => set({ mostPopularChestId: id }),
  setRecentDrops: (items) => set({ recentDrops: items }),
  incrementGlobalCount: async (count, chestId) => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, chestId }),
      });
    } catch (e) {
      console.error('Error incrementing stats', e);
    }
  },
  reportDrops: async (items) => {
    try {
      await fetch('/api/drops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
    } catch (e) {
        console.error('Error reporting drops', e);
    }
  }
}));

export function initGlobalStatsSync() {
    // Prevent SSR issues if applicable, though this is SPA
    if (typeof window === 'undefined') return () => {};

    const { setTotalOpened, setRecentDrops, setMostPopularChestId } = useGlobalStatsStore.getState();
    
    // Initial fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
         if (data && typeof data.totalOpened === 'number') {
             setTotalOpened(data.totalOpened);
         }
         if (data && (typeof data.mostPopularChestId === 'number' || data.mostPopularChestId === null)) {
             setMostPopularChestId(data.mostPopularChestId);
         }
      })
      .catch(console.error);

    // Initial fetch drops
    fetch('/api/drops')
      .then(res => res.json())
      .then(data => {
         if (Array.isArray(data)) {
             setRecentDrops(data);
         }
      })
      .catch(console.error);

    const eventSource = new EventSource('/api/events');
    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'stats_update') {
                if (typeof data.count === 'number') setTotalOpened(data.count);
                if (data.mostPopularChestId !== undefined) setMostPopularChestId(data.mostPopularChestId);
            }
            if (data.type === 'drops_update' && Array.isArray(data.items)) {
                setRecentDrops(data.items);
            }
        } catch (e) {
            console.error('SSE Error', e);
        }
    };
    
    return () => eventSource.close();
}
