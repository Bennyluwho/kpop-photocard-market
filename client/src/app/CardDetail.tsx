import { useEffect, useMemo, useState } from 'react';
import { Heart, LoaderCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import type { ApiCard, ApiListing } from '../api/types';
import { formatAlbumLabel, getCardImage } from '../lib/cardDisplay';
import { formatCurrency } from '../lib/formatters';
import { getCardById, getCardListings } from '../services/cardApi.js';
import { ImageWithFallback } from './components/ImageWithFallback';
import { Navbar } from './components/Navbar';
import { PrimaryButton } from './components/PrimaryButton';
import { SecondaryLink } from './components/SecondaryButton';
import { SectionHeader } from './components/SectionHeader';
import { DetailSkeleton, EmptyState, ErrorState } from './components/StatusStates';
import { addToCart, isInCart, removeFromCart, subscribeToCart } from './cartStore.js';
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
  const [card, setCard] = useState<ApiCard | null>(null);
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(() => isWatchlisted(cardId));

  useEffect(() => {
    let cancelled = false;

    async function loadCardDetail() {
      setLoading(true);
      setError(null);

      try {
        const [cardResponse, listingResponse] = await Promise.all([
          getCardById(cardId) as Promise<ApiCard>,
          getCardListings(cardId) as Promise<ApiListing[]>,
        ]);

        if (!cancelled) {
          setCard(cardResponse);
          setListings(listingResponse);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load card detail');
          setCard(null);
          setListings([]);
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

  const lowestListing = useMemo(
    () => listings.reduce<number | null>((lowest, listing) => {
      if (lowest === null) {
        return listing.price;
      }

      return Math.min(lowest, listing.price);
    }, null),
    [listings]
  );

  function handleWatchlistToggle() {
    if (!card) {
      return;
    }

    if (saved) {
      removeFromWatchlist(cardId);
      return;
    }

    const album = formatAlbumLabel(card);
    addToWatchlist({
      id: card._id,
      image: getCardImage(card),
      group: card.group,
      idol: card.idol,
      album,
      rarity: card.rarity,
      lowestAsk: lowestListing,
      lastSale: null,
      estimatedMarketValue: lowestListing,
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

  if (error || !card) {
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

            <div className="mb-6 grid grid-cols-2 gap-3">
              <MarketStat label="Active Listings" value={String(listings.length)} />
              <MarketStat label="Lowest Price" value={lowestListing === null ? 'No listings' : formatCurrency(lowestListing)} />
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <PrimaryButton onClick={handleWatchlistToggle}>
                <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved to Watchlist' : 'Add to Watchlist'}
              </PrimaryButton>
              <SecondaryLink href="/sell">Sell This Card</SecondaryLink>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 font-semibold">Official Card Metadata</h2>
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

        <section className="mt-10">
          <SectionHeader title="Available Listings" />
          {listings.length === 0 ? (
            <EmptyState title="No active listings" message="Be the first seller to list this official card." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} card={card} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MarketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold">{value}</p>
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

function ListingCard({ listing, card }: { listing: ApiListing; card: ApiCard }) {
  const imageUrl = listing.userImageUrl || card.imageUrl;
  const [inCart, setInCart] = useState(() => isInCart(listing._id));

  useEffect(() => {
    const refreshCartState = () => setInCart(isInCart(listing._id));
    return subscribeToCart(refreshCartState);
  }, [listing._id]);

  function handleCartToggle() {
    if (inCart) {
      removeFromCart(listing._id);
      return;
    }

    addToCart({
      id: listing._id,
      listingId: listing._id,
      cardId: card._id,
      image: imageUrl,
      group: card.group,
      idol: card.idol,
      album: formatAlbumLabel(card),
      rarity: card.rarity,
      sellerName: listing.sellerName,
      price: listing.price,
      condition: listing.condition,
      description: listing.description,
    });
  }

  return (
    <article className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[120px_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-muted">
        <ImageWithFallback
          src={imageUrl}
          alt={`${card.idol} listing from ${listing.sellerName}`}
          className="aspect-[3/4] h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{listing.sellerName}</p>
            <p className="text-sm text-muted-foreground">{formatDate(listing.createdAt)}</p>
          </div>
          <p className="shrink-0 text-xl font-semibold">{formatCurrency(listing.price)}</p>
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded bg-accent px-2 py-1 text-xs font-medium">
          <ShoppingBag className="h-3.5 w-3.5" />
          {listing.condition}
        </div>

        {listing.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{listing.description}</p>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">No seller description provided.</p>
        )}

        <button
          type="button"
          onClick={handleCartToggle}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ShoppingCart className="h-4 w-4" />
          {inCart ? 'Remove from Cart' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
