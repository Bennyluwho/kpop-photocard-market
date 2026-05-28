import { LoaderCircle, Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  size?: 'default' | 'compact';
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by idol, group, album, or card…',
  isSearching = false,
  size = 'default',
}: SearchBarProps) {
  const inputClasses =
    size === 'compact'
      ? 'rounded-lg py-2.5 pl-10 pr-10 text-sm'
      : 'rounded-xl py-4 pl-12 pr-12';
  const iconClasses =
    size === 'compact'
      ? 'left-3 h-4 w-4'
      : 'left-4 h-5 w-5';
  const spinnerClasses =
    size === 'compact'
      ? 'right-3 h-4 w-4'
      : 'right-4 h-5 w-5';

  return (
    <div className="relative">
      <Search className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${iconClasses}`} />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${inputClasses}`}
      />
      {isSearching && (
        <LoaderCircle
          className={`absolute top-1/2 -translate-y-1/2 animate-spin text-muted-foreground ${spinnerClasses}`}
          aria-label="Searching"
        />
      )}
    </div>
  );
}
