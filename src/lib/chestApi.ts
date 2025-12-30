import { ChestFull, ChestRewardItem } from '../types';
import { parseItemPage } from './parseItemPage';
import { parseQuestPage } from './parseQuestPage';

const BASE = 'https://pwdatabase.ru';
async function fetchHtml(url: string) {
  // Use local proxy to avoid CORS and fetch from pwdatabase.ru
  const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export async function loadChest(id: number): Promise<ChestFull> {
  const itemUrl = `${BASE}/items/${id}`;
  const itemHtml = await fetchHtml(itemUrl);
  const itemParsed = parseItemPage(itemHtml, id);

  let rewards: ChestRewardItem[] = [];
  let questPage: string | undefined;
  
  if (itemParsed.firstQuestId) {
    questPage = `${BASE}/tasks/${itemParsed.firstQuestId}`;
    const questHtml = await fetchHtml(questPage);
    rewards = parseQuestPage(questHtml);
  }

  return {
    id,
    name: itemParsed.name,
    description: itemParsed.description,
    iconUrl: itemParsed.iconUrl,
    questId: itemParsed.firstQuestId ?? null,
    rewards,
    sourceUrls: { itemPage: itemUrl, questPage },
  };
}
