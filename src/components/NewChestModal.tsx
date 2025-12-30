import { useEffect, useState } from 'react';
import { ChestFull } from '../types';
import { loadChest } from '../lib/chestApi';
import { Sparkles, X, Gift } from 'lucide-react';

interface Props {
  chestIds: number[];
  onClose: () => void;
  onTry: () => void;
}

export function NewChestModal({ chestIds, onClose, onTry }: Props) {
  const [data, setData] = useState<ChestFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chestIds.length > 0) {
      setLoading(true);
      // Load the first chest to show details
      loadChest(chestIds[0])
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [chestIds]);

  if (chestIds.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-white/10 overflow-hidden transform transition-all scale-100 animate-slideInUp relative">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-8 flex flex-col items-center text-center relative z-0">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-bounce">
            <Gift size={32} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {chestIds.length > 1 ? 'Новые сундуки!' : 'Новый сундук!'}
          </h2>
          
          <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">
             Добавлен{chestIds.length > 1 ? 'ы' : ''} в коллекцию. Хотите испытать удачу?
          </p>

          {/* Chest Preview */}
          <div className="w-full bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5 flex flex-col items-center min-h-[140px] justify-center">
            {loading ? (
              <div className="animate-pulse flex flex-col items-center gap-3">
                 <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-700 rounded" />
                 <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            ) : data ? (
              <>
                 <img src={data.iconUrl} alt="" className="w-16 h-16 object-contain drop-shadow-md mb-3" />
                 <h3 className="font-bold text-gray-800 dark:text-zinc-100">{data.name}</h3>
                 {data.description && (
                   <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 line-clamp-2 max-w-[200px]">
                     {data.description}
                   </p>
                 )}
                 {chestIds.length > 1 && (
                   <div className="mt-3 text-xs font-mono text-indigo-500 dark:text-indigo-400">
                     + ещё {chestIds.length - 1} шт.
                   </div>
                 )}
              </>
            ) : (
               <div className="text-gray-400 text-sm">Не удалось загрузить информацию</div>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Нет
            </button>
            <button
              onClick={onTry}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              Попробовать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
