
export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full bg-gray-200 dark:bg-zinc-800 rounded overflow-hidden transition-colors">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-[width] duration-300 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
