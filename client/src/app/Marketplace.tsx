import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { fetchCardFeed } from '../api/cards';
import type { CardFeedItem } from '../api/types';
import { cardToPhotocardProps } from '../lib/cardDisplay';
import { CardGrid } from './components/CardGrid';
import { FilterSidebar, type MarketplaceFilters } from './components/FilterSidebar';
import { Navbar } from './components/Navbar';
import { PhotocardCard } from './components/PhotocardCard';
import { SearchBar } from './components/SearchBar';
import { SectionHeader } from './components/SectionHeader';

type SortOption = 'trending' | 'lowestAsk' | 'highestSale' | 'newest';

const initialFilters: MarketplaceFilters = {
  group: '',
  idol: '',
  album: '',
  rarity: '',
  condition: '',
  minPrice: '',
  maxPrice: '',
};

export default function Marketplace() {
  const [cards, setCards] = useState<CardFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>('trending');

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      setLoading(true);
      setError(null);

      try {
        const feed = await fetchCardFeed();

        if (!cancelled) {
          setCards(feed);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load marketplace cards');
          setCards([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(
    () => ({
      groups: getUniqueValues(cards, 'group'),
      idols: getUniqueValues(cards, 'idol'),
      albums: getUniqueValues(cards, 'album'),
      rarities: getUniqueValues(cards, 'rarity'),
      conditions: getUniqueValues(cards, 'condition'),
    }),
    [cards]
  );

  const visibleCards = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const minPrice = Number(filters.minPrice);
    const maxPrice = Number(filters.maxPrice);

    return cards
      .filter((card) => {
        const searchText = [
          card.group,
          card.idol,
          card.album,
          card.version,
          card.rarity,
          card.condition,
          ...card.aliases,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const cardPrice = card.lowestAsk ?? card.estimatedMarketValue ?? 0;

        return (
          (!normalizedSearch || searchText.includes(normalizedSearch)) &&
          (!filters.group || card.group === filters.group) &&
          (!filters.idol || card.idol === filters.idol) &&
          (!filters.album || card.album === filters.album) &&
          (!filters.rarity || card.rarity === filters.rarity) &&
          (!filters.condition || card.condition === filters.condition) &&
          (!filters.minPrice || cardPrice >= minPrice) &&
          (!filters.maxPrice || cardPrice <= maxPrice)
        );
      })
      .sort((a, b) => sortCards(a, b, sort));
  }, [cards, filters, search, sort]);

  const resultLabel = `${visibleCards.length} ${visibleCards.length === 1 ? 'card' : 'cards'}`;

  function handleFilterChange(key: keyof MarketplaceFilters, value: string) {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold md:text-4xl">Browse Photocards</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Search, filter, and sort photocard listings.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}. Make sure the API server is running on port 5000.
          </div>
        )}

        <div className="mb-6 grid items-center gap-3 border-b border-border pb-4 lg:grid-cols-[1fr_auto]">
          <SearchBar value={search} onChange={setSearch} size="compact" />
          <label className="flex items-center gap-2 justify-self-start lg:justify-self-end">
            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">Sort by:</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="h-10 w-36 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="trending">Trending</option>
              <option value="lowestAsk">Lowest Ask</option>
              <option value="highestSale">Highest Sale</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <FilterSidebar
            filters={filters}
            options={filterOptions}
            onFilterChange={handleFilterChange}
            onClear={() => setFilters(initialFilters)}
          />

          <section>
            <SectionHeader
              title="All Photocards"
              action={
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-label="Loading cards" />}
                  {resultLabel}
                </span>
              }
            />
            {loading ? (
              <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
                Loading cards...
              </div>
            ) : visibleCards.length === 0 ? (
              <div className="flex min-h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center">
                <div>
                  <h2 className="font-semibold">No cards match your filters</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Try clearing filters or searching another idol.</p>
                </div>
              </div>
            ) : (
              <CardGrid>
                {visibleCards.map((card) => (
                  <PhotocardCard key={card._id} {...cardToPhotocardProps(card)} />
                ))}
              </CardGrid>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function getUniqueValues<Key extends keyof CardFeedItem>(cards: CardFeedItem[], key: Key) {
  return Array.from(new Set(cards.map((card) => card[key]).filter(Boolean).map(String))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function sortCards(a: CardFeedItem, b: CardFeedItem, sort: SortOption) {
  if (sort === 'lowestAsk') {
    return getPrice(a.lowestAsk, Number.MAX_SAFE_INTEGER) - getPrice(b.lowestAsk, Number.MAX_SAFE_INTEGER);
  }

  if (sort === 'highestSale') {
    return getPrice(b.lastSale, 0) - getPrice(a.lastSale, 0);
  }

  if (sort === 'newest') {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  return (b.trendPercent ?? 0) - (a.trendPercent ?? 0);
}

function getPrice(value: number | null | undefined, fallback: number) {
  return value ?? fallback;
}
