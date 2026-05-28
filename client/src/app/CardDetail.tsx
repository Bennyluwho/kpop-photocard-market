import { useEffect, useMemo, useState } from 'react';
import { Heart, LoaderCircle } from 'lucide-react';
import type { CardFeedItem, CardSummary, PriceHistoryEntry } from '../api/types';
import { cardToPhotocardProps, formatAlbumLabel, getCardImage } from '../lib/cardDisplay';
import { formatCurrency } from '../lib/formatters';
import { getCardFeed, getCardSummary } from '../services/cardApi.js';
import { CardGrid } from './components/CardGrid';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { PrimaryButton } from './components/PrimaryButton';
import { SecondaryLink } from './components/SecondaryButton';
import { SectionHeader } from './components/SectionHeader';
import { CardSkeletonGrid, DetailSkeleton, EmptyState, ErrorState } from './components/StatusStates';
import {
  addToWatchlist,
  isWatchlisted,
  removeFromWatchlist,
  subscribeToWatchlist,
} from './watchlistStore.js';

interface CardDetailProps {
  cardId: string;
}

export default function CardDetail({ cardId }: CardDetailProps) {
  const [summary, setSummary] = useState<CardSummary | null>(null);
  const [similarCards, setSimilarCards] = useState<CardFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(() => isWatchlisted(cardId));

  useEffect(() => {
    let cancelled = false;

    async function loadCardDetail() {
      setLoading(true);
      setError(null);

      try {
        const cardSummary = await getCardSummary(cardId) as CardSummary;
        const feed = await getCardFeed() as CardFeedItem[];

        if (!cancelled) {
          setSummary(cardSummary);
          setSimilarCards(
            feed
              .filter((card) => card._id !== cardId && card.group === cardSummary.card.group)
              .slice(0, 4)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load card detail');
          setSummary(null);
          setSimilarCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCardDetail();

    return () => {
      cancelled = true;
    };
  }, [cardId]);

  useEffect(() => {
    const updateSavedState = () => setSaved(isWatchlisted(cardId));
    updateSavedState();
    return subscribeToWatchlist(updateSavedState);
  }, [cardId]);

  const sortedSales = useMemo(
    () =>
      [...(summary?.priceHistory ?? [])].sort(
        (a, b) => new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()
      ),
    [summary]
  );
  const lastSale = sortedSales[0]?.price ?? null;
  const highestSale = sortedSales.length ? Math.max(...sortedSales.map((sale) => sale.price)) : null;
  const lowestAsk = summary?.estimatedMarketValue ?? null;
  const marketPrice = summary?.estimatedMarketValue ?? null;
  const highestBid = null;

  function handleWatchlistToggle() {
    if (!summary) {
      return;
    }

    if (saved) {
      removeFromWatchlist(cardId);
      return;
    }

    const detailCard = summary.card;
    addToWatchlist({
      id: detailCard._id,
      image: getCardImage(detailCard),
      group: detailCard.group,
      idol: detailCard.idol,
      album: formatAlbumLabel(detailCard),
      rarity: detailCard.rarity,
      lowestAsk,
      lastSale,
      estimatedMarketValue: marketPrice,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading card detail
          </div>
          <DetailSkeleton />
        </main>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10">
          <a href="/#marketplace" className="text-sm text-muted-foreground hover:text-primary">
            Back to marketplace
          </a>
          <div className="mt-6">
            <ErrorState message={error ?? 'Card not found'} />
          </div>
        </main>
      </div>
    );
  }

  const card = summary.card;
  const albumLabel = formatAlbumLabel(card);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <a href="/#marketplace" className="text-sm text-muted-foreground hover:text-primary">
          Back to marketplace
        </a>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(280px,420px)_1fr]">
          <div className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
            <ImageWithFallback
              src={card.imageUrl}
              alt={`${card.idol} - ${albumLabel}`}
              className="aspect-[3/4] h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground">{card.group}</p>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{card.idol}</h1>
              <p className="mt-2 text-base leading-7 text-muted-foreground sm:text-lg">{albumLabel}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MarketStat label="Lowest Ask" value={lowestAsk} />
              <MarketStat label="Highest Bid" value={highestBid} fallback="No bids" />
              <MarketStat label="Last Sale" value={lastSale} />
              <MarketStat label="Market Price" value={marketPrice} />
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <PrimaryButton onClick={handleWatchlistToggle}>
                <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved to Watchlist' : 'Add to Watchlist'}
              </PrimaryButton>
              <SecondaryLink href="/watchlist">View Watchlist</SecondaryLink>
              <SecondaryLink href="/sell" className="sm:col-span-2">Sell or List a Card</SecondaryLink>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 font-semibold">Card Metadata</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <MetadataItem label="Group" value={card.group} />
                <MetadataItem label="Idol" value={card.idol} />
                <MetadataItem label="Album" value={card.album} />
                <MetadataItem label="Version" value={card.version || 'Standard'} />
                <MetadataItem label="Rarity" value={card.rarity} />
                <MetadataItem label="Type" value={card.cardType} />
              </dl>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <SectionHeader title="Price History" />
            {sortedSales.length === 0 ? (
              <EmptyState title="No price history" message="No price history has been recorded for this card yet." />
            ) : (
              <div className="flex h-52 items-end gap-3 overflow-x-auto border-b border-border pb-3">
                {sortedSales
                  .slice()
                  .reverse()
                  .map((sale) => (
                    <PriceBar key={sale._id} sale={sale} maxPrice={highestSale ?? sale.price} />
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <SectionHeader title="Recent Sales" />
            {sortedSales.length === 0 ? (
              <EmptyState title="No recent sales" message="Completed sales will show here when available." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="py-2 font-medium">Date</th>
                      <th className="py-2 font-medium">Condition</th>
                      <th className="py-2 text-right font-medium">Sale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSales.slice(0, 8).map((sale) => (
                      <tr key={sale._id} className="border-b border-border last:border-0">
                        <td className="py-2">{formatDate(sale.soldDate)}</td>
                        <td className="py-2 text-muted-foreground">{sale.condition}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(sale.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeader title="Similar Cards" />
          {loading ? (
            <CardSkeletonGrid count={4} />
          ) : similarCards.length === 0 ? (
            <EmptyState title="No similar cards" message="No similar cards were found in the current marketplace data." />
          ) : (
            <CardGrid>
              {similarCards.map((similarCard) => (
                <PhotocardCard key={similarCard._id} {...cardToPhotocardProps(similarCard)} />
              ))}
            </CardGrid>
          )}
        </section>
      </main>

    </div>
  );
}

function MarketStat({ label, value, fallback = '-' }: { label: string; value?: number | null; fallback?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold">{value === null || value === undefined ? fallback : formatCurrency(value)}</p>
    </div>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function PriceBar({ sale, maxPrice }: { sale: PriceHistoryEntry; maxPrice: number }) {
  const height = Math.max(16, (sale.price / maxPrice) * 100);

  return (
    <div className="flex flex-1 flex-col items-center justify-end gap-2">
      <div className="text-xs font-medium">{formatCurrency(sale.price)}</div>
      <div className="min-w-10 rounded-t bg-primary/80" style={{ height: `${height}%` }} />
      <div className="text-xs text-muted-foreground">{formatShortDate(sale.soldDate)}</div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}
