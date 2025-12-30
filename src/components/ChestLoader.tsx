import { useEffect } from 'react';
import { useChestStore } from '../state/chestStore';
import { createQueue } from '../lib/queue';
import { loadChest } from '../lib/chestApi';
import { ProgressBar } from './ProgressBar';

export function ChestLoader() {
  const { chestIds, setData, progress, setProgress, setLoading, loading } = useChestStore();

  useEffect(() => {
    let canceled = false;
    const missing = chestIds.filter(id => !useChestStore.getState().data[id]);

    if (missing.length === 0) return;

    async function run() {
      setLoading(true);
      setProgress(0, missing.length);
      const enqueue = createQueue(3);
      let done = 0;
      
      await Promise.all(
        missing.map((id) => enqueue(async () => {
          try {
            if (canceled) return;
            const data = await loadChest(id);
            if (!canceled) setData(id, data);
          } catch (e) {
            console.error(`Failed to load chest ${id}`, e);
            if (!canceled) setData(id, undefined); 
          } finally {
            done++;
            if (!canceled) setProgress(done, missing.length);
          }
        }))
      );
      if (!canceled) setLoading(false);
    }
    run();
    return () => { canceled = true; };
  }, [chestIds]); // Re-run when list changes

  if (!loading && progress.done === progress.total) return null;

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="my-4 space-y-2 p-4 bg-white dark:bg-zinc-900 rounded shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-zinc-400">
        <span>Загрузка данных сундуков...</span>
        <span className="font-mono tabular-nums">{progress.done}/{progress.total}</span>
      </div>
      <ProgressBar percent={percent} />
    </div>
  );
}
