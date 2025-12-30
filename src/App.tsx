import { useEffect, useRef } from 'react';
import { useChestStore } from './state/chestStore';
import { useGlobalStatsStore, initGlobalStatsSync } from './state/globalStatsStore';
import { LayoutDashboard } from './layouts/LayoutDashboard';
import { LayoutLottery } from './layouts/LayoutLottery';
import { NotificationManager } from './components/NotificationManager';
import { RecentDropsCarousel } from './components/RecentDropsCarousel';
import { LayoutDashboard as DashboardIcon, Ticket, Sun, Moon, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function App() {
  const { layout, setLayout, theme, toggleTheme, data } = useChestStore();
  const { totalOpened, mostPopularChestId } = useGlobalStatsStore();
  const isFirstRun = useRef(true);

  // Sync Global Stats
  useEffect(() => {
     return initGlobalStatsSync();
  }, []);

  const popularChest = mostPopularChestId ? data[mostPopularChestId] : null;

  const handlePopularClick = () => {
    if (!mostPopularChestId) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'lottery');
    url.searchParams.set('id', String(mostPopularChestId));
    window.history.pushState({}, '', url);
    
    setLayout('lottery');
    // Dispatch popstate to notify components listening to history changes (like LayoutLottery)
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Sync theme changes to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle URL <-> Layout Sync
  useEffect(() => {
    // 1. Initial Load: Check URL priority over Store
    if (isFirstRun.current) {
      isFirstRun.current = false;
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      
      if (view === 'lottery' || view === 'dashboard') {
        // If URL differs from Store, update Store and skip URL overwrite
        if (layout !== view) {
          setLayout(view);
          return;
        }
      }
    }

    // 2. State -> URL Update (Normal sync)
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') !== layout) {
      params.set('view', layout);
      window.history.pushState(null, '', `?${params.toString()}`);
    }
  }, [layout, setLayout]);

  // 3. Handle Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const v = p.get('view');
      if (v === 'lottery' || v === 'dashboard') {
        setLayout(v);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setLayout]);

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300 overflow-hidden">
      <header className="flex-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-20 transition-colors duration-300">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-auto px-3 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap">PW Hub</div>
             <h1 className="font-semibold text-lg hidden sm:block tracking-tight">Симулятор сундуков</h1>
             
             {/* Global Counter */}
             <div className="hidden lg:flex items-center gap-2 ml-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Открыто всего:</span>
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono min-w-[20px] text-center">{totalOpened.toLocaleString('ru-RU')}</span>
             </div>

             {/* Most Popular Chest */}
             {mostPopularChestId && (
               <button 
                 onClick={handlePopularClick}
                 className="hidden xl:flex items-center gap-2 ml-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors group cursor-pointer"
                 title="Самый популярный сундук"
               >
                  <Sparkles size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Популярное:</span>
                  <div className="flex items-center gap-1">
                     {popularChest?.iconUrl && <img src={popularChest.iconUrl} className="w-4 h-4 rounded-sm" alt="" />}
                     <span className="text-sm font-bold text-amber-700 dark:text-amber-300 max-w-[150px] truncate">
                       {popularChest?.name || `ID: ${mostPopularChestId}`}
                     </span>
                  </div>
               </button>
             )}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg border dark:border-white/5">
                <button 
                  onClick={() => setLayout('dashboard')}
                  className={clsx(
                    "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                    layout === 'dashboard' 
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                  )}
                >
                  <DashboardIcon size={16} />
                  <span className="hidden sm:inline">Дашборд</span>
                </button>
                <button 
                  onClick={() => setLayout('lottery')}
                  className={clsx(
                    "px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all",
                    layout === 'lottery' 
                      ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                      : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"
                  )}
                >
                  <Ticket size={16} />
                  <span className="hidden sm:inline">Лотерея</span>
                </button>
             </div>

             <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                title={theme === 'light' ? "Включить темную тему" : "Включить светлую тему"}
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
          </div>
        </div>
      </header>

      <RecentDropsCarousel />

      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4">
         {layout === 'dashboard' ? <LayoutDashboard /> : <LayoutLottery />}
      </main>

      <NotificationManager />

      <footer className="flex-none py-2 text-center text-[10px] text-gray-400 dark:text-zinc-600 border-t border-gray-200 dark:border-white/5">
         <p>Данные предоставлены <a href="https://pwdatabase.ru" target="_blank" className="text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 group-hover:opacity-100 transition-opacity whitespace-nowrap">pwdatabase.ru</a>. Проект создан в образовательных целях благодаря <a href="https://t.me/profgunpw" target="_blank" className="text-[10px] text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 group-hover:opacity-100 transition-opacity whitespace-nowrap">профсоюзу стрелков [tg]</a> .</p>
      </footer>
    </div>
  );
}
