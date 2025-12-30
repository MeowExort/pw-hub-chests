import { useEffect, useState } from 'react';
import { useChestStore } from '../state/chestStore';
import { NewChestModal } from './NewChestModal';

interface SSEEvent {
  type: string;
  ids?: number[];
}

export function NotificationManager() {
  const { chestIds, setChestIds, setLayout } = useChestStore();
  const [newChestIds, setNewChestIds] = useState<number[]>([]);

  // 1. Check for recent chests on mount
  useEffect(() => {
    async function checkRecent() {
      try {
        const res = await fetch('/api/admin/recent');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.ids)) {
            // Filter out chests we already have
            const unseen = data.ids.filter((id: number) => !chestIds.includes(id));
            if (unseen.length > 0) {
              setNewChestIds(prev => Array.from(new Set([...prev, ...unseen])));
            }
          }
        }
      } catch (e) {
        console.error('Failed to check recent chests', e);
      }
    }
    checkRecent();
  }, []); // Run once on mount (and when chestIds changes? No, only on mount to check "what did I miss")
  
  // Note: if I add chestIds dependency, it might trigger loop if I add them. 
  // We only want to check "global recent" vs "local" on startup.

  // 2. Listen for live events
  useEffect(() => {
    const evtSource = new EventSource('/api/events');

    evtSource.onmessage = (e) => {
      try {
        const data: SSEEvent = JSON.parse(e.data);
        if (data.type === 'new_chests' && data.ids) {
          // Add to notification queue if not already present in STORE (to avoid notifying about what we have)
          // Actually, we should check current store state.
          const currentIds = useChestStore.getState().chestIds;
          const unseen = data.ids.filter(id => !currentIds.includes(id));
          
          if (unseen.length > 0) {
             setNewChestIds(prev => Array.from(new Set([...prev, ...unseen])));
          }
        }
      } catch (err) {
        console.error('SSE Parse Error', err);
      }
    };

    return () => {
      evtSource.close();
    };
  }, []);

  const handleClose = () => {
    setNewChestIds([]);
  };

  const handleTry = () => {
    if (newChestIds.length === 0) return;

    // Add all new chests to the store
    // Check again for duplicates just in case
    const currentIds = useChestStore.getState().chestIds;
    const toAdd = newChestIds.filter(id => !currentIds.includes(id));
    if (toAdd.length > 0) {
        setChestIds([...currentIds, ...toAdd]);
    }

    // Redirect to Lottery view for the first chest
    const firstId = newChestIds[0];
    
    // We update URL manually so LayoutLottery picks it up
    const params = new URLSearchParams(window.location.search);
    params.set('view', 'lottery');
    params.set('id', String(firstId));
    window.history.pushState(null, '', `?${params.toString()}`);
    
    // Update store layout (triggers app render)
    setLayout('lottery');
    
    setNewChestIds([]);
  };

  return (
    <NewChestModal 
      chestIds={newChestIds} 
      onClose={handleClose} 
      onTry={handleTry} 
    />
  );
}
