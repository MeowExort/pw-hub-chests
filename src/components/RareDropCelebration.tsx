import { ChestRewardItem } from '../types';
import { Sparkles, Star, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  item: ChestRewardItem | null;
  onClose: () => void;
}

export function RareDropCelebration({ item, onClose }: Props) {
  const [show, setShow] = useState(false);
  const [flashVisible, setFlashVisible] = useState(true);

  useEffect(() => {
    if (item) {
      setShow(true);
      setFlashVisible(true);
      // Remove flash element after animation completes to prevent blocking content
      const timer = setTimeout(() => setFlashVisible(false), 800);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [item]);

  if (!item || !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" onClick={onClose}>
      {/* 1. Dark Backdrop with Blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fadeIn" />

      {/* 2. Rotating Sunburst / Rays */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-[200vmax] h-[200vmax] animate-spin-slow bg-[repeating-conic-gradient(from_0deg,#f59e0b_0deg_10deg,transparent_10deg_20deg)]" 
             style={{ maskImage: 'radial-gradient(circle, transparent 10%, black 100%)' }} />
      </div>

      {/* 3. Initial Flash - Conditionally rendered */}
      {flashVisible && (
        <div className="absolute inset-0 bg-white pointer-events-none animate-flash z-[110]" />
      )}

      {/* 4. Main Content Card */}
      <div 
        className="relative z-[105] flex flex-col items-center justify-center text-center animate-zoomIn max-w-lg w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Legendary Text Group */}
        <div className="relative mb-8 animate-shake">
             <div className="absolute -inset-4 bg-amber-500/20 blur-xl rounded-full animate-pulse" />
             <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-amber-600 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] transform -rotate-2">
                LEGENDARY
             </h2>
             <div className="absolute top-0 left-0 w-full h-full text-6xl md:text-7xl font-black italic tracking-tighter text-amber-500 blur-sm -z-10 opacity-50 transform -rotate-2">
                LEGENDARY
             </div>
             
             <div className="flex justify-center gap-2 mt-2">
                <Star className="text-yellow-200 fill-yellow-200 w-6 h-6 animate-bounce" />
                <Star className="text-yellow-200 fill-yellow-200 w-6 h-6 animate-bounce delay-100" />
                <Star className="text-yellow-200 fill-yellow-200 w-6 h-6 animate-bounce delay-200" />
             </div>
        </div>

        {/* Item Display Container */}
        <div className="relative group w-64 h-64 mb-8">
            {/* Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-red-600 rounded-full blur-[50px] opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] opacity-20 animate-ping" />
            
            {/* Spinning Ring */}
            <div className="absolute inset-[-20px] border-2 border-dashed border-amber-500/30 rounded-full animate-spin-slow" />
            <div className="absolute inset-[-40px] border border-amber-500/10 rounded-full animate-spin-slow reverse" />

            {/* The Item */}
            <img 
              src={item.iconUrl} 
              alt={item.name} 
              className="relative w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10 scale-110 group-hover:scale-125 transition-transform duration-500 ease-out" 
            />
            
            {/* Particle Effects (Simple CSS implementation) */}
            <Sparkles className="absolute -top-4 -left-4 text-yellow-200 w-8 h-8 animate-bounce" />
            <Zap className="absolute top-1/2 -right-8 text-amber-400 w-8 h-8 animate-pulse delay-75" />
            <Star className="absolute -bottom-2 right-0 text-orange-300 w-6 h-6 animate-ping delay-150" />
        </div>

        {/* Item Info */}
        <div className="space-y-4 bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10 w-full shadow-2xl">
           <div className="space-y-1">
             <div className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">Супер Редкий Дроп</div>
             <h3 className="text-3xl font-bold text-white drop-shadow-md">{item.name}</h3>
           </div>
           
           <div className="flex items-center justify-center gap-4">
              <div className="bg-amber-950/50 border border-amber-500/30 px-4 py-2 rounded-lg flex flex-col items-center">
                <span className="text-amber-500/70 text-[10px] uppercase font-bold">Шанс</span>
                <span className="text-amber-400 font-mono font-bold text-xl">{item.chance}%</span>
              </div>
           </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="mt-8 group relative px-12 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
          <span className="relative flex items-center gap-2">
            ЗАБРАТЬ НАГРАДУ
          </span>
        </button>

      </div>
    </div>
  );
}
