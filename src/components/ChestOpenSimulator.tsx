import { useMemo, useState, useEffect, useCallback } from 'react';
import { useChestStore } from '../state/chestStore';
import { useGlobalStatsStore } from '../state/globalStatsStore';
import { pickByChance } from '../lib/weightedRandom';
import { ChestRewardItem } from '../types';
import { PackageOpen, Coins } from 'lucide-react';
import { Roulette } from './Roulette';
import { RareDropCelebration } from './RareDropCelebration';
import clsx from 'clsx';

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
  compact?: boolean; // For dashboard view
  displayMode?: 'grid' | 'roulette';
  hideRewardsList?: boolean;
  hideSelector?: boolean;
}

export function ChestOpenSimulator({ 
  selectedId, 
  onSelect, 
  compact, 
  displayMode = 'grid', 
  hideRewardsList = false, 
  hideSelector = false 
}: Props) {
  const data = useChestStore(s => s.data);
  const addToInventory = useChestStore(s => s.addToInventory);
  
  const incrementGlobalCount = useGlobalStatsStore(s => s.incrementGlobalCount);
  const reportDrops = useGlobalStatsStore(s => s.reportDrops);

  const [count, setCount] = useState(1);
  const [results, setResults] = useState<ChestRewardItem[]>([]);
  const [celebrationItem, setCelebrationItem] = useState<ChestRewardItem | null>(null);
  
  // Roulette state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState<ChestRewardItem | null>(null);
  const [spinKey, setSpinKey] = useState(0);

  const chest = useMemo(() => (selectedId ? data[selectedId] : undefined), [selectedId, data]);

  // Reset state when chest changes
  useEffect(() => {
    setResults([]);
    setRouletteWinner(null);
    setIsSpinning(false);
    setCelebrationItem(null);
  }, [selectedId]);

  const groupedResults = useMemo(() => {
    const acc: Record<number, { item: ChestRewardItem; count: number }> = {};
    for (const item of results) {
      if (!acc[item.itemId]) {
        acc[item.itemId] = { item, count: 0 };
      }
      acc[item.itemId].count++;
    }
    return Object.values(acc).sort((a, b) => b.count - a.count);
  }, [results]);

  const handleOpen = () => {
    if (!chest || chest.rewards.length === 0) return;

    if (displayMode === 'roulette') {
      const winner = pickByChance(chest.rewards);
      setRouletteWinner(winner);
      setSpinKey(k => k + 1);
      setIsSpinning(true);
      incrementGlobalCount(1, chest.id);
      // We don't add to inventory yet, wait for animation
    } else {
      const res = pickByChance(chest.rewards, count);
      const newResults = Array.isArray(res) ? res : [res];
      setResults(newResults);
      addToInventory(newResults);
      incrementGlobalCount(newResults.length, chest.id);

      // Report top 5 rarest drops
      const sorted = [...newResults].sort((a, b) => a.chance - b.chance);
      reportDrops(sorted.slice(0, 5));
    }
  };

  const handleRouletteComplete = useCallback(() => {
    setIsSpinning(false);
    if (rouletteWinner) {
        addToInventory([rouletteWinner]);
        setResults([rouletteWinner]);
        reportDrops([rouletteWinner]);
        
        // Wow Effect for rare items in roulette mode
        if (rouletteWinner.chance < 0.09) {
          setCelebrationItem(rouletteWinner);
        }
    }
  }, [rouletteWinner, addToInventory, reportDrops]);

  const validChests = Object.values(data).filter((c): c is NonNullable<typeof c> => !!c);

  if (validChests.length === 0) {
    return <div className="text-gray-500 dark:text-slate-400 text-center py-8">Нет данных для симуляции</div>;
  }

  return (
    <div className="space-y-6">
      <RareDropCelebration item={celebrationItem} onClose={() => setCelebrationItem(null)} />
      
      <div className={clsx(
        "flex gap-4 items-end flex-wrap", 
        compact ? "flex-col items-stretch" : (displayMode === 'roulette' ? "justify-center" : "")
      )}>
        {!hideSelector && (
          <div className="flex-1 min-w-[200px]">
             <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Выберите сундук</label>
             <select 
               className="block w-full border-gray-300 dark:border-white/10 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border transition-colors"
               value={selectedId ?? ''} 
               onChange={(e)=> onSelect(Number(e.target.value))}
               disabled={isSpinning}
             >
              <option value="" disabled>-- Не выбрано --</option>
              {validChests.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {displayMode === 'grid' && (
            <div className="w-24">
               <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Количество</label>
               <select 
                 value={count} 
                 onChange={(e)=>setCount(Number(e.target.value))} 
                 className="block w-full border-gray-300 dark:border-white/10 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border transition-colors"
               >
                 {[1, 25, 75, 150, 250, 500, 1500, 5000, 10000].map(v => (
                   <option key={v} value={v}>{v}</option>
                 ))}
               </select>
            </div>
        )}

        <button 
          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-md shadow-md hover:from-amber-600 hover:to-orange-700 transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]"
          disabled={!chest || chest.rewards.length === 0 || isSpinning} 
          onClick={handleOpen}
        >
          <PackageOpen size={20} />
          {isSpinning ? 'Открываем...' : 'Открыть'}
        </button>
      </div>

      {chest && (
        <div className="space-y-4">
           {/* Roulette Display */}
           {displayMode === 'roulette' && rouletteWinner && (
               <div className="mb-8">
                   <Roulette 
                        key={spinKey}
                        rewards={chest.rewards} 
                        winner={rouletteWinner} 
                        onComplete={handleRouletteComplete} 
                   />
               </div>
           )}

           {/* Results Grid (Only show in grid mode OR in roulette mode if not spinning and we have results) */}
           {results.length > 0 && (
             <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-slate-200 dark:border-white/5 max-h-[500px] overflow-y-auto transition-colors">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-zinc-500 mb-3 uppercase tracking-wider">Результаты ({results.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {groupedResults.map(({ item: r, count }) => (
                    <div key={r.itemId} className={clsx(
                        "relative flex flex-col items-center p-3 border dark:border-white/5 rounded bg-white dark:bg-zinc-800 shadow-sm transition-all text-center animate-fadeIn text-slate-900 dark:text-zinc-100",
                        displayMode === 'grid' && "hover:shadow-md hover:-translate-y-0.5"
                    )}>
                      {count > 1 && (
                        <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 border border-white dark:border-zinc-700">
                          x{count}
                        </span>
                      )}
                      <div className="relative">
                        <img src={r.iconUrl} alt="" className="w-10 h-10 mb-2 object-contain" />
                        {r.chance < 1 && <div className="absolute inset-0 bg-amber-500/10 rounded-full filter blur-md -z-10"></div>}
                      </div>
                      <div className="text-xs font-medium line-clamp-2 min-h-[2.5em]" title={r.name}>{r.name}</div>
                      <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">{r.chance.toFixed(2)}%</div>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {!hideRewardsList && (
             <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-100 dark:border-white/5 transition-colors">
               <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                 <Coins size={16} />
                 Возможные награды
               </h4>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {chest.rewards.map(r => (
                    <div key={r.itemId} className="group flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded transition-colors text-slate-900 dark:text-zinc-300">
                      <img src={r.iconUrl} alt="" className="w-6 h-6 object-contain" />
                      <span className="flex-1 truncate" title={r.name}>{r.name}</span>
                      <div className="flex items-center gap-2">
                        <a 
                            href={r.link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                            Wiki ↗
                        </a>
                        <span className="text-xs text-gray-500 dark:text-zinc-500 font-mono">{r.chance.toFixed(3)}%</span>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
