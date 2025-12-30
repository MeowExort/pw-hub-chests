export function parseItemPage(html: string, chestId: number) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const title = doc.querySelector('h1, .item .title, .content h1')?.textContent?.trim() || `Сундук #${chestId}`;

  const description =
    doc.querySelector('.item .desc, .item-description, .content .desc, #desc')?.textContent?.trim() || '';

  const rawIconUrl = `https://pwdatabase.ru/icons/items/${chestId}.png`;
  const iconUrl = `/api/proxy?url=${encodeURIComponent(rawIconUrl)}`;

  // Находим первую ссылку на tasks
  const links = Array.from(doc.querySelectorAll('a[href*="/tasks/"]'));
  const firstQuestLink = links[0] as HTMLAnchorElement | undefined;
  
  const firstQuestId = firstQuestLink ? Number(firstQuestLink.href.match(/tasks\/(\d+)/)?.[1]) : undefined;

  return { name: title, description, iconUrl, firstQuestId };
}
