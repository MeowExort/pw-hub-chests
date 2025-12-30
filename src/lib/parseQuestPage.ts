import { ChestRewardItem } from '../types';

export function parseQuestPage(html: string): ChestRewardItem[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Ищем заголовок секции
  const headings = Array.from(doc.querySelectorAll('.mb-3'));
  const heading = headings.find(h => /Награда за успешное выполнение/i.test(h.textContent || ''));
  
  if (!heading) return [];

  // Берём следующий контейнер с таблицей/списком
  let container = heading.nextElementSibling;

  console.log(container);
  
  // If heading is inside a table cell/row, we might need to look at table body
  if (!container && heading.tagName === 'TH') {
      container = heading.closest('table');
  }
  
  if (!container) {
      // Try to find parent's sibling
      container = heading.parentElement?.nextElementSibling || null;
  }
  
  if (!container) return [];

  const items: ChestRewardItem[] = [];
  let rows = Array.from(container.querySelectorAll('tr, li, .row'));

  // Support for new layout (div.mt-3 inside container)
  if (rows.length === 0) {
    const mt3 = container.querySelector('.mt-3');
    if (mt3) {
      rows = Array.from(mt3.children).filter(el => el.tagName === 'DIV');
    }
  }
  
  rows.forEach((row) => {
    const links = Array.from(row.querySelectorAll('a[href*="/items/"]')) as HTMLAnchorElement[];
    // Try to find a link with text (name), otherwise fallback to the first one (likely icon wrapper)
    const link = links.find(l => (l.textContent?.trim().length || 0) > 0) || links[0];
    
    if (!link) return;
    
    const match = link.href.match(/items\/(\d+)/);
    const itemId = match ? Number(match[1]) : 0;
    
    let name = link.textContent?.trim() || `Предмет #${itemId}`;
    // Remove percentage chance from name (e.g. "Item [10%]" -> "Item")
    name = name.replace(/\s*[\[\(]?\d+[\.,]?\d*\s*%[\]\)]?$/g, '').trim();
    
    const img = row.querySelector('img') as HTMLImageElement | null;
    let iconUrl = '';
    if (img) {
      const src = img.getAttribute('src') || '';
      const fullUrl = src.startsWith('http') 
        ? src 
        : `https://pwdatabase.ru${src.startsWith('/') ? '' : '/'}${src}`;
      iconUrl = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
    }

    // Ищем число шанса
    const text = row.textContent || '';
    const m = text.match(/(\d+[\.,]?\d*)\s*%/);
    const chance = m ? parseFloat(m[1].replace(',', '.')) : NaN;

    if (!isNaN(chance) && itemId > 0) {
        items.push({ itemId, name, iconUrl, chance, link: link.href });
    }
  });

  // Normalize
  const sum = items.reduce((s, i) => s + i.chance, 0);
  if (sum > 0 && Math.abs(sum - 100) > 1) {
    items.forEach(i => i.chance = (i.chance / sum) * 100);
  }

  return items;
}
