export interface ApiCard {
  _id: string;
  group: string;
  idol: string;
  album: string;
  version: string;
  cardType: string;
  rarity: string;
  condition?: string;
  imageUrl: string;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CardFeedItem extends ApiCard {
  estimatedMarketValue: number | null;
  lowestAsk: number | null;
  lastSale: number | null;
  trend: "up" | "down" | null;
  trendPercent: number | null;
  priceCount: number;
}

export interface GroupSummary {
  name: string;
  cardCount: number;
}

export interface PriceHistoryEntry {
  _id: string;
  cardId: string;
  price: number;
  source: string;
  condition: string;
  soldDate: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardSummary {
  card: ApiCard;
  estimatedMarketValue: number | null;
  priceCount: number;
  method: string;
  priceHistory: PriceHistoryEntry[];
}
