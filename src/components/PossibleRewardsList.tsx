import { ChestRewardItem } from '../types';
import { Coins } from 'lucide-react';

interface Props {
  rewards: ChestRewardItem[];
}

export function PossibleRewardsList({ rewards }: Props) {
  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-zinc-600 p-4 text-center">
        <Coins size={32} className="mb-2 opacity-50" />
        <p className="text-sm">Нет доступных наград</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-white/5 flex-none bg-inherit z-10">
         <h3 className="text-lg font-bold flex items-center gap-2 dark:text-zinc-100">
            <Coins size={20} className="text-amber-500" />
            Возможный лут
         </h3>
         <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
           {rewards.length} предметов
         </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
         <div className="space-y-1">
            {rewards.map(r => (
              <div key={r.itemId} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors group">
                <div className="relative w-8 h-8 flex-shrink-0">
                   <img src={r.iconUrl} alt="" className="w-full h-full object-contain" />
                   {r.chance < 1 && (
                     <div className="absolute inset-0 bg-amber-500/10 rounded-full filter blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="text-sm font-medium text-slate-700 dark:text-zinc-200 truncate">{r.name}</div>
                   <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {(r.chance).toFixed(3)}%
                      </span>
                      <a 
                        href={r.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Wiki ↗
                      </a>
                   </div>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
