import { useEffect, useRef } from 'react';
import { useGlobalStatsStore } from '../state/globalStatsStore';
import { Sparkles } from 'lucide-react';
import { ChestRewardItem } from '../types';
import clsx from 'clsx';

export function RecentDropsCarousel() {
  const { recentDrops } = useGlobalStatsStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to start when new items arrive
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [recentDrops]);

  if (recentDrops.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-white/5 py-2 overflow-hidden relative z-10">
      <div className="flex items-center w-full">
        {/* Static Label */}
        <div className="flex-none pl-4 pr-3 z-20 bg-white dark:bg-zinc-900 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-zinc-400 whitespace-nowrap shadow-[10px_0_20px_-5px_rgba(255,255,255,1)] dark:shadow-[10px_0_20px_-5px_rgba(24,24,27,1)] h-full py-1">
           <Sparkles size={14} className="text-amber-500" />
           <span>Недавно выпало:</span>
        </div>
        
        {/* Carousel Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
        > 
           <div className="flex px-2 w-max">
             {recentDrops.map((item) => (
               <DropItem 
                 key={item.uid} 
                 item={item} 
                 className="animate-expand mr-2"
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function DropItem({ item, className }: { item: ChestRewardItem, className?: string }) {
    return (
     <a 
       href={item.link}
       target="_blank"
       rel="noopener noreferrer"
       className={clsx(
         "flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-full pl-1 pr-3 py-0.5 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors flex-shrink-0 group",
         className
       )}
       title={`Шанс: ${item.chance}%`}
     >
        <img src={item.iconUrl} alt={item.name} className="w-5 h-5 rounded-full" />
        <span className="text-xs font-medium text-gray-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[150px]">{item.name}</span>
     </a>
    )
}
