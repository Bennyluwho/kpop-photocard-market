import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import type { CardFeedItem, GroupSummary } from '../api/types';
import { cardToPhotocardProps, groupToCardProps } from '../lib/cardDisplay';
import { getCardFeed, getGroups } from '../services/cardApi.js';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { GroupCard } from './components/GroupCard';
import { SearchBar } from './components/SearchBar';
import { SectionHeader } from './components/SectionHeader';
import { CardGrid } from './components/CardGrid';
import { CardSkeletonGrid, EmptyState, ErrorState } from './components/StatusStates';
import Marketplace from './Marketplace';
import CardDetail from './CardDetail';
import SellCard from './SellCard';
import Watchlist from './Watchlist';

const HOMEPAGE_CARD_LIMIT = 18;

function getCurrentRoute() {
  if (window.location.pathname.startsWith('/cards/')) {
    return window.location.pathname;
  }

  if (window.location.pathname === '/sell') {
    return window.location.pathname;
  }

  if (window.location.pathname === '/watchlist') {
    return window.location.pathname;
  }

  return window.location.hash;
}

export default function App() {
  const [page, setPage] = useState(getCurrentRoute);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cards, setCards] = useState<CardFeedItem[]>([]);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => setPage(getCurrentRoute());

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const [feed, groupSummaries] = await Promise.all([
          getCardFeed(debouncedSearch) as Promise<CardFeedItem[]>,
          getGroups() as Promise<GroupSummary[]>,
        ]);

        if (!cancelled) {
          setCards(feed);
          setGroups(groupSummaries);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load marketplace data');
          setCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const trendingCards = useMemo(() => cards.slice(0, HOMEPAGE_CARD_LIMIT), [cards]);

  const recentlyListed = useMemo(
    () => [...cards].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [cards]
  );

  const marketMovers = useMemo(
    () => cards.filter((card) => card.trend === 'up' && card.trendPercent !== null),
    [cards]
  );
  const hasCards = trendingCards.length > 0;
  const cardCountLabel = (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-label="Searching" />}
      {hasCards && `${trendingCards.length} cards`}
    </span>
  );

  if (page === '#marketplace') {
    return <Marketplace />;
  }

  if (page.startsWith('/cards/')) {
    return <CardDetail cardId={page.replace('/cards/', '')} />;
  }

  if (page === '/sell') {
    return <SellCard />;
  }

  if (page === '/watchlist') {
    return <Watchlist />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            The marketplace for K-pop photocards
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg md:text-xl">
            Track prices, discover rare cards, and buy or sell photocards from your favorite idols.
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar value={search} onChange={setSearch} isSearching={loading && Boolean(search)} />
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <section className="px-4 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Trending Photocards" action={cardCountLabel} />
          {loading ? (
            <CardSkeletonGrid />
          ) : !hasCards ? (
            <EmptyState title="No photocards found" message="Try a different idol, group, album, or card name." />
          ) : (
            <CardGrid isLoading={loading}>
              {trendingCards.map((card) => (
                <PhotocardCard key={card._id} {...cardToPhotocardProps(card)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="bg-muted/20 px-4 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Popular Groups" />
          {loading ? (
            <CardSkeletonGrid count={6} />
          ) : groups.length === 0 ? (
            <EmptyState title="No groups found" message="Group summaries will appear after marketplace data loads." />
          ) : (
            <CardGrid variant="groups">
              {groups.map((group) => (
                <GroupCard key={group.name} {...groupToCardProps(group)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="px-4 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Recently Listed" />
          {loading ? (
            <CardSkeletonGrid count={4} />
          ) : recentlyListed.length > 0 ? (
            <CardGrid isLoading={loading}>
              {recentlyListed.slice(0, 4).map((card) => (
                <PhotocardCard key={`recent-${card._id}`} {...cardToPhotocardProps(card)} />
              ))}
            </CardGrid>
          ) : (
            <EmptyState title="No recent listings" message="Newly created listings will show up here." />
          )}
        </div>
      </section>

      <section className="bg-muted/20 px-4 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Market Movers" />
          {loading ? (
            <CardSkeletonGrid count={4} />
          ) : marketMovers.length === 0 ? (
            <EmptyState title="No market movers yet" message="Cards with upward price trends will appear here." />
          ) : (
            <CardGrid isLoading={loading}>
              {marketMovers.map((card) => (
                <PhotocardCard key={`mover-${card._id}`} {...cardToPhotocardProps(card)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2026 K-Card Market. The marketplace for K-pop photocards.</p>
        </div>
      </footer>
    </div>
  );
}
