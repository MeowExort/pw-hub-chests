import React, { useState } from 'react';
import { useChestStore } from '../state/chestStore';
import { Plus } from 'lucide-react';

export function AddChestForm() {
  const [input, setInput] = useState('');
  const { chestIds, setChestIds } = useChestStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(input.trim());
    if (id && !isNaN(id) && !chestIds.includes(id)) {
      setChestIds([...chestIds, id]);
    }
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-sm">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ID сундука (напр. 38607)"
        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 transition-colors"
      />
      <button
        type="submit"
        className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-indigo-500/30"
      >
        <Plus size={16} />
        Добавить
      </button>
    </form>
  );
}
