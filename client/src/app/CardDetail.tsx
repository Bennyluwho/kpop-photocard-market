import { useEffect, useMemo, useState } from 'react';
import { Heart, LoaderCircle, X } from 'lucide-react';
import { fetchCardFeed, fetchCardSummary } from '../api/cards';
import type { CardFeedItem, CardSummary, PriceHistoryEntry } from '../api/types';
import { cardToPhotocardProps, formatAlbumLabel } from '../lib/cardDisplay';
import { CardGrid } from './components/CardGrid';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { PrimaryButton } from './components/PrimaryButton';
import { SecondaryButton } from './components/SecondaryButton';
import { SectionHeader } from './components/SectionHeader';

interface CardDetailProps {
  cardId: string;
}

export default function CardDetail({ cardId }: CardDetailProps) {
  const [summary, setSummary] = useState<CardSummary | null>(null);
  const [similarCards, setSimilarCards] = useState<CardFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCardDetail() {
      setLoading(true);
      setError(null);

      try {
        const cardSummary = await fetchCardSummary(cardId);
        const feed = await fetchCardFeed();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading card detail...
          </div>
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
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error ?? 'Card not found'}. Make sure the API server is running on port 5000.
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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <a href="/#marketplace" className="text-sm text-muted-foreground hover:text-primary">
          Back to marketplace
        </a>

        <section className="mt-6 grid gap-8 lg:grid-cols-[420px_1fr]">
          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <ImageWithFallback
              src={card.imageUrl}
              alt={`${card.idol} - ${albumLabel}`}
              className="aspect-[3/4] h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground">{card.group}</p>
              <h1 className="text-3xl font-semibold md:text-4xl">{card.idol}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{albumLabel}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MarketStat label="Lowest Ask" value={lowestAsk} />
              <MarketStat label="Highest Bid" value={highestBid} fallback="No bids" />
              <MarketStat label="Last Sale" value={lastSale} />
              <MarketStat label="Market Price" value={marketPrice} />
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <PrimaryButton onClick={() => setModalAction('Buy Now')}>Buy Now</PrimaryButton>
              <SecondaryButton onClick={() => setModalAction('Make Offer')}>Make Offer</SecondaryButton>
              <SecondaryButton onClick={() => setModalAction('Sell This Card')}>Sell This Card</SecondaryButton>
              <SecondaryButton onClick={() => setModalAction('Add to Watchlist')} className="flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" />
                Add to Watchlist
              </SecondaryButton>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
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
          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeader title="Price History" />
            {sortedSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No price history has been recorded for this card yet.</p>
            ) : (
              <div className="flex h-52 items-end gap-3 border-b border-border pb-3">
                {sortedSales
                  .slice()
                  .reverse()
                  .map((sale) => (
                    <PriceBar key={sale._id} sale={sale} maxPrice={highestSale ?? sale.price} />
                  ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <SectionHeader title="Recent Sales" />
            {sortedSales.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent sales yet.</p>
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
                        <td className="py-2 text-right font-medium">{formatPrice(sale.price)}</td>
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
          {similarCards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No similar cards found in the current marketplace data.</p>
          ) : (
            <CardGrid>
              {similarCards.map((similarCard) => (
                <PhotocardCard key={similarCard._id} {...cardToPhotocardProps(similarCard)} />
              ))}
            </CardGrid>
          )}
        </section>
      </main>

      {modalAction && <ActionModal action={modalAction} onClose={() => setModalAction(null)} />}
    </div>
  );
}

function MarketStat({ label, value, fallback = '-' }: { label: string; value?: number | null; fallback?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value === null || value === undefined ? fallback : formatPrice(value)}</p>
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
      <div className="text-xs font-medium">{formatPrice(sale.price)}</div>
      <div className="w-full rounded-t bg-primary/80" style={{ height: `${height}%` }} />
      <div className="text-xs text-muted-foreground">{formatShortDate(sale.soldDate)}</div>
    </div>
  );
}

function ActionModal({ action, onClose }: { action: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-background p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{action}</h2>
          <button type="button" aria-label="Close modal" onClick={onClose} className="rounded-lg p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          This action is a placeholder for now. The marketplace flow can be connected in a later phase.
        </p>
        <PrimaryButton onClick={onClose} className="mt-5 w-full">
          Done
        </PrimaryButton>
      </div>
    </div>
  );
}

function formatPrice(value: number) {
  return `$${value}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}
