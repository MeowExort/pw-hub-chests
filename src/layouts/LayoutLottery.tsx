import { useState, useMemo, useEffect } from 'react';
import { useChestStore } from '../state/chestStore';
import { ChestOpenSimulator } from '../components/ChestOpenSimulator';
import { AddChestForm } from '../components/AddChestForm';
import { ChestLoader } from '../components/ChestLoader';
import { SessionInventory } from '../components/SessionInventory';
import { PossibleRewardsList } from '../components/PossibleRewardsList';
import { X, Sparkles } from 'lucide-react';

export function LayoutLottery() {
  const { chestIds, setChestIds, data } = useChestStore();
  
  // Initialize from URL param if present
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const id = idParam ? Number(idParam) : null;
    return (id && !isNaN(id)) ? id : null;
  });

  // Sync URL -> State (Handle Back/Forward & External Navigation)
  useEffect(() => {
    const handleLocationChange = () => {
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        const id = idParam ? Number(idParam) : null;
        if (id && !isNaN(id)) {
            setSelectedId(id);
        }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Sync State -> URL
  useEffect(() => {
     if (selectedId) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('id') !== String(selectedId)) {
            url.searchParams.set('id', String(selectedId));
            window.history.replaceState(null, '', url);
        }
     }
  }, [selectedId]);

  const selectedChest = useMemo(() => (selectedId ? data[selectedId] : null), [selectedId, data]);
  const rewards = useMemo(() => selectedChest?.rewards || [], [selectedChest]);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-full gap-4 items-stretch lg:overflow-hidden">
      
      {/* LEFT COLUMN: Possible Rewards */}
      <div className="w-full lg:w-80 flex-none h-72 lg:h-full order-2 lg:order-1">
         <PossibleRewardsList rewards={rewards} />
      </div>

      {/* CENTER COLUMN: Main Content */}
      <div className="flex-1 flex flex-col w-full h-auto lg:h-full min-w-0 gap-4 order-1 lg:order-2">
         <div className="flex-none">
             <ChestLoader />
         </div>

         <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors overflow-hidden flex flex-col">
            {/* Header with Title and Chest Selector */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-800/30 flex-none flex flex-col gap-4">
                <div className="flex items-center justify-between">
                     <div className="relative">
                        <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-red-600 uppercase tracking-widest flex items-center gap-2">
                           <Sparkles className="text-amber-500 w-5 h-5" />
                           Испытай удачу
                        </h2>
                     </div>
                     <div>
                        <AddChestForm />
                     </div>
                </div>

                {/* Horizontal Chips */}
                <div className="w-full overflow-x-auto pb-1">
                    <div className="flex gap-2 min-w-max">
                       {chestIds.map(id => (
                         <div key={id} className="relative group">
                            <button 
                              onClick={() => setSelectedId(id)}
                              className={`
                                 px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-2 whitespace-nowrap
                                 ${id === selectedId 
                                   ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 ring-1 ring-amber-200 dark:ring-amber-500/20' 
                                   : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-white/10 hover:border-amber-200 dark:hover:border-amber-500/30'}
                              `}
                            >
                              {data[id] ? (
                                <>
                                  <img src={data[id]?.iconUrl} className="w-4 h-4 object-contain" alt="" />
                                  {data[id]?.name}
                                </>
                              ) : `ID: ${id}`}
                            </button>
                            <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setChestIds(chestIds.filter(c => c !== id));
                                  if (selectedId === id) setSelectedId(null);
                              }}
                              className="absolute -top-1 -right-1 bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200 dark:hover:bg-red-800 z-10"
                            >
                              <X size={10} />
                            </button>
                         </div>
                       ))}
                       {chestIds.length === 0 && (
                           <span className="text-xs text-gray-400 italic py-1">Нет добавленных сундуков</span>
                       )}
                    </div>
                </div>
            </div>

            {/* Main Simulator Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-gradient-to-b from-white to-amber-50/30 dark:from-zinc-900 dark:to-zinc-950 min-h-[500px] lg:min-h-0">
               {selectedId ? (
                 <div className="w-full max-w-3xl flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center text-center animate-fadeIn">
                       <div className="w-20 h-20 bg-amber-100 dark:bg-zinc-800/50 rounded-xl flex items-center justify-center mb-2 ring-1 ring-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-colors">
                          {selectedChest ? (
                            <img src={selectedChest.iconUrl} alt="" className="w-14 h-14 object-contain drop-shadow-md" />
                          ) : (
                            <div className="animate-pulse w-12 h-12 bg-slate-300 dark:bg-zinc-700 rounded" />
                          )}
                       </div>
                       <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 transition-colors">{selectedChest?.name || 'Загрузка...'}</h3>
                       <p className="text-slate-500 dark:text-zinc-400 text-xs max-w-md line-clamp-2 mt-1 px-4">{selectedChest?.description}</p>
                    </div>

                    <div className="w-full">
                       <ChestOpenSimulator 
                           selectedId={selectedId} 
                           onSelect={setSelectedId} 
                           displayMode="roulette" 
                           hideRewardsList
                           hideSelector
                       />
                    </div>
                 </div>
               ) : (
                  <div className="text-center text-slate-400 dark:text-zinc-600 transition-colors">
                     <Sparkles className="w-12 h-12 mb-2 mx-auto opacity-20" />
                     <p className="text-lg font-light">Выберите сундук сверху для игры</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: Inventory */}
      <div className="w-full lg:w-80 flex-none h-72 lg:h-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors overflow-hidden order-3">
          <SessionInventory variant="panel" />
      </div>
    </div>
  );
}
