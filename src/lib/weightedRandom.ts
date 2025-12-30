import { ChestRewardItem } from '../types';

export function pickByChance(items: ChestRewardItem): ChestRewardItem;
export function pickByChance(items: ChestRewardItem[]): ChestRewardItem;
export function pickByChance(items: ChestRewardItem[], rolls: number): ChestRewardItem | ChestRewardItem[];
export function pickByChance(items: ChestRewardItem[] | ChestRewardItem, rolls = 1) {
  if (!Array.isArray(items)) return items;
  
  const arr = items as ChestRewardItem[];
  if (arr.length === 0) return [];
  
  const total = arr.reduce((s, i) => s + i.chance, 0);
  if (total <= 0) return Array(rolls).fill(arr[0]);

  // Create Cumulative Distribution Function
  const cdf: { i: ChestRewardItem; c: number }[] = [];
  let acc = 0;
  for (const item of arr) {
    acc += item.chance / total; 
    cdf.push({ i: item, c: acc });
  }

  const results: ChestRewardItem[] = [];
  for (let r = 0; r < rolls; r++) {
    const x = Math.random();
    // find first element where c >= x
    const found = cdf.find(e => x <= e.c);
    results.push(found ? found.i : arr[arr.length - 1]);
  }
  return rolls === 1 ? results[0] : results;
}
