import { useEffect, useRef, useState, useMemo } from 'react';
import { ChestRewardItem } from '../types';
import { pickByChance } from '../lib/weightedRandom';

interface Props {
  rewards: ChestRewardItem[];
  winner: ChestRewardItem;
  onComplete: () => void;
}

export function Roulette({ rewards, winner, onComplete }: Props) {
  const [items, setItems] = useState<ChestRewardItem[]>([]);
  const [spinning, setSpinning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Configuration
  const CARD_WIDTH = 128; // width (112px) + gap (16px)
  const WINNER_INDEX = 40; // Where the winner will be placed
  const TOTAL_ITEMS = 50; 

  useEffect(() => {
    // Generate the tape
    const tape: ChestRewardItem[] = [];
    
    // Fill with random items
    for (let i = 0; i < TOTAL_ITEMS; i++) {
      if (i === WINNER_INDEX) {
        tape.push(winner);
      } else {
        // Pick random filler
        const picked = pickByChance(rewards);
        tape.push(picked);
      }
    }
    setItems(tape);

    // Trigger animation shortly after mount
    const timer = setTimeout(() => {
        setSpinning(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [rewards, winner]);

  // Handle animation completion
  useEffect(() => {
      if (spinning) {
          const duration = 9000; // 9s match css
          const timer = setTimeout(() => {
              onComplete();
          }, duration);
          return () => clearTimeout(timer);
      }
  }, [spinning, onComplete]);

  // Calculate final position
  // We align the center of the winner card to the center of the container (left-1/2)
  const winnerCenterFromStart = WINNER_INDEX * CARD_WIDTH + (CARD_WIDTH / 2);
  
  // Stable random offset per spin instance
  const randomizeLanding = useMemo(() => Math.floor(Math.random() * 64) - 32, []); // +/- 32px

  // Target translation: shift left by distance to winner center, plus random offset
  const targetTranslate = -winnerCenterFromStart + randomizeLanding;

  return (
    <div className="relative w-full max-w-3xl mx-auto overflow-hidden bg-slate-100 dark:bg-zinc-900 rounded-xl border-4 border-amber-500 shadow-2xl p-4">
      {/* Center Marker / Needle */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-500 z-20 -translate-x-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-red-600 z-20"></div>
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-red-600 z-20"></div>

      {/* Fade overlay edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-100 dark:from-zinc-900 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-100 dark:from-zinc-900 to-transparent z-10"></div>

      {/* Tape */}
      <div 
        ref={scrollContainerRef}
        className="relative left-1/2 flex gap-4 py-4 transition-transform ease-[cubic-bezier(0.1,0.9,0.2,1)] will-change-transform"
        style={{
            transform: spinning ? `translateX(${targetTranslate}px)` : 'translateX(0px)',
            transitionDuration: '9000ms',
            width: `${items.length * CARD_WIDTH}px`
        }}
      >
        {items.map((item, idx) => {
            return (
                <div 
                    key={idx}
                    className="w-28 h-32 flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border bg-white dark:bg-zinc-800 shadow-md border-slate-200 dark:border-white/10"
                >
                    <img src={item.iconUrl} alt="" className="w-12 h-12 object-contain mb-2" />
                    <div className="text-[10px] font-medium text-center leading-tight line-clamp-2 w-full text-slate-700 dark:text-zinc-200" title={item.name}>
                        {item.name}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">{item.chance.toFixed(2)}%</div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
