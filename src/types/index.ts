export type ChestId = number;

export interface ChestSummary {
  id: ChestId;
  name: string;
  description: string;
  iconUrl: string;
  questId: number | null;
}

export interface ChestRewardItem {
  itemId: number;
  name: string;
  iconUrl: string;
  chance: number; // Normalized to sum 100 approx
  link: string;
  uid?: string;
}

export interface InventoryItem {
  item: ChestRewardItem;
  count: number;
}

export interface ChestFull extends ChestSummary {
  rewards: ChestRewardItem[];
  sourceUrls: {
    itemPage: string;
    questPage?: string;
  };
}
