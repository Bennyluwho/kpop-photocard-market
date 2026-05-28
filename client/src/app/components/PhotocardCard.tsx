import { ImageWithFallback } from './ImageWithFallback';
import { PriceStat } from './PriceStat';

interface PhotocardCardProps {
  id?: string;
  image: string;
  group: string;
  idol: string;
  album: string;
  rarity: string;
  lowestAsk?: number | null;
  lastSale?: number | null;
  trend?: 'up' | 'down' | null;
  trendPercent?: number | null;
}

export function PhotocardCard({
  id,
  image,
  group,
  idol,
  album,
  rarity,
  lowestAsk,
  lastSale,
  trend,
  trendPercent,
}: PhotocardCardProps) {
  const cardContent = (
    <>
      <div className="aspect-[3/4] bg-muted overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={`${idol} - ${album}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{group}</p>
            <h3 className="font-medium">{idol}</h3>
            <p className="text-sm text-muted-foreground">{album}</p>
          </div>
          <span className="text-xs bg-accent px-2 py-1 rounded">{rarity}</span>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="mb-1">
            <PriceStat label="Est. Value" value={lowestAsk} />
          </div>
          <PriceStat
            label="Last Sale"
            value={lastSale}
            trend={trend}
            trendPercent={trendPercent}
            valueClassName="text-sm"
          />
        </div>
      </div>
    </>
  );

  if (id) {
    return (
      <a
        href={`/cards/${id}`}
        className="block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      {cardContent}
    </div>
  );
}
