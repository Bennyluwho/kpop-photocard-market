export interface MarketplaceFilters {
  group: string;
  idol: string;
  album: string;
  rarity: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
}

interface FilterOptions {
  groups: string[];
  idols: string[];
  albums: string[];
  rarities: string[];
  conditions: string[];
}

interface FilterSidebarProps {
  filters: MarketplaceFilters;
  options: FilterOptions;
  onFilterChange: (key: keyof MarketplaceFilters, value: string) => void;
  onClear: () => void;
}

export function FilterSidebar({ filters, options, onFilterChange, onClear }: FilterSidebarProps) {
  return (
    <aside className="rounded-xl border border-border bg-card p-4 lg:sticky lg:top-24">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Filters</h2>
          <p className="text-sm text-muted-foreground">Narrow the marketplace</p>
        </div>
        <button type="button" onClick={onClear} className="text-sm text-muted-foreground hover:text-primary">
          Clear
        </button>
      </div>
      <div className="space-y-4">
        <FilterSelect
          label="Group"
          value={filters.group}
          options={options.groups}
          onChange={(value) => onFilterChange('group', value)}
        />
        <FilterSelect
          label="Idol"
          value={filters.idol}
          options={options.idols}
          onChange={(value) => onFilterChange('idol', value)}
        />
        <FilterSelect
          label="Album"
          value={filters.album}
          options={options.albums}
          onChange={(value) => onFilterChange('album', value)}
        />
        <FilterSelect
          label="Rarity"
          value={filters.rarity}
          options={options.rarities}
          onChange={(value) => onFilterChange('rarity', value)}
        />
        <FilterSelect
          label="Condition"
          value={filters.condition}
          options={options.conditions}
          emptyLabel="No condition data"
          onChange={(value) => onFilterChange('condition', value)}
        />
        <div>
          <span className="mb-1 block text-sm font-medium">Price range</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={filters.minPrice}
              onChange={(event) => onFilterChange('minPrice', event.target.value)}
              placeholder="Min"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              min="0"
              value={filters.maxPrice}
              onChange={(event) => onFilterChange('maxPrice', event.target.value)}
              placeholder="Max"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  emptyLabel?: string;
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, emptyLabel = 'Any', onChange }: FilterSelectProps) {
  const hasOptions = options.length > 0;

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!hasOptions}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{hasOptions ? 'Any' : emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
