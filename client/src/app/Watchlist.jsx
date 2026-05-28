import { useEffect, useMemo, useState } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { CardGrid } from './components/CardGrid';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { PrimaryLink } from './components/PrimaryButton';
import { SecondaryButton, SecondaryLink } from './components/SecondaryButton';
import { SectionHeader } from './components/SectionHeader';
import { EmptyState } from './components/StatusStates';
import { formatCurrency } from '../lib/formatters';
import { getWatchlist, removeFromWatchlist, saveWatchlist, subscribeToWatchlist } from './watchlistStore.js';

function getCardValue(card) {
  return card.estimatedMarketValue ?? card.lowestAsk ?? card.lastSale ?? 0;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState(() => getWatchlist());

  useEffect(() => {
    const refreshWatchlist = () => setWatchlist(getWatchlist());
    return subscribeToWatchlist(refreshWatchlist);
  }, []);

  const estimatedTotal = useMemo(
    () => watchlist.reduce((total, card) => total + getCardValue(card), 0),
    [watchlist]
  );

  function handleRemove(cardId) {
    setWatchlist(removeFromWatchlist(cardId));
  }

  function handleClearAll() {
    saveWatchlist([]);
    setWatchlist([]);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Heart className="h-4 w-4 fill-current" />
            Local watchlist
          </p>
          <h1 className="text-3xl font-semibold leading-tight md:text-4xl">Saved Photocards</h1>
          <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
            Cards saved in this browser for quick demo tracking.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Saved cards</p>
            <p className="mt-2 text-2xl font-semibold">{watchlist.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:col-span-2">
            <p className="text-sm text-muted-foreground">Estimated total value</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(estimatedTotal)}</p>
          </div>
        </div>

        <SectionHeader
          title="Watchlist"
          action={
            <div className="flex flex-wrap gap-2">
              <SecondaryLink href="/sell">Sell or List</SecondaryLink>
              {watchlist.length > 0 && (
                <SecondaryButton type="button" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </SecondaryButton>
              )}
            </div>
          }
        />

        {watchlist.length === 0 ? (
          <EmptyState
            title="No saved cards yet"
            message="Tap the heart on any photocard to save it here."
            action={
              <PrimaryLink href="/#marketplace">
                Browse photocards
              </PrimaryLink>
            }
          />
        ) : (
          <CardGrid>
            {watchlist.map((card) => (
              <PhotocardCard
                key={card.id}
                id={card.id}
                image={card.image}
                group={card.group}
                idol={card.idol}
                album={card.album}
                rarity={card.rarity}
                lowestAsk={card.estimatedMarketValue ?? card.lowestAsk}
                lastSale={card.lastSale}
                trend={card.trend}
                trendPercent={card.trendPercent}
                watchlistItem={card}
                onRemove={handleRemove}
              />
            ))}
          </CardGrid>
        )}
      </main>
    </div>
  );
}
