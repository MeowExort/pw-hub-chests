import { useState } from 'react';
import { ChestList } from '../components/ChestList';
import { ChestOpenSimulator } from '../components/ChestOpenSimulator';
import { AddChestForm } from '../components/AddChestForm';
import { ChestLoader } from '../components/ChestLoader';
import { SessionInventory } from '../components/SessionInventory';

export function LayoutDashboard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-full gap-4 items-stretch">
      {/* LEFT COLUMN: Chests */}
      <div className="w-full lg:w-80 flex-none flex flex-col h-72 lg:h-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex-none bg-inherit z-10">
           <h3 className="text-lg font-bold mb-3 dark:text-zinc-100">Сундуки</h3>
           <div className="mb-2">
             <AddChestForm />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
           <ChestList selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>

      {/* MIDDLE COLUMN: Simulator */}
      <div className="flex-1 flex flex-col w-full h-auto lg:h-full min-w-0 gap-4">
        <div className="flex-none">
          <ChestLoader />
        </div>
        
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors overflow-hidden flex flex-col">
           <div className="p-4 border-b border-gray-100 dark:border-white/5 flex-none">
              <h3 className="text-lg font-bold dark:text-zinc-100">Симулятор</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 min-h-[400px] lg:min-h-0">
             {selectedId ? (
               <ChestOpenSimulator selectedId={selectedId} onSelect={setSelectedId} compact displayMode="grid" />
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 opacity-60">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full mb-4 transition-colors" />
                  <p>Выберите сундук слева, чтобы начать</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Inventory */}
      <div className="w-full lg:w-80 flex-none flex flex-col h-72 lg:h-full bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors overflow-hidden">
          <SessionInventory variant="panel" />
      </div>
    </div>
  );
}
