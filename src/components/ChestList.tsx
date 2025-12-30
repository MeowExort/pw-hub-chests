import React from 'react';
import { useChestStore } from '../state/chestStore';
import { Trash2, AlertCircle } from 'lucide-react';
import { ChestId } from '../types';

export function ChestList({ onSelect, selectedId }: { onSelect: (id: ChestId) => void, selectedId: ChestId | null }) {
  const { chestIds, setChestIds, data } = useChestStore();

  const handleRemove = (id: ChestId, e: React.MouseEvent) => {
    e.stopPropagation();
    setChestIds(chestIds.filter(c => c !== id));
  };

  return (
    <div className="space-y-3">
      {chestIds.map(id => {
        const chest = data[id];
        const isSelected = id === selectedId;
        
        return (
          <div 
            key={id} 
            className={`
              relative group p-3 rounded-lg border transition-all cursor-pointer flex gap-3
              ${isSelected 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/50 ring-1 ring-indigo-200 dark:ring-indigo-500/20 shadow-sm' 
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md dark:hover:bg-zinc-800/80'
              }
            `}
            onClick={() => onSelect(id)}
          >
            <div className={`w-12 h-12 flex-shrink-0 rounded flex items-center justify-center overflow-hidden transition-colors ${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-gray-100 dark:bg-zinc-800'}`}>
               {chest ? (
                 <img src={chest.iconUrl} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="animate-pulse bg-gray-200 dark:bg-zinc-700 w-full h-full transition-colors" />
               )}
            </div>

            <div className="flex-1 min-w-0">
               {chest ? (
                 <>
                   <h4 className={`font-medium truncate transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-900 dark:text-zinc-100'}`}>{chest.name}</h4>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 transition-colors">{chest.description || 'Нет описания'}</p>
                   {chest.rewards.length === 0 && (
                     <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500 mt-1">
                       <AlertCircle size={12} /> Нет наград
                     </div>
                   )}
                 </>
               ) : (
                 <div className="space-y-2 mt-1">
                   <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 animate-pulse transition-colors" />
                   <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 animate-pulse transition-colors" />
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-1 items-end">
              <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-mono transition-colors">#{id}</span>
              <button 
                onClick={(e) => handleRemove(id, e)}
                className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
      
      {chestIds.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-slate-500 text-sm border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg transition-colors">
          Список сундуков пуст
        </div>
      )}
    </div>
  );
}
