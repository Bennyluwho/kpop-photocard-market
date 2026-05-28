import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { fetchCardFeed, fetchGroups } from '../api/cards';
import type { CardFeedItem, GroupSummary } from '../api/types';
import { cardToPhotocardProps, groupToCardProps } from '../lib/cardDisplay';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { GroupCard } from './components/GroupCard';
import { SearchBar } from './components/SearchBar';
import { SectionHeader } from './components/SectionHeader';
import { CardGrid } from './components/CardGrid';
import Marketplace from './Marketplace';
import CardDetail from './CardDetail';

function getCurrentRoute() {
  if (window.location.pathname.startsWith('/cards/')) {
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
          fetchCardFeed(debouncedSearch),
          fetchGroups(),
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

  const trendingCards = useMemo(() => cards, [cards]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-gradient-to-b from-background to-muted/20 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
            The marketplace for K-pop photocards
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Track prices, discover rare cards, and buy or sell photocards from your favorite idols.
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar value={search} onChange={setSearch} isSearching={loading && Boolean(search)} />
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-4 -mt-8 mb-4">
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}. Make sure the API server is running on port 5000.
          </p>
        </div>
      )}

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Trending Photocards" action={cardCountLabel} />
          {!hasCards ? (
            <div className="min-h-80 transition-opacity duration-200">
              {!loading && <p className="text-muted-foreground">No photocards match your search.</p>}
            </div>
          ) : (
            <CardGrid isLoading={loading}>
              {trendingCards.map((card) => (
                <PhotocardCard key={card._id} {...cardToPhotocardProps(card)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Popular Groups" />
          {groups.length === 0 && !loading ? (
            <p className="text-muted-foreground">No groups found.</p>
          ) : (
            <CardGrid variant="groups">
              {groups.map((group) => (
                <GroupCard key={group.name} {...groupToCardProps(group)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Recently Listed" />
          {recentlyListed.length > 0 && (
            <CardGrid isLoading={loading}>
              {recentlyListed.slice(0, 4).map((card) => (
                <PhotocardCard key={`recent-${card._id}`} {...cardToPhotocardProps(card)} />
              ))}
            </CardGrid>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Market Movers" />
          {!loading && marketMovers.length === 0 ? (
            <p className="text-muted-foreground">No upward price trends yet.</p>
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
