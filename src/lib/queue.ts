export function createQueue(limit: number) {
  let active = 0;
  const q: (() => Promise<void>)[] = [];
  
  const runNext = () => {
    if (active >= limit || q.length === 0) return;
    active++;
    const job = q.shift()!;
    job().finally(() => {
      active--;
      runNext();
    });
  };

  return function enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      q.push(async () => {
        try { resolve(await task()); }
        catch (e) { reject(e); }
      });
      runNext();
    });
  };
}
