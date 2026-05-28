import type { CardFeedItem } from "../api/types";

const GROUP_IMAGES: Record<string, string> = {
  BTS: "https://images.unsplash.com/photo-1583795484071-3c453e3a7c71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  BLACKPINK:
    "https://images.unsplash.com/photo-1575644584057-2252ca5408de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  NewJeans:
    "https://images.unsplash.com/photo-1566477712363-3c75dd39b416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  TWICE:
    "https://images.unsplash.com/photo-1520242739010-44e95bde329e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  SEVENTEEN:
    "https://images.unsplash.com/photo-1615040828700-db6eb9616c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  IVE: "https://images.unsplash.com/photo-1609102026400-3c0ca378e4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

const CARD_PLACEHOLDER =
  "https://images.unsplash.com/photo-1613294022243-c1732e7af9ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function getCardImage(card: Pick<CardFeedItem, "imageUrl" | "group">) {
  return card.imageUrl || GROUP_IMAGES[card.group] || CARD_PLACEHOLDER;
}

export function formatAlbumLabel(card: Pick<CardFeedItem, "album" | "version">) {
  return card.version ? `${card.album} · ${card.version}` : card.album;
}

export function cardToPhotocardProps(card: CardFeedItem) {
  const image = getCardImage(card);
  const album = formatAlbumLabel(card);

  return {
    id: card._id,
    image,
    group: card.group,
    idol: card.idol,
    album,
    rarity: card.rarity,
    lowestAsk: card.lowestAsk,
    lastSale: card.lastSale,
    trend: card.trend,
    trendPercent: card.trendPercent,
    watchlistItem: {
      id: card._id,
      image,
      group: card.group,
      idol: card.idol,
      album,
      rarity: card.rarity,
      lowestAsk: card.lowestAsk,
      lastSale: card.lastSale,
      trend: card.trend,
      trendPercent: card.trendPercent,
      estimatedMarketValue: card.estimatedMarketValue,
    },
  };
}

export function groupToCardProps(group: { name: string; cardCount: number }) {
  return {
    name: group.name,
    image: GROUP_IMAGES[group.name] ?? CARD_PLACEHOLDER,
    cardCount: group.cardCount,
    href: `/?group=${encodeURIComponent(group.name)}#marketplace`,
  };
}
