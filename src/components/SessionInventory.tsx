import { useChestStore } from '../state/chestStore';
import { Trash2, Package } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  className?: string;
  variant?: 'card' | 'panel';
}

export function SessionInventory({ className, variant = 'card' }: Props) {
  const { sessionInventory, clearInventory } = useChestStore();
  
  const items = Object.values(sessionInventory).sort((a, b) => b.count - a.count);
  const totalCount = items.reduce((acc, i) => acc + i.count, 0);

  const containerClass = variant === 'card' 
    ? "bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-white/5 shadow-sm mt-6 transition-colors"
    : "flex flex-col h-full";

  if (items.length === 0) {
      return (
        <div className={clsx(containerClass, "text-center text-slate-400 dark:text-zinc-500 text-sm flex flex-col items-center justify-center", className)}>
            <Package className="mb-2 opacity-50" size={24} />
            <p>Инвентарь пуст</p>
        </div>
      );
  }

  return (
    <div className={clsx(containerClass, className)}>
      <div className={clsx("flex items-center justify-between mb-4", variant === 'panel' && "p-4 border-b border-gray-100 dark:border-white/5")}>
        <h3 className="text-md font-bold flex items-center gap-2 text-slate-700 dark:text-zinc-200">
           <Package size={18} />
           <span className="hidden lg:inline">Инвентарь</span>
           <span className="lg:hidden">Инв.</span>
           <span className="text-xs font-normal text-slate-400 dark:text-zinc-500 ml-2">
             ({totalCount})
           </span>
        </h3>
        <button 
           onClick={() => {
               if (confirm('Вы уверены, что хотите сбросить весь прогресс сессии?')) {
                   clearInventory();
               }
           }}
           className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
           <Trash2 size={12} />
        </button>
      </div>
      
      <div className={clsx(
          "grid gap-2 overflow-y-auto pr-1",
          variant === 'panel' ? "flex-1 content-start p-2 grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-h-[400px]"
      )}>
        {items.map(({ item, count }) => {
          const realChance = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={item.itemId} className="flex items-center gap-2 p-2 border border-transparent dark:border-white/5 rounded bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
              <div className="relative flex-shrink-0">
                <img src={item.iconUrl} alt="" className="w-8 h-8 object-contain" />
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1 py-0 rounded-full min-w-[16px] text-center shadow-sm border border-white dark:border-zinc-900">
                  {count}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate text-slate-700 dark:text-zinc-200" title={item.name}>{item.name}</div>
                <div className="text-[9px] text-slate-400 dark:text-zinc-500">{realChance.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
